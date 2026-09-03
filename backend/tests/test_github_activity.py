"""Tests for github_activity: contribution grid math, parsers, cache, and the
GraphQL -> public-profile fallback that powers the production activity feed.
"""

import asyncio
from datetime import date, datetime, timedelta, timezone

import httpx
import pytest

from app import github_activity


def graphql_payload(total=12):
    return {
        "data": {
            "user": {
                "contributionsCollection": {
                    "contributionCalendar": {
                        "totalContributions": total,
                        "weeks": [],
                    }
                }
            }
        }
    }


def public_profile_html(year_range, day_entries_text=""):
    first = (year_range["start"] + timedelta(days=3)).isoformat()
    return (
        "<html><body>"
        f'<span class="ContributionCalendar-day" data-date="{first}" data-level="4">'
        f"<tool-tip>{day_entries_text}</tool-tip></span>"
        f"<span>1,234 contributions in {year_range['year']}</span>"
        "</body></html>"
    )


class FakeResponse:
    def __init__(self, *, status_code=200, text="", json_data=None):
        self.status_code = status_code
        self._text = text
        self._json_data = json_data

    def raise_for_status(self):
        if self.status_code >= 400:
            raise httpx.HTTPStatusError("request failed", request=None, response=None)

    def json(self):
        return self._json_data

    @property
    def text(self):
        return self._text


class FakeAsyncClient:
    def __init__(self, get=None, post=None):
        self._get = list(get or [])
        self._post = list(post or [])
        self.get_calls = 0
        self.post_calls = 0

    async def __aenter__(self):
        return self

    async def __aexit__(self, *exc):
        return False

    async def get(self, url, **kwargs):
        self.get_calls += 1
        if not self._get:
            raise AssertionError(f"Unexpected GET {url}")
        return self._get.pop(0)

    async def post(self, url, **kwargs):
        self.post_calls += 1
        if not self._post:
            raise AssertionError(f"Unexpected POST {url}")
        return self._post.pop(0)


@pytest.fixture(autouse=True)
def clear_cache():
    github_activity._activity_cache.clear()
    yield
    github_activity._activity_cache.clear()


@pytest.fixture
def install_fake_client(monkeypatch):
    def _install(client):
        monkeypatch.setattr(httpx, "AsyncClient", lambda **kwargs: client)
        return client

    return _install


def test_level_mapping_and_unknown_values():
    assert github_activity._level_from_graphql("NONE") == 0
    assert github_activity._level_from_graphql("FIRST_QUARTILE") == 1
    assert github_activity._level_from_graphql("SECOND_QUARTILE") == 2
    assert github_activity._level_from_graphql("third_quartile") == 3
    assert github_activity._level_from_graphql("FOURTH_QUARTILE") == 4
    assert github_activity._level_from_graphql("BOGUS") == 0
    assert github_activity._level_from_graphql("") == 0
    assert github_activity._level_from_graphql(None) == 0


def test_utc_isoformat_strips_microseconds():
    value = datetime(2025, 1, 1, 12, 30, 45, 123456, tzinfo=timezone.utc)
    assert github_activity._utc_isoformat(value) == "2025-01-01T12:30:45Z"


def test_year_ranges_cover_previous_and_current_year():
    ranges = github_activity._get_year_ranges(today=date(2025, 7, 15))
    assert ranges == [
        {"year": 2024, "start": date(2024, 1, 1), "end": date(2024, 12, 31)},
        {"year": 2025, "start": date(2025, 1, 1), "end": date(2025, 7, 15)},
    ]

    new_year = github_activity._get_year_ranges(today=date(2024, 1, 1))
    assert new_year[0] == {
        "year": 2023,
        "start": date(2023, 1, 1),
        "end": date(2023, 12, 31),
    }
    assert new_year[1]["end"] == date(2024, 1, 1)


