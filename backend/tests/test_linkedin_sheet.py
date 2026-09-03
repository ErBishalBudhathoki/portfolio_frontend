"""Tests for LinkedIn skill categorization and icon mapping."""

import pytest

from app.linkedin_sheet import categorize_skill, get_skill_icon_id


def test_categorize_skill_known_categories():
    assert categorize_skill("React") == "Frontend"
    assert categorize_skill("TypeScript") == "Frontend"
    assert categorize_skill("Python") == "Backend"
    assert categorize_skill("Django") == "Backend"
    assert categorize_skill("MySQL") == "Database"
    assert categorize_skill("PostgreSQL") == "Database"
    assert categorize_skill("AWS") == "DevOps/Cloud"
    assert categorize_skill("Docker") == "DevOps/Cloud"
    assert categorize_skill("TensorFlow") == "AI/ML"
    assert categorize_skill("Pandas") == "AI/ML"


def test_categorize_skill_case_insensitive_and_trimmed():
    assert categorize_skill("  react ") == "Frontend"
    assert categorize_skill("JAVASCRIPT") == "Frontend"


def test_categorize_skill_unknown_falls_back_to_other():
    assert categorize_skill("Excel") == "Other"
    assert categorize_skill("") == "Other"


def test_categorize_skill_ai_ml_requires_word_boundary():
    assert categorize_skill("XML") == "Other"
    assert categorize_skill("Airtable") == "Other"
    assert categorize_skill("AI") == "AI/ML"
    assert categorize_skill("ML") == "AI/ML"


@pytest.mark.parametrize(
    "skill,expected",
    [
        ("JavaScript", "js"),
        ("TypeScript", "ts"),
        ("Python", "py"),
        ("React", "react"),
        (" AWS ", "aws"),
        ("COBOL", ""),
        ("", ""),
    ],
)
def test_get_skill_icon_id(skill, expected):
    assert get_skill_icon_id(skill) == expected
