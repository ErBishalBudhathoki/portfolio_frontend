import asyncio
import os
import re
from datetime import date, datetime, time, timedelta, timezone
from typing import Any, Dict, List, Optional

import httpx
from bs4 import BeautifulSoup

GITHUB_GRAPHQL_URL = "https://api.github.com/graphql"
GITHUB_REST_API_URL = "https://api.github.com"
GITHUB_PUBLIC_CONTRIBUTIONS_URL = "https://github.com/users/{username}/contributions"
GITHUB_USERNAME = os.getenv("GITHUB_USERNAME", "BishalBudhathoki")
CACHE_TTL_SECONDS = 3600
GITHUB_CONTRIBUTION_COLORS = {
    0: "#ebedf0",
    1: "#9be9a8",
    2: "#40c463",
    3: "#30a14e",
    4: "#216e39",
}

GRAPHQL_CONTRIBUTIONS_QUERY = """
query GitHubActivity($username: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $username) {
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        totalContributions
        weeks {
          firstDay
          contributionDays {
            color
            contributionCount
            contributionLevel
            date
            weekday
          }
        }
      }
    }
  }
}
"""

_activity_cache: Dict[str, Dict[str, Any]] = {}


def _utc_isoformat(value: datetime) -> str:
    return value.replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _level_from_graphql(value: Optional[str]) -> int:
    levels = {
        "NONE": 0,
        "FIRST_QUARTILE": 1,
        "SECOND_QUARTILE": 2,
        "THIRD_QUARTILE": 3,
        "FOURTH_QUARTILE": 4,
    }
    return levels.get((value or "").upper(), 0)


def _get_year_ranges(today: Optional[date] = None) -> List[Dict[str, Any]]:
    current = today or date.today()
    years = [current.year - 1, current.year]
    ranges: List[Dict[str, Any]] = []

    for year in years:
        start = date(year, 1, 1)
        end = current if year == current.year else date(year, 12, 31)
        ranges.append({"year": year, "start": start, "end": end})

    return ranges


def _build_week_grid(
    year: int,
    start: date,
    end: date,
    day_entries: List[Dict[str, Any]],
    total_contributions: Optional[int] = None,
) -> Dict[str, Any]:
    day_map = {entry["date"]: entry for entry in day_entries}
    active_entries = [entry for entry in day_entries if entry["count"] > 0]
    max_count = max((entry["count"] for entry in day_entries), default=0)
    total = total_contributions if total_contributions is not None else sum(entry["count"] for entry in day_entries)

    start_offset = (start.weekday() + 1) % 7
    grid_start = start - timedelta(days=start_offset)
    end_offset = 6 - ((end.weekday() + 1) % 7)
    grid_end = end + timedelta(days=end_offset)

    weeks: List[Dict[str, Any]] = []
    month_labels: List[Dict[str, Any]] = []
    seen_months = set()

    current = grid_start
    week_index = 0
    while current <= grid_end:
        week_days: List[Dict[str, Any]] = []
        first_in_month: Optional[date] = None

        for day_offset in range(7):
            current_day = current + timedelta(days=day_offset)
            current_day_key = current_day.isoformat()
            is_in_range = start <= current_day <= end
            entry = day_map.get(current_day_key)

            if is_in_range and current_day.day == 1 and current_day.month not in seen_months:
                first_in_month = current_day
                seen_months.add(current_day.month)

            week_days.append(
                {
                    "date": current_day_key,
                    "count": entry["count"] if entry and is_in_range else 0,
                    "level": entry["level"] if entry and is_in_range else 0,
                    "color": entry.get("color") if entry and is_in_range else None,
                    "is_placeholder": not is_in_range,
                    "weekday": day_offset,
                }
            )

        if first_in_month:
            month_labels.append({"week_index": week_index, "label": first_in_month.strftime("%b")})

        weeks.append({"first_day": current.isoformat(), "days": week_days})
        current += timedelta(days=7)
        week_index += 1

    if start.strftime("%b") not in {label["label"] for label in month_labels}:
        month_labels.insert(0, {"week_index": 0, "label": start.strftime("%b")})

    busiest_day = max(active_entries, key=lambda entry: entry["count"], default=None)

    return {
        "year": year,
        "range_start": start.isoformat(),
        "range_end": end.isoformat(),
        "total_contributions": total,
        "active_days": len(active_entries),
        "max_contribution_count": max_count,
        "busiest_day": busiest_day,
        "month_labels": month_labels,
        "weeks": weeks,
    }


