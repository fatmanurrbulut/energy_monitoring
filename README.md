# Real-Time Energy Monitoring Platform

Dockerized energy monitoring platform with secure MQTT transport, time-series storage, Node-RED flows, and a modern React dashboard.

## Architecture

- `simulator/`: generates telemetry and heartbeat/status messages
- `mosquitto/`: MQTT broker config, authentication, TLS cert scripts
- `storage_bridge/`: subscribes MQTT telemetry and writes into InfluxDB
- `influxdb`: time-series database
- `nodered/`: Node-RED editor/runtime and dashboard flow support
- `dashboard/flows.json`: tracked Node-RED flow file
- `frontend/`: React + Tailwind + Recharts UI (dark mode)
- `docker-compose.yml`: orchestrates all services

Note: `flows_cred.json` is generated automatically in Node-RED from `.env` credentials at container startup.

## Quick Start

```bash
cp .env.example .env
# update required values in .env
set -a; source .env; set +a
./mosquitto/config/generate-passwd.sh "$MQTT_USERNAME" "$MQTT_PASSWORD"
./mosquitto/certs/generate-certs.sh
docker compose up -d --build
```

## Service Endpoints

- React UI: `http://localhost:1880/ui`
- Node-RED editor: `http://localhost:1881`
- InfluxDB UI: `http://localhost:8086`
- MQTT broker (TLS): `localhost:8883`

## Data Flow

1. `simulator` publishes telemetry to MQTT.
2. `mosquitto` brokers messages over TLS + auth.
3. `storage_bridge` consumes telemetry and writes to InfluxDB (`energy_telemetry`).
4. `frontend` displays live/simulated KPIs, charts, and alarm history.
5. `nodered` provides flow editing and alternate dashboard/automation logic.

## MQTT Topics

- Telemetry: `energy/device01/telemetry`
- Heartbeat/status: `energy/device01/status`

Telemetry payload example:

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

Status payload example:

```json
{
  "device_id": "device01",
  "state": "online",
  "type": "heartbeat",
  "timestamp": "2026-04-06T11:50:10Z"
}
```

## Verification

Check pipeline health:

```bash
docker compose ps
docker logs --tail 80 mosquitto
docker logs --tail 80 storage_bridge
docker logs --tail 80 nodered
```

Verify recent Influx writes:

```bash
set -a; source .env; set +a
docker exec influxdb influx query \
'from(bucket:"energy-bucket") |> range(start: -5m) |> filter(fn: (r) => r._measurement == "energy_telemetry") |> limit(n: 10)' \
--org "$INFLUX_ORG" --token "$INFLUX_TOKEN"
```

## Current Scope

- Secure MQTT (TLS + username/password)
- Live telemetry simulation
- InfluxDB storage bridge
- React dashboard (KPI, charts, alarm history, CSV export)
- Node-RED integration and editable flows

## Next Steps

1. Connect real hardware source instead of simulator.
2. Replace mock frontend stream with WebSocket/MQTT live feed.
3. Add automated integration tests for reconnect/auth/cert rotation.
4. Add retention policies and alert rules on InfluxDB side.
