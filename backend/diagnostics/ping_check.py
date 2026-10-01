import subprocess
import re


def ping_host(host, count=4):
    try:
        command = [
            "ping",
            "-n",
            str(count),
            "-w",
            "2000",
            host
        ]

        result = subprocess.run(
            command,
            capture_output=True,
            text=True
        )

        output = result.stdout

        packet_loss_match = re.search(
            r"\((\d+)% loss\)",
            output
        )

        average_time_match = re.search(
            r"Average = (\d+)ms",
            output
        )

        packet_loss = None
        average_latency = None

        if packet_loss_match:
            packet_loss = int(packet_loss_match.group(1))

        if average_time_match:
            average_latency = int(average_time_match.group(1))

        return {
            "host": host,
            "packet_loss_percent": packet_loss,
            "average_latency_ms": average_latency,
            "reachable": result.returncode == 0
        }

    except Exception as error:
        return {
            "host": host,
            "packet_loss_percent": None,
            "average_latency_ms": None,
            "reachable": False,
            "error": str(error)
        }


if __name__ == "__main__":
    host = input("Enter a host to ping: ")

    result = ping_host(host)

    print("\nPing Diagnostic")
    print("-" * 30)
    print(f"Host: {result['host']}")
    print(f"Reachable: {result['reachable']}")

    if result["packet_loss_percent"] is not None:
        print(
            f"Packet Loss: "
            f"{result['packet_loss_percent']}%"
        )

    if result["average_latency_ms"] is not None:
        print(
            f"Average Latency: "
            f"{result['average_latency_ms']} ms"
        )