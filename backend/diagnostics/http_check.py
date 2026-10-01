import requests
import time


def check_http(url):
    start_time = time.perf_counter()

    try:
        response = requests.get(
            url,
            timeout=5
        )

        end_time = time.perf_counter()
        response_time = (end_time - start_time) * 1000

        return {
            "url": url,
            "status_code": response.status_code,
            "response_time_ms": round(response_time, 2),
            "status": "Reachable"
        }

    except requests.exceptions.Timeout:
        return {
            "url": url,
            "status_code": None,
            "response_time_ms": None,
            "status": "Timed Out"
        }

    except requests.exceptions.RequestException as error:
        return {
            "url": url,
            "status_code": None,
            "response_time_ms": None,
            "status": f"Failed: {error}"
        }

if __name__ == "__main__":
    url = input("Enter a URL: ")

    result = check_http(url)

    print("\nHTTP Diagnostic")
    print("-" * 30)
    print(f"URL: {result['url']}")
    print(f"Status: {result['status']}")

    if result["status_code"] is not None:
        print(
            f"HTTP Status Code: "
            f"{result['status_code']}"
        )

    if result["response_time_ms"] is not None:
        print(
            f"Response Time: "
            f"{result['response_time_ms']} ms"
        )