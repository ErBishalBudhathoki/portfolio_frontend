"""Tests for Telegram notification helper: unconfigured behavior and message
formatting, without touching the network."""

import pytest

import app.notification_helper as notification_helper
from app.notification_helper import NotificationHelper


@pytest.fixture
def unconfigured(monkeypatch):
    monkeypatch.delenv("TELEGRAM_BOT_TOKEN", raising=False)
    monkeypatch.delenv("TELEGRAM_CHAT_ID", raising=False)
    return NotificationHelper()


def test_unconfigured_helper_does_not_poll(unconfigured):
    assert unconfigured.is_telegram_configured is False
    assert unconfigured.is_enabled is False
    assert not hasattr(unconfigured, "polling_thread")


def test_send_notification_unconfigured(unconfigured):
    result = unconfigured.send_notification("hello")
    assert result == {"success": False, "message": "Telegram not configured"}


def test_test_notification_without_token(unconfigured):
    result = unconfigured.test_notification()
    assert result == {
        "success": False,
        "message": "TELEGRAM_BOT_TOKEN not set in .env file",
    }


@pytest.mark.parametrize(
    "message_type,emoji",
    [
        ("INFO", "ℹ️"),
        ("SUCCESS", "✅"),
        ("WARNING", "⚠️"),
        ("ERROR", "❌"),
        ("UNKNOWN", "ℹ️"),
    ],
)
def test_send_notification_formats_message(
    monkeypatch, unconfigured, message_type, emoji
):
    unconfigured.telegram_bot_token = "token"
    unconfigured.telegram_chat_id = "12345"
    unconfigured.is_telegram_configured = True

    called = {}

    def fake_post(url, json=None, **kwargs):
        called["url"] = url
        called["json"] = json

        class FakeResponse:
            def json(self):
                return {"ok": True}

        return FakeResponse()

    monkeypatch.setattr(notification_helper.requests, "post", fake_post)

    result = unconfigured.send_notification("scrape done", message_type)

    assert result == {"success": True, "message": "Notification sent successfully"}
    assert called["url"].endswith("/sendMessage")
    assert called["json"]["chat_id"] == "12345"
    assert called["json"]["parse_mode"] == "HTML"
    payload = called["json"]["text"]
    assert f"{emoji} {message_type}: scrape done" in payload
    assert "scrape done" in payload


def test_send_notification_reports_api_failure(monkeypatch, unconfigured):
    unconfigured.telegram_bot_token = "token"
    unconfigured.telegram_chat_id = "12345"
    unconfigured.is_telegram_configured = True

    def fake_post(url, json=None, **kwargs):
        class FakeResponse:
            def json(self):
                return {"ok": False, "description": "chat not found"}

        return FakeResponse()

    monkeypatch.setattr(notification_helper.requests, "post", fake_post)

    result = unconfigured.send_notification("hello")

    assert result["success"] is False
    assert "Failed to send notification" in result["message"]


def test_register_command_normalizes_to_lowercase(unconfigured):
    handler = lambda: None
    unconfigured.register_command("SCRAPE", handler)
    assert unconfigured.command_handlers["scrape"] is handler
