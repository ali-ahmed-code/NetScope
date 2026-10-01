from diagnostics.dns_check import resolve_domain
from diagnostics.ping_check import ping_host
from diagnostics.tcp_check import check_tcp_connection
from diagnostics.http_check import check_http

from storage.database import initialize_database, save_diagnostic

def run_diagnostic(host):
    print("\n" + "=" * 50)
    print("NETSCOPE NETWORK HEALTH REPORT")
    print("=" * 50)

    print(f"\nTarget: {host}")

    # DNS
    print("\n[ DNS ]")
    dns_result = resolve_domain(host)

    if dns_result["success"]:
        print("Status: Successful")
        print(f"IP Address: {dns_result['ip_address']}")
        print(
            f"Lookup Time: "
            f"{dns_result['lookup_time_ms']} ms"
        )
    else:
        print("Status: Failed")
        print("\nCannot continue without DNS resolution.")
        return

    # Ping
    print("\n[ PING / ICMP ]")
    ping_result = ping_host(host)

    print(
        f"Reachable: "
        f"{ping_result['reachable']}"
    )

    if ping_result["packet_loss_percent"] is not None:
        print(
            f"Packet Loss: "
            f"{ping_result['packet_loss_percent']}%"
        )

    if ping_result["average_latency_ms"] is not None:
        print(
            f"Average Latency: "
            f"{ping_result['average_latency_ms']} ms"
        )

    # TCP
    print("\n[ TCP ]")

    tcp_results = []

    for port in [80, 443]:
        tcp_result = check_tcp_connection(host, port)
        tcp_results.append(tcp_result)

        print(
            f"Port {port}: "
            f"{tcp_result['status']}"
        )

        if tcp_result["connection_time_ms"] is not None:
            print(
                f"  Connection Time: "
                f"{tcp_result['connection_time_ms']} ms"
            )

    # HTTPS
    print("\n[ HTTPS ]")

    url = f"https://{host}"
    http_result = check_http(url)

    print(f"Status: {http_result['status']}")

    if http_result["status_code"] is not None:
        print(
            f"HTTP Status Code: "
            f"{http_result['status_code']}"
        )

    if http_result["response_time_ms"] is not None:
        print(
            f"Response Time: "
            f"{http_result['response_time_ms']} ms"
        )

    # Overall connectivity
    dns_ok = dns_result["success"]

    https_tcp_ok = any(
        result["port"] == 443
        and result["status"] == "Open"
        for result in tcp_results
    )

    http_ok = (
        http_result["status_code"] is not None
        and 200 <= http_result["status_code"] < 400
    )

    print("\n" + "-" * 50)

    if dns_ok and https_tcp_ok and http_ok:
        overall_status = "HEALTHY"
    else:
        overall_status = "DEGRADED"

    print(f"CORE CONNECTIVITY: {overall_status}")

    print("-" * 50)

    port_80_result = next(
        (
            result
            for result in tcp_results
            if result["port"] == 80
        ),
        None
    )

    port_443_result = next(
        (
            result
            for result in tcp_results
            if result["port"] == 443
        ),
        None
    )

    report = {
        "target": host,
        "ip_address": dns_result["ip_address"],
        "dns_lookup_ms": dns_result["lookup_time_ms"],

        "ping_reachable": ping_result["reachable"],
        "packet_loss_percent": ping_result["packet_loss_percent"],
        "average_latency_ms": ping_result["average_latency_ms"],

        "port_80_status": (
            port_80_result["status"]
            if port_80_result
            else None
        ),

        "port_80_time_ms": (
            port_80_result["connection_time_ms"]
            if port_80_result
            else None
        ),

        "port_443_status": (
            port_443_result["status"]
            if port_443_result
            else None
        ),

        "port_443_time_ms": (
            port_443_result["connection_time_ms"]
            if port_443_result
            else None
        ),

        "http_status_code": http_result["status_code"],
        "http_response_ms": http_result["response_time_ms"],
        "overall_status": overall_status
    }

    save_diagnostic(report)

    print("\nDiagnostic saved to database.")

    return report


if __name__ == "__main__":
    initialize_database()

    target = input("Enter a host to diagnose: ").strip()

    if not target:
        print("Error: Please enter a valid host.")
    else:
        run_diagnostic(target)