from pathlib import Path

from fastapi import (
    FastAPI,
    HTTPException,
    Query
)

from fastapi.staticfiles import (
    StaticFiles
)

from fastapi.responses import (
    FileResponse
)

from pydantic import (
    BaseModel,
    Field
)


from netscope_report import (
    run_diagnostic
)

from diagnostics.traceroute_check import (
    trace_route
)

from storage.database import (
    initialize_database,
    get_diagnostic_history
)


# --------------------------------------------------
# FASTAPI APPLICATION
# --------------------------------------------------

app = FastAPI(
    title="NetScope API",
    description=(
        "REST API for network diagnostics "
        "and monitoring."
    ),
    version="1.0.0"
)


# --------------------------------------------------
# PROJECT PATHS
# --------------------------------------------------

BASE_DIR = (
    Path(__file__)
    .resolve()
    .parents[1]
)

FRONTEND_DIR = (
    BASE_DIR /
    "frontend"
)


# --------------------------------------------------
# STATIC FRONTEND
# --------------------------------------------------

app.mount(
    "/static",
    StaticFiles(
        directory=FRONTEND_DIR
    ),
    name="static"
)


# --------------------------------------------------
# DATABASE INITIALIZATION
# --------------------------------------------------

initialize_database()


# --------------------------------------------------
# REQUEST MODEL
# --------------------------------------------------

class DiagnosticRequest(BaseModel):

    host: str = Field(
        min_length=1,
        max_length=253,
        examples=[
            "github.com"
        ]
    )


# --------------------------------------------------
# HOST VALIDATION
# --------------------------------------------------

def validate_host(host):

    host = host.strip()


    if not host:

        raise HTTPException(
            status_code=400,
            detail=(
                "Host cannot be empty."
            )
        )


    if (
        "://" in host
        or "/" in host
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "Enter a hostname only, "
                "such as github.com."
            )
        )


    if " " in host:

        raise HTTPException(
            status_code=400,
            detail=(
                "Hostnames cannot contain spaces."
            )
        )


    return host


# --------------------------------------------------
# DATABASE ROW CONVERSION
# --------------------------------------------------

def history_row_to_dict(row):

    return {
        "id":
            row[0],

        "timestamp":
            row[1],

        "target":
            row[2],

        "ip_address":
            row[3],

        "dns_lookup_ms":
            row[4],

        "ping_reachable":
            bool(row[5]),

        "packet_loss_percent":
            row[6],

        "average_latency_ms":
            row[7],

        "port_80_status":
            row[8],

        "port_80_time_ms":
            row[9],

        "port_443_status":
            row[10],

        "port_443_time_ms":
            row[11],

        "http_status_code":
            row[12],

        "http_response_ms":
            row[13],

        "overall_status":
            row[14]
    }


# --------------------------------------------------
# FRONTEND
# --------------------------------------------------

@app.get("/")
def root():

    return FileResponse(
        FRONTEND_DIR /
        "index.html"
    )


# --------------------------------------------------
# API STATUS
# --------------------------------------------------

@app.get("/api/status")
def api_status():

    return {
        "name":
            "NetScope API",

        "status":
            "online",

        "version":
            "1.0.0"
    }


# --------------------------------------------------
# DIAGNOSTIC HISTORY
# --------------------------------------------------

@app.get("/api/history")
def get_history(
    limit: int = Query(
        default=10,
        ge=1,
        le=100
    )
):

    rows = (
        get_diagnostic_history(
            limit
        )
    )


    return [
        history_row_to_dict(
            row
        )
        for row in rows
    ]


# --------------------------------------------------
# RUN NETWORK DIAGNOSTIC
# --------------------------------------------------

@app.post("/api/diagnostics")
def create_diagnostic(
    request: DiagnosticRequest
):

    host = validate_host(
        request.host
    )


    report = run_diagnostic(
        host
    )


    if report is None:

        raise HTTPException(
            status_code=400,
            detail=(
                "Unable to resolve "
                "the supplied hostname."
            )
        )


    return report


# --------------------------------------------------
# RUN TRACEROUTE
# --------------------------------------------------

@app.post("/api/traceroute")
def create_traceroute(
    request: DiagnosticRequest
):

    host = validate_host(
        request.host
    )


    result = trace_route(
        host
    )


    return {
        "host":
            host,

        "successful":
            result.get(
                "successful",
                False
            ),

        "hop_count":
            result.get(
                "hop_count",
                0
            ),

        "hops":
            result.get(
                "hops",
                []
            ),

        "output":
            result.get(
                "output"
            ),

        "error":
            result.get(
                "error"
            )
    }