def test_build_week_grid_aligns_and_marks_placeholders():
    start = date(2025, 1, 6)  # Monday
    end = date(2025, 1, 19)  # Sunday
    entries = [
        {"date": "2025-01-07", "count": 3, "level": 2, "color": "#40c463"},
        {"date": "2025-01-15", "count": 1, "level": 1, "color": "#9be9a8"},
    ]
    grid = github_activity._build_week_grid(
        year=2025, start=start, end=end, day_entries=entries, total_contributions=42
    )

    assert [week["first_day"] for week in grid["weeks"]] == [
        "2025-01-05",
        "2025-01-12",
        "2025-01-19",
    ]
    assert all(len(week["days"]) == 7 for week in grid["weeks"])

    first_week = grid["weeks"][0]["days"]
    assert first_week[0] == {
        "date": "2025-01-05",
        "count": 0,
        "level": 0,
        "color": None,
        "is_placeholder": True,
        "weekday": 0,
    }
    assert first_week[1]["is_placeholder"] is False
    assert first_week[2] == {
        "date": "2025-01-07",
        "count": 3,
        "level": 2,
        "color": "#40c463",
        "is_placeholder": False,
        "weekday": 2,
    }

    last_week = grid["weeks"][-1]["days"]
    assert last_week[6]["date"] == "2025-01-25"
    assert last_week[6]["is_placeholder"] is True
    assert last_week[0]["is_placeholder"] is False  # Jan 19 is in range

    assert grid["total_contributions"] == 42
    assert grid["active_days"] == 2
    assert grid["max_contribution_count"] == 3
    assert grid["busiest_day"]["date"] == "2025-01-07"
    assert grid["month_labels"] == [{"week_index": 0, "label": "Jan"}]


def test_build_week_grid_month_label_for_range_starting_on_first():
    start = date(2025, 1, 1)
    end = date(2025, 1, 31)
    grid = github_activity._build_week_grid(
        year=2025, start=start, end=end, day_entries=[], total_contributions=0
    )

    assert grid["weeks"][0]["first_day"] == "2024-12-29"
    assert grid["weeks"][0]["days"][0]["is_placeholder"] is True
    assert grid["weeks"][0]["days"][3]["date"] == "2025-01-01"
    assert grid["weeks"][0]["days"][3]["is_placeholder"] is False
    assert grid["month_labels"] == [{"week_index": 0, "label": "Jan"}]
    assert grid["busiest_day"] is None
    assert grid["active_days"] == 0


def test_parse_public_total():
    assert github_activity._parse_public_total("1,234 contributions in 2025") == 1234
    assert github_activity._parse_public_total("999 contributions in 2024") == 999
    assert github_activity._parse_public_total("no data available") is None


def test_parse_contribution_count():
    assert (
        github_activity._parse_contribution_count("5 contributions in Jan 6, 2025") == 5
    )
    assert (
        github_activity._parse_contribution_count("12,345 contributions in Jan 6, 2025")
        == 12345
    )
    assert (
        github_activity._parse_contribution_count("1 contribution in Jan 6, 2025") == 1
    )
    assert (
        github_activity._parse_contribution_count("No contributions on Jan 6, 2025")
        == 0
    )
    assert github_activity._parse_contribution_count("") == 0


def test_cache_returns_fresh_entry_and_evicts_expired():
    payload = {"available": True}
    github_activity._set_cached_activity("alice", payload)
    assert github_activity._get_cached_activity("alice") == payload

    expired_at = datetime.now(timezone.utc) - timedelta(hours=2)
    github_activity._activity_cache["alice"] = {
        "fetched_at": expired_at,
        "payload": payload,
    }
    assert github_activity._get_cached_activity("alice") is None
    assert "alice" not in github_activity._activity_cache


def test_get_github_activity_public_profile_without_token(
    monkeypatch, install_fake_client
):
    monkeypatch.delenv("GITHUB_TOKEN", raising=False)
    ranges = github_activity._get_year_ranges()
    client = FakeAsyncClient(
        get=[FakeResponse(text=public_profile_html(r)) for r in ranges],
    )
    install_fake_client(client)

    result = asyncio.run(github_activity.get_github_activity("octocat"))

    assert result["available"] is True
    assert result["source"] == "public_profile"
    assert result["username"] == "octocat"
    assert len(result["years"]) == 2
    assert client.get_calls == 2
    assert client.post_calls == 0


