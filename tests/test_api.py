import sys
from pathlib import Path

from fastapi.testclient import TestClient


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
# IMPORT API
# --------------------------------------------------

import api


client = TestClient(
    api.app
)


# --------------------------------------------------
# API STATUS TEST
# --------------------------------------------------

def test_api_status():

    response = client.get(
        "/api/status"
    )

    assert response.status_code == 200

    data = response.json()

    assert data["name"] == "NetScope API"
    assert data["status"] == "online"
    assert data["version"] == "1.0.0"


# --------------------------------------------------
# INVALID FULL URL TEST
# --------------------------------------------------

def test_diagnostic_rejects_full_url():

    response = client.post(
        "/api/diagnostics",
        json={
            "host": "https://github.com"
        }
    )

    assert response.status_code == 400

    data = response.json()

    assert (
        "hostname only"
        in data["detail"]
    )


# --------------------------------------------------
# INVALID HOST PATH TEST
# --------------------------------------------------

def test_diagnostic_rejects_path():

    response = client.post(
        "/api/diagnostics",
        json={
            "host": "github.com/test"
        }
    )

    assert response.status_code == 400

    data = response.json()

    assert (
        "hostname only"
        in data["detail"]
    )


# --------------------------------------------------
# HISTORY ENDPOINT TEST
# --------------------------------------------------

def test_history_endpoint():

    response = client.get(
        "/api/history?limit=2"
    )

    assert response.status_code == 200

    data = response.json()

    assert isinstance(
        data,
        list
    )

    assert len(data) <= 2


# --------------------------------------------------
# TRACEROUTE ENDPOINT TEST
# --------------------------------------------------

def test_traceroute_endpoint(
    monkeypatch
):

    fake_result = {
        "host": "github.com",
        "successful": True,
        "hop_count": 2,
        "hops": [
            {
                "hop": 1,
                "probe_1": "1 ms",
                "probe_2": "2 ms",
                "probe_3": "1 ms",
                "address": "192.168.1.1",
                "average_latency_ms": 1.33,
                "timed_out": False
            },
            {
                "hop": 2,
                "probe_1": "10 ms",
                "probe_2": "11 ms",
                "probe_3": "9 ms",
                "address": "140.82.114.4",
                "average_latency_ms": 10.0,
                "timed_out": False
            }
        ],
        "output": "Fake traceroute output"
    }


    def fake_trace_route(host):

        return fake_result


    monkeypatch.setattr(
        api,
        "trace_route",
        fake_trace_route
    )


    response = client.post(
        "/api/traceroute",
        json={
            "host": "github.com"
        }
    )


    assert response.status_code == 200

    data = response.json()

    assert data["successful"] is True
    assert data["hop_count"] == 2
    assert len(data["hops"]) == 2

    assert (
        data["hops"][1]["address"]
        == "140.82.114.4"
    )