async def _fetch_graphql_year(
    client: httpx.AsyncClient,
    username: str,
    token: str,
    year_range: Dict[str, Any],
) -> Dict[str, Any]:
    start = datetime.combine(year_range["start"], time.min, tzinfo=timezone.utc)
    end = datetime.combine(year_range["end"], time.max, tzinfo=timezone.utc)

    response = await client.post(
        GITHUB_GRAPHQL_URL,
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
        },
        json={
            "query": GRAPHQL_CONTRIBUTIONS_QUERY,
            "variables": {
                "username": username,
                "from": _utc_isoformat(start),
                "to": _utc_isoformat(end),
            },
        },
    )
    response.raise_for_status()
    payload = response.json()

    if payload.get("errors"):
        raise ValueError(payload["errors"][0].get("message", "GitHub GraphQL request failed"))

    calendar = (
        payload.get("data", {})
        .get("user", {})
        .get("contributionsCollection", {})
        .get("contributionCalendar")
    )
    if not calendar:
        raise ValueError("GitHub contribution calendar was empty")

    day_entries: List[Dict[str, Any]] = []
    for week in calendar.get("weeks", []):
        for contribution_day in week.get("contributionDays", []):
            day_entries.append(
                {
                    "date": contribution_day["date"],
                    "count": int(contribution_day.get("contributionCount", 0)),
                    "level": _level_from_graphql(contribution_day.get("contributionLevel")),
                    "color": contribution_day.get("color"),
                }
            )

    return _build_week_grid(
        year=year_range["year"],
        start=year_range["start"],
        end=year_range["end"],
        day_entries=day_entries,
        total_contributions=int(calendar.get("totalContributions", 0)),
    )


async def _fetch_recent_repositories_graphql(
    client: httpx.AsyncClient,
    username: str,
    token: str,
    year_ranges: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    start = datetime.combine(year_ranges[0]["start"], time.min, tzinfo=timezone.utc)
    end = datetime.combine(year_ranges[-1]["end"], time.max, tzinfo=timezone.utc)

    repositories_response = await client.get(
        f"{GITHUB_REST_API_URL}/user/repos",
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
        },
        params={
            "affiliation": "owner,collaborator,organization_member",
            "sort": "pushed",
            "direction": "desc",
            "per_page": 30,
        },
    )
    repositories_response.raise_for_status()
    repositories_payload = repositories_response.json()

    if not isinstance(repositories_payload, list):
        raise ValueError("GitHub repository listing returned an unexpected payload")

    recent_repositories: List[Dict[str, Any]] = []
    for repository in repositories_payload:
        recent_repositories.append(
            {
                "name": repository.get("name"),
                "name_with_owner": repository.get("full_name"),
                "url": repository.get("html_url"),
                "pushed_at": repository.get("pushed_at"),
            }
        )

    async def load_last_commit(repository: Dict[str, Any]) -> Dict[str, Any]:
        name_with_owner = repository.get("name_with_owner")
        if not name_with_owner:
            return repository

        try:
            commits_response = await client.get(
                f"{GITHUB_REST_API_URL}/repos/{name_with_owner}/commits",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Accept": "application/vnd.github+json",
                },
                params={
                    "author": username,
                    "since": _utc_isoformat(start),
                    "until": _utc_isoformat(end),
                    "per_page": 1,
                },
            )
            commits_response.raise_for_status()
            commits = commits_response.json()
            if isinstance(commits, list) and commits:
                latest_commit = commits[0]
                repository["last_commit_at"] = (
                    latest_commit.get("commit", {}).get("author", {}) or {}
                ).get("date") or latest_commit.get("commit", {}).get("committer", {}).get("date")
                repository["commit_count"] = 1
        except Exception:
            repository["last_commit_at"] = repository.get("pushed_at")

        return repository

    hydrated_repositories = await asyncio.gather(
        *(load_last_commit(repository) for repository in recent_repositories[:20])
    )

    hydrated_repositories = [
        repository for repository in hydrated_repositories if repository.get("last_commit_at")
    ]
    hydrated_repositories.sort(
        key=lambda repository: repository.get("last_commit_at") or "",
        reverse=True,
    )

    return [
        {
            "name": repository.get("name"),
            "name_with_owner": repository.get("name_with_owner"),
            "url": repository.get("url"),
            "last_commit_at": repository.get("last_commit_at"),
            "commit_count": repository.get("commit_count", 0),
        }
        for repository in hydrated_repositories[:2]
    ]


def _parse_public_total(text: str) -> Optional[int]:
    match = re.search(r"([\d,]+)\s+contributions?\s+in\s+\d{4}", text, re.IGNORECASE)
    if not match:
        return None
    return int(match.group(1).replace(",", ""))


