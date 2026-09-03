"""Tests for analytics routes, focused on the privacy-critical IP truncation."""

from app.routes.analytics_routes import truncate_ip


def test_truncate_ipv4_keeps_first_three_octets():
    assert truncate_ip("192.168.1.45") == "192.168.1.0"
    assert truncate_ip("8.8.8.8") == "8.8.8.0"


def test_truncate_ipv4_leading_zeros_fall_back_to_zero():
    # ipaddress rejects leading-zero octets, so truncation must not leak them.
    assert truncate_ip("192.168.001.005") == "0.0.0.0"


def test_truncate_ipv6_full_form_zeroes_last_groups():
    # Canonical form is 2001:db8:85a3::8a2e:370:7334; last two groups are zeroed.
    assert (
        truncate_ip("2001:0db8:85a3:0000:0000:8a2e:0370:7334")
        == "2001:db8:85a3::8a2e:0:0"
    )


def test_truncate_ipv6_mapped_ipv4_address():
    assert truncate_ip("::ffff:192.168.1.1") == "::ffff:0:0"


def test_truncate_ipv6_loopback_is_zeroed():
    assert truncate_ip("::1") == ":0:0"


def test_truncate_invalid_ip_falls_back_to_zero():
    assert truncate_ip("not-an-ip") == "0.0.0.0"
    assert truncate_ip("") == "0.0.0.0"
    assert truncate_ip("999.1.1.1") == "0.0.0.0"


def test_truncate_never_leaks_identity():
    for ip in ["192.168.1.45", "2001:0db8:85a3:0000:0000:8a2e:0370:7334", "::1"]:
        truncated = truncate_ip(ip)
        assert truncated != ip
