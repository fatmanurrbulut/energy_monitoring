# Real-Time Electrical Energy Monitoring IoT System

This repository is the implementation workspace for the CENG436 IoT proposal:
"Real-Time Electrical Energy Monitoring IoT System Using SCT-013 and ESP8266".

## Current Architecture

- `simulator/`: publishes telemetry and device status messages over MQTT
- `mosquitto/`: MQTT broker configuration
- `dashboard/flows.json`: Node-RED dashboard flow (live + historical charts)
- `dashboard/flows_cred.json`: Node-RED MQTT credentials file
- `nodered/`: custom Node-RED image with dashboard nodes preinstalled
- `docker-compose.yml`: runs broker + simulator + dashboard together

## Quick Start

```bash
docker compose up --build
```

- MQTT broker: `localhost:1883`
- MQTT credentials:
  - username: `device01`
  - password: `energy-2026-secure`
- Node-RED editor/dashboard: `http://localhost:1880`
- InfluxDB UI: `http://localhost:8086`
  - username: `admin`
  - password: `admin12345`
  - org: `energy-org`
  - bucket: `energy-bucket`

## MQTT Topics

- Telemetry: `energy/device01/telemetry`
- Device status / heartbeat: `energy/device01/status`

Telemetry example:

```json
{
  "device_id": "device01",
  "voltage": 224.13,
  "current": 2.48,
  "power_est": 555.84,
  "status": "NORMAL",
  "timestamp": "2026-04-06T11:50:00Z"
}
```

Status example:

```json
{
  "device_id": "device01",
  "state": "online",
  "type": "heartbeat",
  "timestamp": "2026-04-06T11:50:10Z"
}
```

## Proposal Progress Checklist

Completed now:
- End-to-end MQTT pipeline (publisher -> broker -> dashboard)
- Live monitoring widgets (voltage/current/power/status)
- Basic alert logic in dashboard and simulator payload
- Publish-subscribe topic structure
- Device status topic and heartbeat messages
- Time-series telemetry storage to InfluxDB via MQTT bridge
- Historical 1-hour average power chart sourced from InfluxDB
- Mosquitto authentication enabled (`allow_anonymous false`)
- Dockerized setup with persistent Node-RED data volume

Still pending (high priority):
- Real hardware integration (`SCT-013 + Arduino UNO + ESP8266`)
- RMS current calculation on microcontroller side
- Advanced historical analytics/alerts over database data
- TLS-enabled MQTT path
- Formal validation scenarios (known load comparison, latency metrics)

Optional extensions pending:
- Multi-device monitoring
- Mobile app integration
- Energy anomaly detection

## Suggested Next Sprint (Actionable)

1. Replace simulator input with real serial data from Arduino.
2. Connect Node-RED historical chart/query nodes to InfluxDB.
3. Add TLS on mosquitto (`8883`) and migrate clients.
4. Add a test log/report for calibration and end-to-end latency.

## Verify Database Writes

After `docker compose up --build`, run:

```bash
docker logs -f storage_bridge
```

You should see lines like: `Stored telemetry for device=device01`.
