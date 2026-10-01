import re
import subprocess


def parse_latency(value):
    """
    Convert latency text such as:

    "15 ms"
    "<1 ms"

    into a numeric value.

    A timeout "*" returns None.
    """

    if not value:
        return None

    value = value.strip()

    if value == "*":
        return None

    match = re.search(
        r"(\d+)",
        value
    )

    if not match:
        return None

    return float(
        match.group(1)
    )


def parse_traceroute_output(output):
    """
    Convert Windows tracert output
    into structured hop dictionaries.
    """

    hops = []

    if not output:
        return hops


    # Windows tracert hop lines normally look like:
    #
    # 1    2 ms    1 ms    1 ms    192.168.1.1
    #
    # or:
    #
    # 4    *       *       *       Request timed out.

    hop_pattern = re.compile(
        r"^\s*"
        r"(\d+)"
        r"\s+"
        r"(\*|<\d+\s*ms|\d+\s*ms)"
        r"\s+"
        r"(\*|<\d+\s*ms|\d+\s*ms)"
        r"\s+"
        r"(\*|<\d+\s*ms|\d+\s*ms)"
        r"\s+"
        r"(.+?)"
        r"\s*$",
        re.IGNORECASE
    )


    for line in output.splitlines():

        match = hop_pattern.match(
            line
        )

        if not match:
            continue


        hop_number = int(
            match.group(1)
        )

        probe_1 = match.group(2)
        probe_2 = match.group(3)
        probe_3 = match.group(4)

        destination = (
            match.group(5)
            .strip()
        )


        numeric_latencies = []

        for probe in [
            probe_1,
            probe_2,
            probe_3
        ]:

            latency = parse_latency(
                probe
            )

            if latency is not None:
                numeric_latencies.append(
                    latency
                )


        timed_out = (
            len(numeric_latencies) == 0
        )


        if numeric_latencies:

            average_latency = (
                sum(numeric_latencies)
                /
                len(numeric_latencies)
            )

            average_latency = round(
                average_latency,
                2
            )

        else:

            average_latency = None


        if (
            "Request timed out"
            in destination
        ):

            address = None

        else:

            address = destination


        hop = {
            "hop":
                hop_number,

            "probe_1":
                probe_1,

            "probe_2":
                probe_2,

            "probe_3":
                probe_3,

            "address":
                address,

            "average_latency_ms":
                average_latency,

            "timed_out":
                timed_out
        }


        hops.append(
            hop
        )


    return hops


def trace_route(host):

    try:

        command = [
            "tracert",
            "-4",
            "-d",
            "-h",
            "20",
            "-w",
            "500",
            host
        ]


        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=40
        )


        output = (
            result.stdout.strip()
        )


        if (
            not output
            and result.stderr
        ):

            output = (
                result.stderr.strip()
            )


        hops = (
            parse_traceroute_output(
                output
            )
        )


        return {
            "host":
                host,

            "output":
                output if output else None,

            "successful":
                result.returncode == 0,

            "hop_count":
                len(hops),

            "hops":
                hops
        }


    except subprocess.TimeoutExpired:

        return {
            "host":
                host,

            "output":
                None,

            "successful":
                False,

            "hop_count":
                0,

            "hops":
                [],

            "error":
                (
                    "Traceroute exceeded "
                    "the 40 second limit."
                )
        }


    except Exception as error:

        return {
            "host":
                host,

            "output":
                None,

            "successful":
                False,

            "hop_count":
                0,

            "hops":
                [],

            "error":
                str(error)
        }


if __name__ == "__main__":

    host = input(
        "Enter a host to trace: "
    ).strip()


    if not host:

        print(
            "A hostname is required."
        )


    else:

        result = trace_route(
            host
        )


        print(
            "\nTraceroute Diagnostic"
        )

        print(
            "-" * 50
        )


        if result["output"]:

            print(
                result["output"]
            )


            print(
                "\nParsed Hops"
            )

            print(
                "-" * 50
            )


            for hop in result["hops"]:

                if hop["timed_out"]:

                    print(
                        f'Hop {hop["hop"]}: '
                        "Timed out"
                    )

                else:

                    print(
                        f'Hop {hop["hop"]}: '
                        f'{hop["address"]} | '
                        f'{hop["average_latency_ms"]} ms'
                    )


        else:

            print(
                "Traceroute did not complete."
            )

            print(
                result.get(
                    "error",
                    "Unknown error"
                )
            )