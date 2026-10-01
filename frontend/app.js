const hostInput =
    document.getElementById("hostInput");

const diagnoseButton =
    document.getElementById("diagnoseButton");

const tracerouteButton =
    document.getElementById(
        "tracerouteButton"
    );


const dnsValue =
    document.getElementById("dnsValue");

const dnsIp =
    document.getElementById("dnsIp");


const pingValue =
    document.getElementById("pingValue");

const packetLoss =
    document.getElementById("packetLoss");


const tcpValue =
    document.getElementById("tcpValue");

const tcpTime =
    document.getElementById("tcpTime");


const httpValue =
    document.getElementById("httpValue");

const httpTime =
    document.getElementById("httpTime");


const overallStatus =
    document.getElementById("overallStatus");

const overallStatusPanel =
    document.getElementById(
        "overallStatusPanel"
    );


const apiStatus =
    document.getElementById("apiStatus");

const apiStatusText =
    document.getElementById(
        "apiStatusText"
    );


const historyTable =
    document.getElementById(
        "historyTable"
    );


/* --------------------------------------------------
   TRACEROUTE ELEMENTS
-------------------------------------------------- */

const tracerouteBody =
    document.getElementById(
        "tracerouteBody"
    );

const tracerouteDescription =
    document.getElementById(
        "tracerouteDescription"
    );

const tracerouteSummary =
    document.getElementById(
        "tracerouteSummary"
    );


/* --------------------------------------------------
   ROUTE ANALYSIS ELEMENTS
-------------------------------------------------- */

const routeTotalHops =
    document.getElementById(
        "routeTotalHops"
    );

const routeRespondingHops =
    document.getElementById(
        "routeRespondingHops"
    );

const routeTimeoutHops =
    document.getElementById(
        "routeTimeoutHops"
    );

const routeFinalLatency =
    document.getElementById(
        "routeFinalLatency"
    );

const routeSlowestHop =
    document.getElementById(
        "routeSlowestHop"
    );

const routeLargestJump =
    document.getElementById(
        "routeLargestJump"
    );


/* --------------------------------------------------
   PERFORMANCE SUMMARY ELEMENTS
-------------------------------------------------- */

const summaryDescription =
    document.getElementById(
        "summaryDescription"
    );

const averageLatency =
    document.getElementById(
        "averageLatency"
    );

const minimumLatency =
    document.getElementById(
        "minimumLatency"
    );

const maximumLatency =
    document.getElementById(
        "maximumLatency"
    );

const averageHttpResponse =
    document.getElementById(
        "averageHttpResponse"
    );


/* --------------------------------------------------
   LATENCY CHART ELEMENTS
-------------------------------------------------- */

const latencyChartCanvas =
    document.getElementById(
        "latencyChart"
    );

const chartDescription =
    document.getElementById(
        "chartDescription"
    );


/* --------------------------------------------------
   HTTPS CHART ELEMENTS
-------------------------------------------------- */

const httpResponseChartCanvas =
    document.getElementById(
        "httpResponseChart"
    );

const httpChartDescription =
    document.getElementById(
        "httpChartDescription"
    );


/* --------------------------------------------------
   HEATMAP ELEMENTS
-------------------------------------------------- */

const heatmapBody =
    document.getElementById(
        "heatmapBody"
    );

const heatmapDescription =
    document.getElementById(
        "heatmapDescription"
    );


let latencyChart;
let httpResponseChart;


/* --------------------------------------------------
   TIMESTAMP PARSING
-------------------------------------------------- */

function parseUtcTimestamp(timestamp) {

    if (!timestamp) {
        return null;
    }


    const utcTimestamp =
        timestamp.replace(
            " ",
            "T"
        ) + "Z";


    const date =
        new Date(
            utcTimestamp
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return null;
    }


    return date;
}


/* --------------------------------------------------
   TIMESTAMP FORMATTING
-------------------------------------------------- */

function formatTimestamp(timestamp) {

    const date =
        parseUtcTimestamp(
            timestamp
        );


    if (!date) {

        return timestamp || "--";
    }


    return new Intl.DateTimeFormat(
        undefined,
        {
            month:
                "short",

            day:
                "numeric",

            hour:
                "numeric",

            minute:
                "2-digit"
        }
    ).format(date);
}


