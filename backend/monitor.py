import time

from netscope_report import run_diagnostic
from storage.database import initialize_database


def monitor_target(host, interval_seconds=60):
    initialize_database()

    print("\n" + "=" * 50)
    print("NETSCOPE AUTOMATIC MONITOR")
    print("=" * 50)

    print(f"\nTarget: {host}")
    print(f"Interval: {interval_seconds} seconds")
    print("Press Ctrl + C to stop monitoring.")

    run_number = 1

    try:
        while True:
            print("\n" + "#" * 50)
            print(f"MONITORING RUN #{run_number}")
            print("#" * 50)

            run_diagnostic(host)

            run_number += 1

            print(
                f"\nWaiting {interval_seconds} seconds "
                "before next diagnostic..."
            )

            time.sleep(interval_seconds)

    except KeyboardInterrupt:
        print("\n\nMonitoring stopped by user.")
        print("All completed diagnostics remain saved.")


if __name__ == "__main__":
    target = input(
        "Enter a host to monitor: "
    ).strip()

    if not target:
        print("Error: Please enter a valid host.")

    else:
        monitor_target(
            host=target,
            interval_seconds=60
        )