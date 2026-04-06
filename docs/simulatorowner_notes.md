MQTT topic: energy/device01/telemetry
MQTT status topic: energy/device01/status

JSON format:
- device_id
- voltage
- current
- power_est
- status
- timestamp

Status payload examples:
- {"device_id":"device01","state":"online","source":"simulator","timestamp":"2026-04-06T12:00:00Z"}
- {"device_id":"device01","state":"online","type":"heartbeat","timestamp":"2026-04-06T12:00:10Z"}
- {"device_id":"device01","state":"offline","timestamp":"2026-04-06T12:00:30Z"}