/* --------------------------------------------------
   API STATUS
-------------------------------------------------- */

async function checkApiStatus() {

    apiStatus.className =
        "api-status checking";


    apiStatusText.textContent =
        "Checking API...";


    try {

        const response =
            await fetch(
                "/api/status"
            );


        if (!response.ok) {

            throw new Error(
                "API unavailable"
            );
        }


        const data =
            await response.json();


        if (
            data.status ===
            "online"
        ) {

            apiStatus.className =
                "api-status online";


            apiStatusText.textContent =
                "API Online";

        } else {

            apiStatus.className =
                "api-status offline";


            apiStatusText.textContent =
                "API Offline";
        }


        console.log(
            "NetScope API:",
            data.status
        );


    } catch (error) {

        apiStatus.className =
            "api-status offline";


        apiStatusText.textContent =
            "API Offline";


        console.error(
            "API status check failed:",
            error
        );
    }
}


/* --------------------------------------------------
   FILTER HISTORY BY TARGET
-------------------------------------------------- */

function getTargetHistory(
    history,
    target
) {

    return history
        .filter(
            (item) =>
                item.target.toLowerCase() ===
                target.toLowerCase()
        )
        .reverse();
}


/* --------------------------------------------------
   PERFORMANCE SUMMARY
-------------------------------------------------- */

function updatePerformanceSummary(
    history,
    target
) {

    const targetHistory =
        getTargetHistory(
            history,
            target
        );


    const latencyValues =
        targetHistory
            .map(
                (item) =>
                    item.average_latency_ms
            )
            .filter(
                (value) =>
                    value !== null
            );


    const httpValues =
        targetHistory
            .map(
                (item) =>
                    item.http_response_ms
            )
            .filter(
                (value) =>
                    value !== null
            );


    summaryDescription.textContent =
        `Historical performance statistics for ${target}.`;


    if (
        latencyValues.length === 0
    ) {

        averageLatency.textContent =
            "--";

        minimumLatency.textContent =
            "--";

        maximumLatency.textContent =
            "--";

    } else {

        const latencyTotal =
            latencyValues.reduce(
                (total, value) =>
                    total + value,
                0
            );


        const latencyAverage =
            latencyTotal /
            latencyValues.length;


        const latencyMinimum =
            Math.min(
                ...latencyValues
            );


        const latencyMaximum =
            Math.max(
                ...latencyValues
            );


        averageLatency.textContent =
            `${latencyAverage.toFixed(1)} ms`;


        minimumLatency.textContent =
            `${latencyMinimum} ms`;


        maximumLatency.textContent =
            `${latencyMaximum} ms`;
    }


    if (
        httpValues.length === 0
    ) {

        averageHttpResponse.textContent =
            "--";

    } else {

        const httpTotal =
            httpValues.reduce(
                (total, value) =>
                    total + value,
                0
            );


        const httpAverage =
            httpTotal /
            httpValues.length;


        averageHttpResponse.textContent =
            `${httpAverage.toFixed(1)} ms`;
    }
}


/* --------------------------------------------------
   LATENCY CHART
-------------------------------------------------- */

function renderLatencyChart(
    history,
    target
) {

    const targetHistory =
        getTargetHistory(
            history,
            target
        )
        .filter(
            (item) =>
                item.average_latency_ms !== null
        );


    const labels =
        targetHistory.map(
            (item) =>
                formatTimestamp(
                    item.timestamp
                )
        );


    const latencyValues =
        targetHistory.map(
            (item) =>
                item.average_latency_ms
        );


    if (
        targetHistory.length === 0
    ) {

        chartDescription.textContent =
            `No latency history available for ${target}.`;

    } else {

        chartDescription.textContent =
            `Historical ping latency for ${target}.`;
    }


    if (latencyChart) {

        latencyChart.destroy();
    }


    latencyChart =
        new Chart(
            latencyChartCanvas,
            {
                type:
                    "line",

                data: {

                    labels:
                        labels,

                    datasets: [
                        {
                            label:
                                "Average Latency (ms)",

                            data:
                                latencyValues,

                            tension:
                                0.3,

                            fill:
                                false,

                            pointRadius:
                                4,

                            pointHoverRadius:
                                6
                        }
                    ]
                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    interaction: {

                        intersect:
                            false,

                        mode:
                            "index"
                    },

                    scales: {

                        y: {

                            beginAtZero:
                                true,

                            title: {

                                display:
                                    true,

                                text:
                                    "Latency (ms)"
                            }
                        },

                        x: {

                            title: {

                                display:
                                    true,

                                text:
                                    "Diagnostic Time"
                            }
                        }
                    },

                    plugins: {

                        legend: {

                            display:
                                true
                        },

                        tooltip: {

                            enabled:
                                true
                        }
                    }
                }
            }
        );
}


