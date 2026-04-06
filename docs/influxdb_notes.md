# InfluxDB Integration Notes

## Service

- URL: `http://localhost:8086`
- Org: from `.env` -> `INFLUX_ORG`
- Bucket: from `.env` -> `INFLUX_BUCKET`
- Token: from `.env` -> `INFLUX_TOKEN`

## MQTT -> Influx Bridge

- Service name: `storage_bridge`
- Subscription topic: `energy/+/telemetry`
- Measurement: `energy_telemetry`

## Stored Schema

Tags:
- `device_id`
- `status`

Fields:
- `voltage` (float)
- `current` (float)
- `power_est` (float)

Timestamp source:
- `payload.timestamp` (ISO8601) if valid
- fallback: bridge receive time (UTC)
