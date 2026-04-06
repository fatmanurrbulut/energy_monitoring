import csv
import io
import os
from datetime import datetime, timezone
from typing import Any

import requests
from flask import Flask, jsonify, request

app = Flask(__name__)

INFLUX_URL = os.getenv("INFLUX_URL", "http://influxdb:8086")
INFLUX_ORG = os.getenv("INFLUX_ORG", "energy-org")
INFLUX_BUCKET = os.getenv("INFLUX_BUCKET", "energy-bucket")
INFLUX_TOKEN = os.getenv("INFLUX_TOKEN", "")
DEVICE_ID = os.getenv("DEVICE_ID", "device01")


def _to_epoch_ms(value: str) -> int:
    dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
    return int(dt.timestamp() * 1000)


def _build_flux(hours: int, limit: int, device_id: str) -> str:
    return f"""from(bucket: "{INFLUX_BUCKET}")
  |> range(start: -{hours}h)
  |> filter(fn: (r) => r._measurement == "energy_telemetry")
  |> filter(fn: (r) => r.device_id == "{device_id}")
  |> filter(fn: (r) => r.status == "ALERT")
  |> filter(fn: (r) => r._field == "current" or r._field == "voltage" or r._field == "power_est")
  |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
  |> sort(columns: ["_time"], desc: true)
  |> limit(n: {limit})"""


def _query_alarms(hours: int, limit: int, device_id: str) -> list[dict[str, Any]]:
    if not INFLUX_TOKEN:
        return []

    flux = _build_flux(hours, limit, device_id)
    res = requests.post(
        f"{INFLUX_URL}/api/v2/query",
        params={"org": INFLUX_ORG},
        headers={
            "Authorization": f"Token {INFLUX_TOKEN}",
            "Content-Type": "application/vnd.flux",
            "Accept": "application/csv",
        },
        data=flux.encode("utf-8"),
        timeout=15,
    )
    res.raise_for_status()

    lines = [line for line in res.text.splitlines() if line and not line.startswith("#")]
    if len(lines) < 2:
        return []

    reader = csv.DictReader(io.StringIO("\n".join(lines)))
    alerts: list[dict[str, Any]] = []
    for row in reader:
        iso_time = row.get("_time")
        if not iso_time:
            continue
        current = float(row.get("current") or 0.0)
        voltage = float(row.get("voltage") or 0.0)
        power = float(row.get("power_est") or 0.0)
        ts = _to_epoch_ms(iso_time)

        alerts.append(
            {
                "id": f"{ts}-{current:.2f}",
                "timestamp": ts,
                "timestamp_iso": iso_time,
                "current": current,
                "voltage": voltage,
                "power": power,
                "device_id": row.get("device_id", device_id),
                "status": "ALERT",
            }
        )
    return alerts


@app.get("/health")
def health():
    return jsonify({"ok": True})


@app.get("/api/alarms")
def alarms():
    hours = max(1, min(24 * 30, int(request.args.get("hours", 24))))
    limit = max(1, min(1000, int(request.args.get("limit", 200))))
    device_id = request.args.get("device_id", DEVICE_ID)

    try:
        data = _query_alarms(hours, limit, device_id)
        return jsonify(
            {
                "source": "influxdb",
                "count": len(data),
                "hours": hours,
                "limit": limit,
                "device_id": device_id,
                "alarms": data,
            }
        )
    except Exception as exc:  # pragma: no cover
        return jsonify({"source": "influxdb", "error": str(exc), "alarms": []}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)