/* --------------------------------------------------
   HTTPS RESPONSE CHART
-------------------------------------------------- */

function renderHttpResponseChart(
    history,
    target
) {

    const targetHistory =
        getTargetHistory(
            history,
            target
        )
        .filter(
            (item) =>
                item.http_response_ms !== null
        );


    const labels =
        targetHistory.map(
            (item) =>
                formatTimestamp(
                    item.timestamp
                )
        );


    const responseValues =
        targetHistory.map(
            (item) =>
                item.http_response_ms
        );


    if (
        targetHistory.length === 0
    ) {

        httpChartDescription.textContent =
            `No HTTPS response history available for ${target}.`;

    } else {

        httpChartDescription.textContent =
            `Historical HTTPS response time for ${target}.`;
    }


    if (httpResponseChart) {

        httpResponseChart.destroy();
    }


    httpResponseChart =
        new Chart(
            httpResponseChartCanvas,
            {
                type:
                    "line",

                data: {

                    labels:
                        labels,

                    datasets: [
                        {
                            label:
                                "HTTPS Response Time (ms)",

                            data:
                                responseValues,

                            tension:
                                0.3,

                            fill:
                                false,

                            pointRadius:
                                4,

                            pointHoverRadius:
                                6
                        }
                    ]
                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    interaction: {

                        intersect:
                            false,

                        mode:
                            "index"
                    },

                    scales: {

                        y: {

                            beginAtZero:
                                true,

                            title: {

                                display:
                                    true,

                                text:
                                    "Response Time (ms)"
                            }
                        },

                        x: {

                            title: {

                                display:
                                    true,

                                text:
                                    "Diagnostic Time"
                            }
                        }
                    },

                    plugins: {

                        legend: {

                            display:
                                true
                        },

                        tooltip: {

                            enabled:
                                true
                        }
                    }
                }
            }
        );
}


/* --------------------------------------------------
   PERFORMANCE HEATMAP
-------------------------------------------------- */

