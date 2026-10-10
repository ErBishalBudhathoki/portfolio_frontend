#!/usr/bin/env python
"""
One-time migration: move the Projects worksheet to the new schema.

Before: Name | Date Range | Description | URL
After:  Name | Date Range | Description | Repository | Live Demo | Image

The sheet is the source of truth for project details (repository, live demo,
and preview image), so this script rewrites the worksheet once. Running it
again is a no-op. Use --dry-run to preview the changes without writing.

Migration performed:
  - Replaces the "URL" column with "Live Demo" so it only carries demos that
    are actually online (the Don't Fall Game, Nidhi, and Heroku links are gone
    from the stores/hosts, so they are cleared).
  - Adds a "Repository" column pointing at the canonical GitHub repo
    (ErBishalBudhathoki, not the previous account) for every project.
  - Adds an "Image" column with a preview hosted in the repository itself.
  - Inserts CareNest (absent from the sheet) with its Play Store listing.
"""

import argparse
import asyncio
import os
import sys

# Add the parent directory to the path to import from app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from dotenv import load_dotenv

load_dotenv()

from app.google_sheet import setup_sheets_service  # noqa: E402
from app.linkedin_sheet import SHEET_ID, SHEET_PROJECTS, get_sheet_data  # noqa: E402

GITHUB = "https://github.com/ErBishalBudhathoki"

HEADERS = ["Name", "Date Range", "Description", "Repository", "Live Demo", "Image"]

# Canonical repositories, keyed by the sheet "Name" value.
REPOSITORIES = {
    "Invoice Generator": f"{GITHUB}/Invoice-Generator",
    "Tenant-Web-App": f"{GITHUB}/Tenant-Web-App",
    "Chess With Knight": f"{GITHUB}/Chess-with-Knight",
    "Don't Fall Game": f"{GITHUB}/Dont-Fall-Game",
    "Automatic Timetable Generation": f"{GITHUB}/Automatic-Timetable-Generation",
    "Nidhi - The Browser": f"{GITHUB}/Nidhi-The-Browser",
    "CareNest": f"{GITHUB}/CareNest",
}

# Raw file URLs served from the repositories themselves.
IMAGES = {
    "CareNest": f"https://raw.githubusercontent.com/{GITHUB.split('github.com/')[1]}/CareNest/main/assets/icons/ic_launcher.png",
    "Don't Fall Game": f"https://raw.githubusercontent.com/{GITHUB.split('github.com/')[1]}/Dont-Fall-Game/master/screenshots/Capture1.PNG",
    "Tenant-Web-App": f"https://raw.githubusercontent.com/{GITHUB.split('github.com/')[1]}/Tenant-Web-App/master/Screenshots/1.PNG",
}

# Live demo listings that still resolve.
LIVE_DEMOS = {
    "CareNest": "https://play.google.com/store/apps/details?id=com.bishal.invoice&pcampaignid=web_share",
}

CARENEST_ROW = [
    "CareNest",
    "2025 – Present",
    (
        "Care management and invoicing platform for NDIS and disability support "
        "providers. Multi-tenant architecture with invoicing, scheduling, time "
        "tracking, payroll, care intelligence, and compliance workflows, built "
        "with Flutter and Node.js."
    ),
    REPOSITORIES["CareNest"],
    LIVE_DEMOS["CareNest"],
    IMAGES["CareNest"],
]

# Dead links that must not survive the migration.
DEAD_LINK_HOSTS = ("play.google.com/store/apps/details?id=com.erbisdev", "herokuapp.com")


def migrate_rows(rows):
    """Return the migrated rows: new header, curated columns, CareNest first."""
    if not rows:
        raise SystemExit("Projects sheet is empty; nothing to migrate.")

    header, data = rows[0], rows[1:]
    migrated = []

    for row in data:
        if not row or not row[0].strip():
            continue
        row = row + [""] * (6 - len(row)) if len(row) < 6 else row[:6]
        name = row[0].strip()
        old_url = row[3]
        migrated_row = [
            name,
            row[1],
            row[2],
            REPOSITORIES.get(name, old_url if "github.com" in old_url else ""),
            LIVE_DEMOS.get(name, ""),  # dead demos drop out; sheet stays truthful
            IMAGES.get(name, ""),
        ]
        migrated.append(migrated_row)

    if not any(row[0] == "CareNest" for row in migrated):
        migrated.insert(0, CARENEST_ROW)

    return [HEADERS] + migrated


def describe_changes(before, after):
    lines = []
    before_by_name = {row[0].strip(): row for row in before[1:] if row and row[0].strip()}
    after_by_name = {row[0]: row for row in after[1:]}
    for name, row in after_by_name.items():
        old = before_by_name.get(name)
        if old is None:
            lines.append(f"+ added project: {name}")
            continue
        padded = old + [""] * (6 - len(old))
        if (padded[0], padded[1], padded[2]) != (row[0], row[1], row[2]):
            lines.append(f"~ reordered: {name}")
        if padded[3] != row[3]:
            lines.append(f"  {name}: URL {padded[3] or '(empty)'} -> repository {row[3] or '(empty)'}")
        if padded[4] != row[4]:
            lines.append(f"  {name}: live demo -> {row[4] or '(empty)'}")
        if padded[5] != row[5]:
            lines.append(f"  {name}: image -> {row[5] or '(empty)'}")
    for name in before_by_name:
        if name not in after_by_name:
            lines.append(f"- removed project: {name}")
    return lines


async def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true", help="Show changes without writing")
    args = parser.parse_args()

    service = await setup_sheets_service()
    if not service:
        raise SystemExit("Could not set up the Google Sheets service.")

    rows = get_sheet_data(service, SHEET_PROJECTS, "A1:Z1000")
    if not rows:
        raise SystemExit(f"No data found in {SHEET_PROJECTS}.")

    has_new_schema = [c.strip().lower() for c in rows[0]] == [c.lower() for c in HEADERS]
    if has_new_schema and rows[0] == HEADERS:
        print("Projects sheet already uses the new schema; nothing to do.")
        return

    migrated = migrate_rows(rows)
    changes = describe_changes(rows, migrated)
    print("Planned changes:")
    for line in changes:
        print(f"  {line}")

    if args.dry_run:
        print("\nDry run - no changes written.")
        return

    service.spreadsheets().values().update(
        spreadsheetId=SHEET_ID,
        range=f"{SHEET_PROJECTS}!A1",
        valueInputOption="RAW",
        body={"values": migrated},
    ).execute()
    print(f"\nMigration complete: {len(migrated) - 1} project rows written to {SHEET_PROJECTS}.")


if __name__ == "__main__":
    asyncio.run(main())