def _parse_contribution_count(text: str) -> int:
    normalized = " ".join(text.split())
    if normalized.lower().startswith("no contributions"):
        return 0

    match = re.search(r"(\d[\d,]*)\s+contributions?", normalized, re.IGNORECASE)
    if not match:
        return 0

    return int(match.group(1).replace(",", ""))


async def _fetch_public_year(
    client: httpx.AsyncClient,
    username: str,
    year_range: Dict[str, Any],
) -> Dict[str, Any]:
    response = await client.get(
        GITHUB_PUBLIC_CONTRIBUTIONS_URL.format(username=username),
        params={
            "from": year_range["start"].isoformat(),
            "to": year_range["end"].isoformat(),
        },
        headers={"Accept": "text/html"},
    )
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")
    day_entries: List[Dict[str, Any]] = []

    for node in soup.select(".ContributionCalendar-day[data-date][data-level]"):
        raw_date = node.get("data-date")
        if not raw_date:
            continue

        try:
            parsed_day = date.fromisoformat(raw_date)
        except ValueError:
            continue

        if parsed_day < year_range["start"] or parsed_day > year_range["end"]:
            continue

        raw_level = str(node.get("data-level", "0")).strip()
        level = int(raw_level) if raw_level.isdigit() else 0
        tooltip = node.find_next_sibling("tool-tip")
        count = _parse_contribution_count(tooltip.get_text(" ", strip=True) if tooltip else "")

        day_entries.append(
            {
                "date": raw_date,
                "count": count,
                "level": level,
                "color": GITHUB_CONTRIBUTION_COLORS.get(level),
            }
        )

    total_contributions = _parse_public_total(soup.get_text(" ", strip=True))
    return _build_week_grid(
        year=year_range["year"],
        start=year_range["start"],
        end=year_range["end"],
        day_entries=day_entries,
        total_contributions=total_contributions,
    )


def _get_cached_activity(username: str) -> Optional[Dict[str, Any]]:
    cached = _activity_cache.get(username)
    if not cached:
        return None

    expires_at = cached["fetched_at"] + timedelta(seconds=CACHE_TTL_SECONDS)
    if datetime.now(timezone.utc) >= expires_at:
        _activity_cache.pop(username, None)
        return None

    return cached["payload"]


def _set_cached_activity(username: str, payload: Dict[str, Any]) -> None:
    _activity_cache[username] = {
        "fetched_at": datetime.now(timezone.utc),
        "payload": payload,
    }


async def get_github_activity(username: Optional[str] = None) -> Dict[str, Any]:
    resolved_username = (username or GITHUB_USERNAME or "BishalBudhathoki").strip() or "BishalBudhathoki"
    cached = _get_cached_activity(resolved_username)
    if cached:
        return cached

    year_ranges = _get_year_ranges()
    token = (os.getenv("GITHUB_TOKEN") or "").strip()
    source = "public_profile"
    recent_repositories: List[Dict[str, Any]] = []

    async with httpx.AsyncClient(
        timeout=20.0,
        headers={
            "User-Agent": f"{resolved_username}-portfolio",
            "X-GitHub-Api-Version": "2022-11-28",
        },
        follow_redirects=True,
    ) as client:
        try:
            if token:
                try:
                    years = [
                        await _fetch_graphql_year(client, resolved_username, token, year_range)
                        for year_range in year_ranges
                    ]
                    try:
                        recent_repositories = await _fetch_recent_repositories_graphql(
                            client,
                            resolved_username,
                            token,
                            year_ranges,
                        )
                    except Exception:
                        recent_repositories = []
                    source = "graphql"
                except Exception:
                    years = [
                        await _fetch_public_year(client, resolved_username, year_range)
                        for year_range in year_ranges
                    ]
            else:
                years = [
                    await _fetch_public_year(client, resolved_username, year_range)
                    for year_range in year_ranges
                ]
        except Exception as exc:
            payload = {
                "username": resolved_username,
                "profile_url": f"https://github.com/{resolved_username}",
                "available": False,
                "message": f"GitHub activity is temporarily unavailable: {str(exc)}",
                "source": source,
                "recent_repositories": recent_repositories,
                "years": [],
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
            _set_cached_activity(resolved_username, payload)
            return payload

    payload = {
        "username": resolved_username,
        "profile_url": f"https://github.com/{resolved_username}",
        "available": True,
        "source": source,
        "recent_repositories": recent_repositories,
        "years": years,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    _set_cached_activity(resolved_username, payload)
    return payload