function renderHeatmap(
    history,
    target
) {

    const targetHistory =
        getTargetHistory(
            history,
            target
        );


    heatmapDescription.textContent =
        `Average latency by day and time period for ${target}.`;


    const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];


    const periods = [
        "Night",
        "Morning",
        "Afternoon",
        "Evening"
    ];


    const heatmapData = {};


    days.forEach(
        (day) => {

            heatmapData[day] = {

                Night:
                    [],

                Morning:
                    [],

                Afternoon:
                    [],

                Evening:
                    []
            };
        }
    );


    targetHistory.forEach(
        (item) => {

            if (
                item.average_latency_ms ===
                null
            ) {

                return;
            }


            const date =
                parseUtcTimestamp(
                    item.timestamp
                );


            if (!date) {

                return;
            }


            const day =
                days[
                    date.getDay()
                ];


            const hour =
                date.getHours();


            let period;


            if (
                hour < 6
            ) {

                period =
                    "Night";

            } else if (
                hour < 12
            ) {

                period =
                    "Morning";

            } else if (
                hour < 18
            ) {

                period =
                    "Afternoon";

            } else {

                period =
                    "Evening";
            }


            heatmapData[
                day
            ][
                period
            ].push(
                item.average_latency_ms
            );
        }
    );


    const cellAverages =
        [];


    days.forEach(
        (day) => {

            periods.forEach(
                (period) => {

                    const values =
                        heatmapData[
                            day
                        ][
                            period
                        ];


                    if (
                        values.length > 0
                    ) {

                        const total =
                            values.reduce(
                                (
                                    sum,
                                    value
                                ) =>
                                    sum + value,
                                0
                            );


                        const average =
                            total /
                            values.length;


                        cellAverages.push(
                            average
                        );
                    }
                }
            );
        }
    );


    const minimum =
        cellAverages.length > 0
            ? Math.min(
                ...cellAverages
            )
            : 0;


    const maximum =
        cellAverages.length > 0
            ? Math.max(
                ...cellAverages
            )
            : 0;


    heatmapBody.innerHTML =
        "";


    days.forEach(
        (day) => {

            const row =
                document.createElement(
                    "tr"
                );


            const dayCell =
                document.createElement(
                    "td"
                );


            dayCell.textContent =
                day;


            row.appendChild(
                dayCell
            );


            periods.forEach(
                (period) => {

                    const cell =
                        document.createElement(
                            "td"
                        );


                    const values =
                        heatmapData[
                            day
                        ][
                            period
                        ];


                    if (
                        values.length === 0
                    ) {

                        cell.textContent =
                            "--";


                        cell.classList.add(
                            "heatmap-empty"
                        );

                    } else {

                        const total =
                            values.reduce(
                                (
                                    sum,
                                    value
                                ) =>
                                    sum + value,
                                0
                            );


                        const average =
                            total /
                            values.length;


                        cell.textContent =
                            `${average.toFixed(1)} ms`;


                        cell.classList.add(
                            "heatmap-cell"
                        );


                        let intensity =
                            0.35;


                        if (
                            maximum > minimum
                        ) {

                            intensity =
                                0.2 +
                                (
                                    (
                                        average -
                                        minimum
                                    ) /
                                    (
                                        maximum -
                                        minimum
                                    )
                                ) *
                                0.65;
                        }


                        cell.style.backgroundColor =
                            `rgba(53, 106, 230, ${intensity})`;


                        cell.style.color =
                            intensity > 0.55
                                ? "white"
                                : "#172033";


                        cell.title =
                            `${day} ${period}: ` +
                            `${average.toFixed(1)} ms ` +
                            `(${values.length} sample` +
                            `${values.length === 1 ? "" : "s"})`;
                    }


                    row.appendChild(
                        cell
                    );
                }
            );


            heatmapBody.appendChild(
                row
            );
        }
    );
}


/* --------------------------------------------------
   HISTORY BADGE HELPERS
-------------------------------------------------- */

function getStatusBadgeClass(
    status
) {

    if (
        status ===
        "HEALTHY"
    ) {

        return "healthy";
    }


    if (
        status ===
        "DEGRADED"
    ) {

        return "degraded";
    }


    return "unknown";
}


function getHttpBadgeClass(
    statusCode
) {

    if (
        statusCode === null ||
        statusCode === undefined
    ) {

        return "http-none";
    }


    if (
        statusCode >= 200 &&
        statusCode < 400
    ) {

        return "http-success";
    }


    if (
        statusCode >= 400 &&
        statusCode < 500
    ) {

        return "http-warning";
    }


    if (
        statusCode >= 500
    ) {

        return "http-error";
    }


    return "http-none";
}


/* --------------------------------------------------
   LOAD HISTORY
-------------------------------------------------- */

