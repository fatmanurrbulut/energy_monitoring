# Real-Time Electrical Energy Monitoring IoT System

This repository is the implementation workspace for the CENG436 IoT proposal:
"Real-Time Electrical Energy Monitoring IoT System Using SCT-013 and ESP8266".

## Current Architecture

- `simulator/`: publishes telemetry and device status messages over MQTT
- `mosquitto/`: MQTT broker configuration
- `dashboard/flows.json`: Node-RED dashboard flow (live values, chart, alert)
- `docker-compose.yml`: runs broker + simulator + dashboard together

## Quick Start

```bash
docker compose up --build
```

- MQTT broker: `localhost:1883`
- Node-RED editor/dashboard: `http://localhost:1880`

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
- Dockerized setup with persistent Node-RED data volume

Still pending (high priority):
- Real hardware integration (`SCT-013 + Arduino UNO + ESP8266`)
- RMS current calculation on microcontroller side
- Database integration for historical time-series storage (`InfluxDB` or `PostgreSQL`)
- Dashboard historical analytics fed from database (not only live stream)
- MQTT broker authentication enforcement (`allow_anonymous false`)
- TLS-enabled MQTT path
- Formal validation scenarios (known load comparison, latency metrics)

Optional extensions pending:
- Multi-device monitoring
- Mobile app integration
- Energy anomaly detection

## Suggested Next Sprint (Actionable)

1. Replace simulator input with real serial data from Arduino.
2. Add InfluxDB service and write MQTT measurements to DB via Node-RED.
3. Lock down mosquitto with username/password, then test reconnect paths.
4. Add a test log/report for calibration and end-to-end latency.
