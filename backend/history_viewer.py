from storage.database import get_diagnostic_history


def display_history():
    rows = get_diagnostic_history(limit=10)

    print("\n" + "=" * 60)
    print("NETSCOPE DIAGNOSTIC HISTORY")
    print("=" * 60)

    if not rows:
        print("\nNo diagnostic records found.")
        return

    for row in rows:
        (
            diagnostic_id,
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
        ) = row

        print(f"\nDiagnostic #{diagnostic_id}")
        print("-" * 60)

        print(f"Timestamp: {timestamp}")
        print(f"Target: {target}")
        print(f"IP Address: {ip_address}")

        print(f"DNS Lookup: {dns_lookup_ms} ms")

        print(f"Ping Reachable: {bool(ping_reachable)}")
        print(f"Packet Loss: {packet_loss_percent}%")
        print(f"Average Latency: {average_latency_ms} ms")

        print(
            f"Port 80: {port_80_status} "
            f"({port_80_time_ms} ms)"
        )

        print(
            f"Port 443: {port_443_status} "
            f"({port_443_time_ms} ms)"
        )

        print(f"HTTP Status: {http_status_code}")
        print(f"HTTP Response: {http_response_ms} ms")

        print(f"Overall Status: {overall_status}")

    print("\n" + "=" * 60)


if __name__ == "__main__":
    display_history()