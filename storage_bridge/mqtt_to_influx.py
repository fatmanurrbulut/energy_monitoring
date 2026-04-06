import json
import os
import signal
import sys
import time
from datetime import datetime, timezone

import paho.mqtt.client as mqtt
from influxdb_client import InfluxDBClient, Point, WritePrecision

BROKER_HOST = os.getenv("BROKER_HOST", "mosquitto")
BROKER_PORT = int(os.getenv("BROKER_PORT", "1883"))
MQTT_TOPIC = os.getenv("MQTT_TOPIC", "energy/+/telemetry")
MQTT_USERNAME = os.getenv("MQTT_USERNAME")
MQTT_PASSWORD = os.getenv("MQTT_PASSWORD")
MQTT_USE_TLS = os.getenv("MQTT_USE_TLS", "false").lower() == "true"
MQTT_TLS_CA_CERT = os.getenv("MQTT_TLS_CA_CERT")
MQTT_TLS_INSECURE = os.getenv("MQTT_TLS_INSECURE", "false").lower() == "true"

INFLUX_URL = os.getenv("INFLUX_URL", "http://influxdb:8086")
INFLUX_TOKEN = os.getenv("INFLUX_TOKEN", "")
INFLUX_ORG = os.getenv("INFLUX_ORG", "energy-org")
INFLUX_BUCKET = os.getenv("INFLUX_BUCKET", "energy-bucket")
INFLUX_MEASUREMENT = os.getenv("INFLUX_MEASUREMENT", "energy_telemetry")

running = True


def parse_timestamp(ts: str):
    if not ts:
        return None

    normalized = ts.replace("Z", "+00:00")
    try:
        return datetime.fromisoformat(normalized)
    except ValueError:
        return None


def build_point(payload: dict) -> Point:
    device_id = payload.get("device_id", "unknown")
    status = payload.get("status", "UNKNOWN")

    point = (
        Point(INFLUX_MEASUREMENT)
        .tag("device_id", str(device_id))
        .tag("status", str(status))
    )

    for field in ("voltage", "current", "power_est"):
        value = payload.get(field)
        if isinstance(value, (int, float)):
            point = point.field(field, float(value))

    ts = parse_timestamp(payload.get("timestamp", ""))
    if ts is None:
        ts = datetime.now(timezone.utc)

    return point.time(ts, WritePrecision.S)


def main():
    if not INFLUX_TOKEN:
        raise RuntimeError("INFLUX_TOKEN is required")

    influx_client = InfluxDBClient(url=INFLUX_URL, token=INFLUX_TOKEN, org=INFLUX_ORG)
    write_api = influx_client.write_api()

    mqtt_client = mqtt.Client(client_id="mqtt-to-influx-bridge", clean_session=True)
    if MQTT_USERNAME and MQTT_PASSWORD:
        mqtt_client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)
    if MQTT_USE_TLS:
        if MQTT_TLS_CA_CERT:
            mqtt_client.tls_set(ca_certs=MQTT_TLS_CA_CERT)
        else:
            mqtt_client.tls_set()
        mqtt_client.tls_insecure_set(MQTT_TLS_INSECURE)

    def on_connect(client, userdata, flags, rc):
        if rc == 0:
            print(f"Connected to MQTT broker. Subscribing to {MQTT_TOPIC}")
            client.subscribe(MQTT_TOPIC, qos=1)
        else:
            print(f"MQTT connection failed with rc={rc}")

    def on_message(client, userdata, msg):
        try:
            payload = json.loads(msg.payload.decode("utf-8"))
            point = build_point(payload)
            write_api.write(bucket=INFLUX_BUCKET, org=INFLUX_ORG, record=point)
            print(f"Stored telemetry for device={payload.get('device_id', 'unknown')}")
        except Exception as exc:
            print(f"Failed to process message on {msg.topic}: {exc}")

    mqtt_client.on_connect = on_connect
    mqtt_client.on_message = on_message

    while running:
        try:
            mqtt_client.connect(BROKER_HOST, BROKER_PORT, 60)
            mqtt_client.loop_start()
            break
        except Exception as exc:
            print(f"MQTT not ready yet ({exc}). Retrying in 3 seconds...")
            time.sleep(3)

    while running:
        time.sleep(1)

    mqtt_client.loop_stop()
    mqtt_client.disconnect()
    influx_client.close()


def handle_shutdown(signum, frame):
    global running
    running = False


if __name__ == "__main__":
    signal.signal(signal.SIGINT, handle_shutdown)
    signal.signal(signal.SIGTERM, handle_shutdown)
    try:
        main()
    except Exception as exc:
        print(f"Fatal error: {exc}")
        sys.exit(1)
