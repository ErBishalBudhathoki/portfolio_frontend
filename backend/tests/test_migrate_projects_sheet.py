"""Tests for the one-time Projects worksheet schema migration."""

import importlib.util
import os
import sys

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(BACKEND_DIR, "scripts"))

_migration_path = os.path.join(BACKEND_DIR, "scripts", "migrate_projects_sheet.py")
_spec = importlib.util.spec_from_file_location("migrate_projects_sheet", _migration_path)
migration = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(migration)


def test_headers_match_runtime_reader_schema():
    from app.linkedin_sheet import SHEET_PROJECTS

    assert migration.HEADERS[0] == "Name"
    assert migration.HEADERS[-1] == "Image"
    assert SHEET_PROJECTS == "Projects"


def test_repositories_point_at_current_github_account():
    rows = [
        ["Name", "Date Range", "Description", "URL"],
        ["Invoice Generator", "Feb 2022 – Present", "JavaFX desktop invoicing.", "https://github.com/BishalBudhathoki/Invoice-Generator"],
    ]

    migrated = migration.migrate_rows(rows)

    assert migrated[0] == migration.HEADERS
    by_name = {row[0]: row for row in migrated[1:]}
    invoice = by_name["Invoice Generator"]
    # Old URL slot becomes the live demo and must not leak dead links.
    assert invoice[3] == "https://github.com/ErBishalBudhathoki/Invoice-Generator"
    assert invoice[4] == ""


def test_dead_demos_are_cleared_and_live_demo_kept():
    rows = [
        ["Name", "Date Range", "Description", "URL"],
        ["Don't Fall Game", "2021", "Game.", "https://play.google.com/store/apps/details?id=com.erbisdev.DontFall"],
        ["Chess With Knight", "2022", "Chess.", "https://chess-knight-target-game.herokuapp.com/"],
    ]

    migrated = migration.migrate_rows(rows)

    by_name = {row[0]: row for row in migrated[1:]}
    assert by_name["Don't Fall Game"][4] == ""
    assert by_name["Chess With Knight"][4] == ""
    assert by_name["Don't Fall Game"][3].endswith("/Dont-Fall-Game")


def test_carenest_inserted_with_play_store_demo_and_image():
    rows = [
        ["Name", "Date Range", "Description", "URL"],
        ["Invoice Generator", "Feb 2022 – Present", "JavaFX desktop invoicing.", ""],
    ]

    migrated = migration.migrate_rows(rows)

    carenest = next(row for row in migrated[1:] if row[0] == "CareNest")
    assert carenest[4] == "https://play.google.com/store/apps/details?id=com.bishal.invoice&pcampaignid=web_share"
    assert carenest[3] == "https://github.com/ErBishalBudhathoki/CareNest"
    assert carenest[5].startswith("https://raw.githubusercontent.com/")
    # CareNest is the newest project and sorts to the top.
    assert migrated[1][0] == "CareNest"


def test_migration_is_idempotent():
    rows = [
        ["Name", "Date Range", "Description", "URL"],
        ["Invoice Generator", "Feb 2022 – Present", "JavaFX desktop invoicing.", ""],
    ]

    once = migration.migrate_rows(rows)
    twice = migration.migrate_rows(once)

    assert once == twice


def test_unknown_project_without_repo_keeps_empty_cells():
    rows = [
        ["Name", "Date Range", "Description", "URL"],
        ["Parallax website", "Oct 2017 – Oct 2017", "Static parallax page.", ""],
    ]

    migrated = migration.migrate_rows(rows)

    by_name = {row[0]: row for row in migrated[1:]}
    assert by_name["Parallax website"][3] == ""
    assert by_name["Parallax website"][4] == ""
    assert by_name["Parallax website"][5] == ""