def test_get_github_activity_graphql_with_token(monkeypatch, install_fake_client):
    monkeypatch.setenv("GITHUB_TOKEN", "secret")
    client = FakeAsyncClient(
        get=[FakeResponse(json_data=[])],
        post=[FakeResponse(json_data=graphql_payload(12)) for _ in range(2)],
    )
    install_fake_client(client)

    result = asyncio.run(github_activity.get_github_activity("octocat"))

    assert result["available"] is True
    assert result["source"] == "graphql"
    assert len(result["years"]) == 2
    assert client.post_calls == 2
    assert client.get_calls == 1  # repository listing, no commit calls for empty list


def test_get_github_activity_falls_back_when_graphql_fails(
    monkeypatch, install_fake_client
):
    monkeypatch.setenv("GITHUB_TOKEN", "secret")
    ranges = github_activity._get_year_ranges()
    error_payload = {"errors": [{"message": "rate limit exceeded"}]}
    client = FakeAsyncClient(
        get=[FakeResponse(text=public_profile_html(r)) for r in ranges],
        post=[FakeResponse(json_data=error_payload)],
    )
    install_fake_client(client)

    result = asyncio.run(github_activity.get_github_activity("octocat"))

    assert result["available"] is True
    assert result["source"] == "public_profile"
    assert client.post_calls == 1
    assert client.get_calls == 2


def test_get_github_activity_repo_fetch_failure_keeps_years(
    monkeypatch, install_fake_client
):
    monkeypatch.setenv("GITHUB_TOKEN", "secret")
    client = FakeAsyncClient(
        get=[FakeResponse(json_data={"not": "a list"})],
        post=[FakeResponse(json_data=graphql_payload(5)) for _ in range(2)],
    )
    install_fake_client(client)

    result = asyncio.run(github_activity.get_github_activity("octocat"))

    assert result["available"] is True
    assert result["source"] == "graphql"
    assert result["recent_repositories"] == []
    assert len(result["years"]) == 2


def test_get_github_activity_total_failure_is_cached(monkeypatch, install_fake_client):
    monkeypatch.delenv("GITHUB_TOKEN", raising=False)
    client = FakeAsyncClient(get=[FakeResponse(status_code=500)])
    install_fake_client(client)

    result = asyncio.run(github_activity.get_github_activity("octocat"))

    assert result["available"] is False
    assert "temporarily unavailable" in result["message"]
    assert result["years"] == []
    assert client.get_calls == 1

    second = asyncio.run(github_activity.get_github_activity("octocat"))
    assert second is result
    assert client.get_calls == 1  # served from cache, no refetch


def test_get_github_activity_caches_successful_fetch(monkeypatch, install_fake_client):
    monkeypatch.setenv("GITHUB_TOKEN", "secret")
    client = FakeAsyncClient(
        get=[FakeResponse(json_data=[])],
        post=[FakeResponse(json_data=graphql_payload(3)) for _ in range(2)],
    )
    install_fake_client(client)

    first = asyncio.run(github_activity.get_github_activity("octocat"))
    second = asyncio.run(github_activity.get_github_activity("octocat"))

    assert first["available"] is True
    assert second["available"] is True
    assert client.post_calls == 2  # no refetch for the second call


def test_get_github_activity_whitespace_username_uses_default(
    monkeypatch, install_fake_client
):
    monkeypatch.delenv("GITHUB_TOKEN", raising=False)
    monkeypatch.setattr(github_activity, "GITHUB_USERNAME", "DefaultUser")
    ranges = github_activity._get_year_ranges()
    client = FakeAsyncClient(
        get=[FakeResponse(text=public_profile_html(r)) for r in ranges],
    )
    install_fake_client(client)

    result = asyncio.run(github_activity.get_github_activity("   "))

    assert result["username"] == "DefaultUser"