async function loadHistory() {

    try {

        const response =
            await fetch(
                "/api/history?limit=100"
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load history."
            );
        }


        const history =
            await response.json();


        const selectedTarget =
            hostInput.value.trim() ||
            "github.com";


        updatePerformanceSummary(
            history,
            selectedTarget
        );


        renderLatencyChart(
            history,
            selectedTarget
        );


        renderHttpResponseChart(
            history,
            selectedTarget
        );


        renderHeatmap(
            history,
            selectedTarget
        );


        const recentHistory =
            history.slice(
                0,
                10
            );


        historyTable.innerHTML =
            "";


        if (
            recentHistory.length === 0
        ) {

            historyTable.innerHTML = `
                <tr>
                    <td colspan="6">
                        No diagnostic history available.
                    </td>
                </tr>
            `;

            return;
        }


        recentHistory.forEach(
            (item) => {

                const row =
                    document.createElement(
                        "tr"
                    );


                const statusClass =
                    getStatusBadgeClass(
                        item.overall_status
                    );


                const httpClass =
                    getHttpBadgeClass(
                        item.http_status_code
                    );


                row.innerHTML = `
                    <td>
                        ${formatTimestamp(item.timestamp)}
                    </td>

                    <td>
                        ${item.target}
                    </td>

                    <td>
                        <span
                            class="status-badge ${statusClass}"
                        >
                            ${item.overall_status || "UNKNOWN"}
                        </span>
                    </td>

                    <td>
                        ${
                            item.average_latency_ms !== null
                                ? `${item.average_latency_ms} ms`
                                : "--"
                        }
                    </td>

                    <td>
                        ${
                            item.packet_loss_percent !== null
                                ? `${item.packet_loss_percent}%`
                                : "--"
                        }
                    </td>

                    <td>
                        <span
                            class="http-badge ${httpClass}"
                        >
                            ${
                                item.http_status_code !== null
                                    ? item.http_status_code
                                    : "--"
                            }
                        </span>
                    </td>
                `;


                historyTable.appendChild(
                    row
                );
            }
        );


    } catch (error) {

        console.error(
            error
        );


        historyTable.innerHTML = `
            <tr>
                <td colspan="6">
                    Unable to load diagnostic history.
                </td>
            </tr>
        `;


        chartDescription.textContent =
            "Unable to load latency history.";


        httpChartDescription.textContent =
            "Unable to load HTTPS response history.";


        summaryDescription.textContent =
            "Unable to calculate historical statistics.";


        heatmapDescription.textContent =
            "Unable to load heatmap data.";


        heatmapBody.innerHTML = `
            <tr>
                <td colspan="5">
                    Unable to load latency heatmap.
                </td>
            </tr>
        `;
    }
}


/* --------------------------------------------------
   OVERALL STATUS DISPLAY
-------------------------------------------------- */

function setOverallStatus(
    status,
    message
) {

    overallStatus.textContent =
        message;


    overallStatusPanel.className =
        "status-panel";


    switch (status) {

        case "healthy":

            overallStatusPanel.classList.add(
                "status-healthy"
            );

            break;


        case "degraded":

            overallStatusPanel.classList.add(
                "status-degraded"
            );

            break;


        case "running":

            overallStatusPanel.classList.add(
                "status-running"
            );

            break;


        case "failed":

            overallStatusPanel.classList.add(
                "status-failed"
            );

            break;


        default:

            overallStatusPanel.classList.add(
                "status-neutral"
            );
    }
}


/* --------------------------------------------------
   DISPLAY CURRENT DIAGNOSTIC
-------------------------------------------------- */

function displayDiagnostic(
    data
) {

    dnsValue.textContent =
        data.dns_lookup_ms !== null
            ? `${data.dns_lookup_ms} ms`
            : "--";


    dnsIp.textContent =
        data.ip_address
            ? `IP: ${data.ip_address}`
            : "IP unavailable";


    pingValue.textContent =
        data.average_latency_ms !== null
            ? `${data.average_latency_ms} ms`
            : "--";


    packetLoss.textContent =
        data.packet_loss_percent !== null
            ? `Packet loss: ${data.packet_loss_percent}%`
            : "Packet loss: --";


    tcpValue.textContent =
        data.port_443_status ||
        "--";


    tcpTime.textContent =
        data.port_443_time_ms !== null
            ? `Connection time: ${data.port_443_time_ms} ms`
            : "Connection time: --";


    httpValue.textContent =
        data.http_status_code !== null
            ? `HTTP ${data.http_status_code}`
            : "--";


    httpTime.textContent =
        data.http_response_ms !== null
            ? `Response time: ${data.http_response_ms} ms`
            : "Response time: --";


    if (
        data.overall_status ===
        "HEALTHY"
    ) {

        setOverallStatus(
            "healthy",
            "Healthy"
        );

    } else {

        setOverallStatus(
            "degraded",
            "Degraded"
        );
    }
}


/* --------------------------------------------------
   RESET ROUTE ANALYSIS
-------------------------------------------------- */

function resetRouteAnalysis() {

    routeTotalHops.textContent =
        "--";


    routeRespondingHops.textContent =
        "--";


    routeTimeoutHops.textContent =
        "--";


    routeFinalLatency.textContent =
        "--";


    routeSlowestHop.textContent =
        "--";


    routeLargestJump.textContent =
        "--";
}


