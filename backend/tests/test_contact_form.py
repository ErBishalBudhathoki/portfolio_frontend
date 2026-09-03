"""Tests for contact form: payload validation and the graceful failure path
when Google Sheets is unreachable."""

import asyncio

from pydantic import ValidationError
import pytest

from app import contact_form
from app.contact_form import (
    ContactFormSubmission,
    ensure_contact_sheet_exists,
    save_contact_submission,
)

VALID_SUBMISSION = {
    "name": "Ada Lovelace",
    "email": "ada@example.com",
    "subject": "Hello",
    "message": "Nice portfolio!",
}


class FakeSheetsService:
    def __init__(self, sheet_titles=None):
        self.sheet_titles = list(sheet_titles or [])
        self.appends = []
        self.updates = []
        self.batch_updates = []
        self._pending_get = False

    def spreadsheets(self):
        return self

    def values(self):
        return self

    def append(self, spreadsheetId, range, valueInputOption, insertDataOption, body):
        self.appends.append((spreadsheetId, range, body))
        return self

    def get(self, spreadsheetId):
        self._pending_get = True
        return self

    def batchUpdate(self, spreadsheetId, body):
        self.batch_updates.append((spreadsheetId, body))
        return self

    def update(self, spreadsheetId, range, valueInputOption, body):
        self.updates.append((spreadsheetId, range, body))
        return self

    def execute(self):
        if self._pending_get:
            self._pending_get = False
            return {"sheets": [{"properties": {"title": t}} for t in self.sheet_titles]}
        return {"updates": {"updatedRows": 1}}


def test_valid_submission_parses():
    submission = ContactFormSubmission(**VALID_SUBMISSION)
    assert submission.email == "ada@example.com"


@pytest.mark.parametrize("email", ["not-an-email", ""])
def test_invalid_email_rejected(email):
    payload = dict(VALID_SUBMISSION, email=email)
    with pytest.raises(ValidationError):
        ContactFormSubmission(**payload)


def test_save_submission_unavailable_sheets(monkeypatch):
    async def no_service():
        return None

    monkeypatch.setattr(contact_form, "setup_sheets_service", no_service)

    result = asyncio.run(
        save_contact_submission(ContactFormSubmission(**VALID_SUBMISSION))
    )

    assert result == {"success": False, "message": "Could not connect to Google Sheets"}


def test_save_submission_appends_row(monkeypatch):
    service = FakeSheetsService()

    async def fake_setup():
        return service

    monkeypatch.setattr(contact_form, "setup_sheets_service", fake_setup)

    result = asyncio.run(
        save_contact_submission(ContactFormSubmission(**VALID_SUBMISSION))
    )

    assert result == {"success": True, "message": "Contact form submission saved"}
    assert len(service.appends) == 1
    spreadsheet_id, range_name, body = service.appends[0]
    assert spreadsheet_id == contact_form.SHEET_ID
    assert range_name == "contact_submissions!A:E"
    row = body["values"][0]
    assert row[1:] == ["Ada Lovelace", "ada@example.com", "Hello", "Nice portfolio!"]


def test_ensure_sheet_exists_when_present(monkeypatch):
    service = FakeSheetsService(sheet_titles=[contact_form.SHEET_NAME])

    async def fake_setup():
        return service

    monkeypatch.setattr(contact_form, "setup_sheets_service", fake_setup)

    result = asyncio.run(ensure_contact_sheet_exists())

    assert result == {"success": True, "message": "Contact form sheet exists"}
    assert service.updates == []
    assert service.batch_updates == []


def test_ensure_sheet_creates_missing_sheet_with_headers(monkeypatch):
    service = FakeSheetsService()

    async def fake_setup():
        return service

    monkeypatch.setattr(contact_form, "setup_sheets_service", fake_setup)

    result = asyncio.run(ensure_contact_sheet_exists())

    assert result == {"success": True, "message": "Contact form sheet exists"}
    assert len(service.batch_updates) == 1
    _, add_body = service.batch_updates[0]
    assert (
        add_body["requests"][0]["addSheet"]["properties"]["title"]
        == contact_form.SHEET_NAME
    )
    assert len(service.updates) == 1
    _, range_name, body = service.updates[0]
    assert range_name == "contact_submissions!A1:E1"
    assert body["values"] == [["Timestamp", "Name", "Email", "Subject", "Message"]]
