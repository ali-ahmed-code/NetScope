import sqlite3
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = BASE_DIR / "data"
DATABASE_PATH = DATA_DIR / "netscope.db"


def get_connection():
    DATA_DIR.mkdir(exist_ok=True)

    connection = sqlite3.connect(DATABASE_PATH)

    return connection


def initialize_database():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS diagnostics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,

            target TEXT NOT NULL,
            ip_address TEXT,

            dns_lookup_ms REAL,

            ping_reachable INTEGER,
            packet_loss_percent REAL,
            average_latency_ms REAL,

            port_80_status TEXT,
            port_80_time_ms REAL,

            port_443_status TEXT,
            port_443_time_ms REAL,

            http_status_code INTEGER,
            http_response_ms REAL,

            overall_status TEXT
        )
        """
    )

    connection.commit()
    connection.close()


def save_diagnostic(report):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO diagnostics (
            target,
            ip_address,
            dns_lookup_ms,
            ping_reachable,
            packet_loss_percent,
            average_latency_ms,
            port_80_status,
            port_80_time_ms,
            port_443_status,
            port_443_time_ms,
            http_status_code,
            http_response_ms,
            overall_status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            report["target"],
            report["ip_address"],
            report["dns_lookup_ms"],
            report["ping_reachable"],
            report["packet_loss_percent"],
            report["average_latency_ms"],
            report["port_80_status"],
            report["port_80_time_ms"],
            report["port_443_status"],
            report["port_443_time_ms"],
            report["http_status_code"],
            report["http_response_ms"],
            report["overall_status"]
        )
    )

    connection.commit()
    connection.close()


def get_diagnostic_history(limit=10):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT
            id,
            timestamp,
            target,
            ip_address,
            dns_lookup_ms,
            ping_reachable,
            packet_loss_percent,
            average_latency_ms,
            port_80_status,
            port_80_time_ms,
            port_443_status,
            port_443_time_ms,
            http_status_code,
            http_response_ms,
            overall_status
        FROM diagnostics
        ORDER BY id DESC
        LIMIT ?
        """,
        (limit,)
    )

    rows = cursor.fetchall()

    connection.close()

    return rows