/* --------------------------------------------------
   ROUTE ANALYSIS
-------------------------------------------------- */

function analyzeRoute(hops) {

    const respondingHops =
        hops.filter(
            (hop) =>
                hop.timed_out !== true &&
                hop.average_latency_ms !== null &&
                hop.average_latency_ms !== undefined
        );


    const timedOutHops =
        hops.filter(
            (hop) =>
                hop.timed_out === true
        );


    routeTotalHops.textContent =
        hops.length;


    routeRespondingHops.textContent =
        respondingHops.length;


    routeTimeoutHops.textContent =
        timedOutHops.length;


    /*
    Final hop latency
    */

    const finalHop =
        hops.length > 0
            ? hops[
                hops.length - 1
            ]
            : null;


    if (
        finalHop &&
        finalHop.average_latency_ms !== null &&
        finalHop.average_latency_ms !== undefined
    ) {

        routeFinalLatency.textContent =
            `${finalHop.average_latency_ms} ms`;

    } else {

        routeFinalLatency.textContent =
            "--";
    }


    /*
    Slowest responding hop
    */

    let slowestHop =
        null;


    respondingHops.forEach(
        (hop) => {

            if (
                slowestHop === null ||
                hop.average_latency_ms >
                slowestHop.average_latency_ms
            ) {

                slowestHop =
                    hop;
            }
        }
    );


    if (slowestHop) {

        routeSlowestHop.textContent =
            `Hop ${slowestHop.hop} · ` +
            `${slowestHop.average_latency_ms} ms`;

    } else {

        routeSlowestHop.textContent =
            "--";
    }


    /*
    Largest latency increase between
    physically consecutive responding hops.

    If a hop between two measurements
    timed out, that pair is skipped.
    */

    let largestJump =
        null;


    for (
        let index = 1;
        index < hops.length;
        index++
    ) {

        const previousHop =
            hops[
                index - 1
            ];


        const currentHop =
            hops[
                index
            ];


        const previousLatency =
            previousHop.average_latency_ms;


        const currentLatency =
            currentHop.average_latency_ms;


        if (
            previousHop.timed_out === true ||
            currentHop.timed_out === true ||
            previousLatency === null ||
            previousLatency === undefined ||
            currentLatency === null ||
            currentLatency === undefined
        ) {

            continue;
        }


        const difference =
            currentLatency -
            previousLatency;


        if (
            difference > 0 &&
            (
                largestJump === null ||
                difference >
                largestJump.difference
            )
        ) {

            largestJump = {

                fromHop:
                    previousHop.hop,

                toHop:
                    currentHop.hop,

                difference:
                    difference
            };
        }
    }


    if (largestJump) {

        routeLargestJump.textContent =
            `Hop ${largestJump.fromHop} → ` +
            `${largestJump.toHop} · ` +
            `+${largestJump.difference.toFixed(2)} ms`;

    } else {

        routeLargestJump.textContent =
            "--";
    }


    return {

        slowestHop:
            slowestHop,

        largestJump:
            largestJump
    };
}


/* --------------------------------------------------
   DISPLAY TRACEROUTE
-------------------------------------------------- */

function displayTraceroute(data) {

    const hops =
        Array.isArray(
            data.hops
        )
            ? data.hops
            : [];


    const analysis =
        analyzeRoute(
            hops
        );


    tracerouteBody.innerHTML =
        "";


    tracerouteDescription.textContent =
        `Hop-by-hop network path to ${data.host}.`;


    tracerouteSummary.textContent =
        `${hops.length} hop${
            hops.length === 1
                ? ""
                : "s"
        }`;


    if (
        hops.length === 0
    ) {

        tracerouteBody.innerHTML = `
            <tr>
                <td colspan="7">
                    No traceroute hops were returned.
                </td>
            </tr>
        `;

        return;
    }


    hops.forEach(
        (hop) => {

            const row =
                document.createElement(
                    "tr"
                );


            if (
                analysis.slowestHop &&
                hop.hop ===
                analysis.slowestHop.hop
            ) {

                row.classList.add(
                    "slowest-hop"
                );
            }


            const timedOut =
                hop.timed_out ===
                true;


            const statusClass =
                timedOut
                    ? "timeout"
                    : "responded";


            const statusText =
                timedOut
                    ? "Timed Out"
                    : "Responded";


            row.innerHTML = `
                <td>
                    ${hop.hop}
                </td>

                <td class="traceroute-address">
                    ${
                        hop.address ||
                        "--"
                    }
                </td>

                <td>
                    ${
                        hop.probe_1 ||
                        "--"
                    }
                </td>

                <td>
                    ${
                        hop.probe_2 ||
                        "--"
                    }
                </td>

                <td>
                    ${
                        hop.probe_3 ||
                        "--"
                    }
                </td>

                <td>
                    ${
                        hop.average_latency_ms !== null &&
                        hop.average_latency_ms !== undefined
                            ? `${hop.average_latency_ms} ms`
                            : "--"
                    }
                </td>

                <td>
                    <span
                        class="hop-status ${statusClass}"
                    >
                        ${statusText}
                    </span>
                </td>
            `;


            tracerouteBody.appendChild(
                row
            );
        }
    );
}


