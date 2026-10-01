import socket
import time


def check_tcp_connection(host, port):
    start_time = time.perf_counter()

    try:
        connection = socket.create_connection(
            (host, port),
            timeout=5
        )

        end_time = time.perf_counter()
        connection_time = (end_time - start_time) * 1000

        connection.close()

        return {
            "host": host,
            "port": port,
            "status": "Open",
            "connection_time_ms": round(connection_time, 2)
        }

    except socket.timeout:
        return {
            "host": host,
            "port": port,
            "status": "Timed Out",
            "connection_time_ms": None
        }

    except socket.error:
        return {
            "host": host,
            "port": port,
            "status": "Closed / Unreachable",
            "connection_time_ms": None
        }


if __name__ == "__main__":
    host = input("Enter a host: ")

    ports = [80, 443]

    print(f"\nTesting TCP connections for {host}...\n")

    for port in ports:
        result = check_tcp_connection(host, port)

        print(f"Port: {result['port']}")
        print(f"Status: {result['status']}")

        if result["connection_time_ms"] is not None:
            print(
                f"Connection Time: "
                f"{result['connection_time_ms']} ms"
            )

        print("-" * 30)