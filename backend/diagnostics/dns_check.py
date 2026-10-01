import socket
import time


def resolve_domain(domain):
    start_time = time.perf_counter()

    try:
        ip_address = socket.gethostbyname(domain)

        end_time = time.perf_counter()
        lookup_time = (end_time - start_time) * 1000

        return {
            "domain": domain,
            "ip_address": ip_address,
            "lookup_time_ms": round(lookup_time, 2),
            "success": True
        }

    except socket.gaierror as error:
        return {
            "domain": domain,
            "ip_address": None,
            "lookup_time_ms": None,
            "success": False,
            "error": str(error)
        }


if __name__ == "__main__":
    domain = input("Enter a domain: ")

    result = resolve_domain(domain)

    print("\nDNS Diagnostic")
    print("-" * 30)
    print(f"Domain: {result['domain']}")

    if result["success"]:
        print(f"IP Address: {result['ip_address']}")
        print(f"Lookup Time: {result['lookup_time_ms']} ms")
        print("DNS Resolution: Successful")
    else:
        print("DNS Resolution: Failed")