/* --------------------------------------------------
   RUN TRACEROUTE
-------------------------------------------------- */

async function runTraceroute() {

    const host =
        hostInput.value.trim();


    if (!host) {

        alert(
            "Please enter a hostname."
        );

        return;
    }


    tracerouteButton.disabled =
        true;


    tracerouteButton.textContent =
        "Tracing...";


    tracerouteSummary.textContent =
        "Running";


    tracerouteDescription.textContent =
        `Tracing network path to ${host}...`;


    resetRouteAnalysis();


    tracerouteBody.innerHTML = `
        <tr>
            <td colspan="7">
                Running traceroute. This may take several seconds...
            </td>
        </tr>
    `;


    try {

        const response =
            await fetch(
                "/api/traceroute",
                {
                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            {
                                host:
                                    host
                            }
                        )
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Traceroute request failed."
            );
        }


        const hops =
            Array.isArray(
                data.hops
            )
                ? data.hops
                : [];


        if (
            data.successful === false &&
            hops.length === 0
        ) {

            throw new Error(
                data.error ||
                "Traceroute did not complete."
            );
        }


        displayTraceroute(
            data
        );


    } catch (error) {

        console.error(
            error
        );


        tracerouteSummary.textContent =
            "Failed";


        tracerouteDescription.textContent =
            "Traceroute could not be completed.";


        resetRouteAnalysis();


        tracerouteBody.innerHTML = `
            <tr>
                <td colspan="7">
                    Traceroute failed.
                </td>
            </tr>
        `;


        alert(
            error.message
        );


    } finally {

        tracerouteButton.disabled =
            false;


        tracerouteButton.textContent =
            "Run Traceroute";
    }
}


/* --------------------------------------------------
   RUN DIAGNOSTIC
-------------------------------------------------- */

async function runDiagnostic() {

    const host =
        hostInput.value.trim();


    if (!host) {

        alert(
            "Please enter a hostname."
        );

        return;
    }


    diagnoseButton.disabled =
        true;


    diagnoseButton.textContent =
        "Running...";


    setOverallStatus(
        "running",
        "Running diagnostic..."
    );


    try {

        const response =
            await fetch(
                "/api/diagnostics",
                {
                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            {
                                host:
                                    host
                            }
                        )
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Diagnostic failed."
            );
        }


        displayDiagnostic(
            data
        );


        await loadHistory();


    } catch (error) {

        console.error(
            error
        );


        setOverallStatus(
            "failed",
            "Diagnostic failed"
        );


        alert(
            error.message
        );


    } finally {

        diagnoseButton.disabled =
            false;


        diagnoseButton.textContent =
            "Run Diagnostic";
    }
}


/* --------------------------------------------------
   BUTTON EVENTS
-------------------------------------------------- */

diagnoseButton.addEventListener(
    "click",
    runDiagnostic
);


tracerouteButton.addEventListener(
    "click",
    runTraceroute
);


/* --------------------------------------------------
   ENTER KEY
-------------------------------------------------- */

hostInput.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key ===
            "Enter"
        ) {

            runDiagnostic();
        }
    }
);


/* --------------------------------------------------
   INITIAL PAGE LOAD
-------------------------------------------------- */

checkApiStatus();

loadHistory();