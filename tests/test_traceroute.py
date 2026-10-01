import sys
from pathlib import Path


# --------------------------------------------------
# MAKE BACKEND IMPORTABLE
# --------------------------------------------------

PROJECT_ROOT = (
    Path(__file__)
    .resolve()
    .parents[1]
)

BACKEND_DIR = (
    PROJECT_ROOT /
    "backend"
)

sys.path.insert(
    0,
    str(BACKEND_DIR)
)


# --------------------------------------------------
# IMPORT FUNCTIONS TO TEST
# --------------------------------------------------

from diagnostics.traceroute_check import (
    parse_latency,
    parse_traceroute_output
)


# --------------------------------------------------
# LATENCY PARSING TESTS
# --------------------------------------------------

def test_parse_normal_latency():

    result = parse_latency(
        "15 ms"
    )

    assert result == 15.0


def test_parse_less_than_one_latency():

    result = parse_latency(
        "<1 ms"
    )

    assert result == 1.0


def test_parse_timeout():

    result = parse_latency(
        "*"
    )

    assert result is None


# --------------------------------------------------
# FULL TRACEROUTE PARSER TEST
# --------------------------------------------------

def test_parse_traceroute_output():

    sample_output = """
Tracing route to github.com

  1     2 ms     1 ms     1 ms     192.168.1.1
  2     *        *        *        Request timed out.
  3    10 ms    11 ms     9 ms     140.82.114.4

Trace complete.
"""


    hops = parse_traceroute_output(
        sample_output
    )


    assert len(hops) == 3


    # HOP 1

    assert hops[0]["hop"] == 1

    assert (
        hops[0]["address"]
        == "192.168.1.1"
    )

    assert (
        hops[0]["average_latency_ms"]
        == 1.33
    )

    assert (
        hops[0]["timed_out"]
        is False
    )


    # HOP 2

    assert hops[1]["hop"] == 2

    assert (
        hops[1]["address"]
        is None
    )

    assert (
        hops[1]["average_latency_ms"]
        is None
    )

    assert (
        hops[1]["timed_out"]
        is True
    )


    # HOP 3

    assert hops[2]["hop"] == 3

    assert (
        hops[2]["address"]
        == "140.82.114.4"
    )

    assert (
        hops[2]["average_latency_ms"]
        == 10.0
    )

    assert (
        hops[2]["timed_out"]
        is False
    )


# --------------------------------------------------
# PARTIAL TIMEOUT TEST
# --------------------------------------------------

def test_parse_partial_timeout():

    sample_output = """
 15    67 ms    68 ms     *        213.248.67.47
"""


    hops = parse_traceroute_output(
        sample_output
    )


    assert len(hops) == 1

    assert hops[0]["hop"] == 15

    assert (
        hops[0]["address"]
        == "213.248.67.47"
    )

    assert (
        hops[0]["average_latency_ms"]
        == 67.5
    )

    assert (
        hops[0]["timed_out"]
        is False
    )