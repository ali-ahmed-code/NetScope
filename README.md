# NetScope

NetScope is a network health and diagnostics dashboard built with Python, FastAPI, JavaScript, and SQLite. It combines common network troubleshooting tools into one interface and stores diagnostic results so network performance can be reviewed over time.

## Features

NetScope supports:

- DNS resolution and lookup timing
- ICMP ping testing
- Packet loss measurement
- Average network latency
- TCP connectivity testing on ports 80 and 443
- TCP connection timing
- HTTPS availability and response-time measurement
- Windows traceroute execution
- Parsed hop-by-hop traceroute results
- Route analysis including:
  - Total hops
  - Responding hops
  - Timed-out hops
  - Final hop latency
  - Slowest observed responding hop
  - Largest latency increase between consecutive responding hops
- Historical diagnostic storage with SQLite
- Recent diagnostic history
- Latency history visualization
- HTTPS response-time visualization
- Latency performance heatmap
- Performance summary statistics
- Continuous network monitoring
- FastAPI REST API
- Automated testing with pytest

## Dashboard

The NetScope dashboard provides a browser-based interface for running diagnostics and reviewing network performance.

Users can enter a hostname such as:

```text
github.com
```

and run either a standard network diagnostic or a traceroute analysis.

The dashboard displays current measurements alongside historical performance data, charts, route information, and stored diagnostics.

## Technology Stack

### Backend

- Python
- FastAPI
- SQLite
- Requests
- Python socket library
- Python subprocess module

### Frontend

- HTML
- CSS
- JavaScript
- Chart.js

### Testing

- pytest
- FastAPI TestClient

## Project Structure

```text
NetScope/
│
├── backend/
│   ├── diagnostics/
│   │   ├── __init__.py
│   │   ├── dns_check.py
│   │   ├── http_check.py
│   │   ├── ping_check.py
│   │   ├── tcp_check.py
│   │   └── traceroute_check.py
│   │
│   ├── storage/
│   │   ├── __init__.py
│   │   └── database.py
│   │
│   ├── api.py
│   ├── history_viewer.py
│   ├── monitor.py
│   └── netscope_report.py
│
├── data/
│   └── .gitkeep
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
│
├── tests/
│   ├── test_api.py
│   └── test_traceroute.py
│
├── .gitignore
├── pyrightconfig.json
├── requirements.txt
└── README.md
```



The frontend communicates with the FastAPI backend through REST endpoints. Individual diagnostic modules collect network measurements, while SQLite stores historical diagnostic results used by the dashboard for performance analysis.

## API Endpoints

### API Status

```http
GET /api/status
```

Returns the current NetScope API status.

### Diagnostic History

```http
GET /api/history
```

Returns stored network diagnostic results.

An optional result limit can also be supplied:

```http
GET /api/history?limit=10
```

### Run Network Diagnostic

```http
POST /api/diagnostics
```

Example request:

```json
{
    "host": "github.com"
}
```

Runs DNS, ping, TCP, and HTTPS diagnostics and stores the result in SQLite.

### Run Traceroute

```http
POST /api/traceroute
```

Example request:

```json
{
    "host": "github.com"
}
```

Runs a traceroute and returns structured hop-by-hop routing information.

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
```

Move into the project directory:

```bash
cd NetScope
```

### 2. Create a virtual environment

```bash
python -m venv .venv
```

### 3. Activate the virtual environment

On Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

If PowerShell blocks activation, temporarily allow scripts for the current terminal:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

Then activate the virtual environment again:

```powershell
.\.venv\Scripts\Activate.ps1
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```



## Running Tests

From the project root:

```bash
python -m pytest -v
```

The automated test suite currently covers:

- Normal latency parsing
- Less-than-one-millisecond latency parsing
- Full traceroute timeout handling
- Traceroute output parsing
- Partial traceroute timeout handling
- API status endpoint
- Invalid full URL rejection
- Invalid hostname path rejection
- Diagnostic history endpoint
- Traceroute endpoint behavior using mocked network results

Current test status:

```text
10 tests passing
```

## Continuous Monitoring

NetScope includes a terminal-based network monitoring script.

From the backend directory:

```bash
python monitor.py
```

The monitor can repeatedly run network diagnostics against a selected target at a configured interval.

## Diagnostic History

Network diagnostic results are stored locally in:

```text
data/netscope.db
```

The SQLite database file is intentionally excluded from Git so local diagnostic history is not uploaded to the repository.

A terminal-based history viewer is also included:

```bash
python history_viewer.py
```

## Traceroute Analysis

NetScope converts Windows `tracert` output into structured data that can be displayed and analyzed in the dashboard.

Each hop includes:

- Hop number
- Three probe results
- Router or destination address
- Average observed response time
- Timeout status

The dashboard also summarizes the route by displaying the number of responding and timed-out hops, final destination latency, slowest observed responding hop, and the largest observed latency increase between consecutive responding hops.

Intermediate traceroute timeouts do not necessarily indicate a failed route. Some routers may choose not to respond to traceroute probes even when later hops and the final destination remain reachable.

## Historical Performance Analysis

NetScope stores completed diagnostic results in SQLite and uses those records to provide historical analysis.

The dashboard includes:

- Average latency
- Best observed latency
- Highest observed latency
- Average HTTPS response time
- Latency history chart
- HTTPS response-time history chart
- Day-and-time latency heatmap
- Recent diagnostic results

Historical dashboard data is filtered by the hostname currently selected by the user.

## Platform Support

NetScope currently targets Windows.

Traceroute uses the Windows command:

```text
tracert
```

and the ping parser is designed around Windows command output.

Future versions could add Linux and macOS support using platform-specific implementations of commands such as `ping` and `traceroute`.

## Security Note

NetScope is currently intended for local development and network diagnostics.

The diagnostic API accepts hostnames and initiates outbound network connections. Additional security controls should be implemented before exposing the application as a public internet service.

## Future Improvements

Potential future improvements include:

- Linux and macOS support
- Authentication
- Safer public deployment controls
- Additional network diagnostic tools
- Exportable diagnostic reports
- Configurable monitoring targets
- Network-health alerts
- More advanced historical analytics
- Additional API validation
- Automated CI testing