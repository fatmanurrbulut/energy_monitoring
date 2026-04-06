import json
import os
import random
import time
from datetime import datetime
import paho.mqtt.client as mqtt

BROKER_HOST = os.getenv("BROKER_HOST", "mosquitto")
BROKER_PORT = int(os.getenv("BROKER_PORT", "1883"))
DEVICE_ID = os.getenv("DEVICE_ID", "device01")
TOPIC_TELEMETRY = os.getenv("TOPIC_TELEMETRY", f"energy/{DEVICE_ID}/telemetry")
TOPIC_STATUS = os.getenv("TOPIC_STATUS", f"energy/{DEVICE_ID}/status")
MQTT_USERNAME = os.getenv("MQTT_USERNAME")
MQTT_PASSWORD = os.getenv("MQTT_PASSWORD")
PUBLISH_INTERVAL_SEC = float(os.getenv("PUBLISH_INTERVAL_SEC", "2"))
HEARTBEAT_INTERVAL_SEC = float(os.getenv("HEARTBEAT_INTERVAL_SEC", "10"))
ALERT_CURRENT_THRESHOLD = float(os.getenv("ALERT_CURRENT_THRESHOLD", "15"))


def utc_ts():
    return datetime.utcnow().replace(microsecond=0).isoformat() + "Z"


def build_client():
    client = mqtt.Client(client_id=f"simulator-{DEVICE_ID}", clean_session=True)

    if MQTT_USERNAME and MQTT_PASSWORD:
        client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)

    # Broker can mark device offline if connection drops unexpectedly.
    client.will_set(
        TOPIC_STATUS,
        payload=json.dumps(
            {"device_id": DEVICE_ID, "state": "offline", "timestamp": utc_ts()}
        ),
        qos=1,
        retain=True,
    )

    return client


def publish_online_status(client):
    online_payload = {
        "device_id": DEVICE_ID,
        "state": "online",
        "source": "simulator",
        "timestamp": utc_ts(),
    }
    client.publish(TOPIC_STATUS, json.dumps(online_payload), qos=1, retain=True)


def main():
    client = build_client()
    client.connect(BROKER_HOST, BROKER_PORT, 60)
    client.loop_start()
    publish_online_status(client)

    last_heartbeat = time.time()

    try:
        while True:
            voltage = round(random.uniform(210, 230), 2)
            current = round(random.uniform(1.0, 8.0), 2)

            if random.random() < 0.15:
                current = round(random.uniform(15.0, 25.0), 2)

            power_est = round(voltage * current, 2)
            status = "ALERT" if current > ALERT_CURRENT_THRESHOLD else "NORMAL"

            telemetry_payload = {
                "device_id": DEVICE_ID,
                "voltage": voltage,
                "current": current,
                "power_est": power_est,
                "status": status,
                "timestamp": utc_ts(),
            }

            client.publish(TOPIC_TELEMETRY, json.dumps(telemetry_payload), qos=1)
            print("Published telemetry:", telemetry_payload)

            now = time.time()
            if now - last_heartbeat >= HEARTBEAT_INTERVAL_SEC:
                heartbeat_payload = {
                    "device_id": DEVICE_ID,
                    "state": "online",
                    "type": "heartbeat",
                    "timestamp": utc_ts(),
                }
                client.publish(TOPIC_STATUS, json.dumps(heartbeat_payload), qos=1)
                print("Published heartbeat:", heartbeat_payload)
                last_heartbeat = now

            time.sleep(PUBLISH_INTERVAL_SEC)
    except KeyboardInterrupt:
        print("Stopping simulator...")
    finally:
        offline_payload = {
            "device_id": DEVICE_ID,
            "state": "offline",
            "timestamp": utc_ts(),
        }
        client.publish(TOPIC_STATUS, json.dumps(offline_payload), qos=1, retain=True)
        client.loop_stop()
        client.disconnect()


if __name__ == "__main__":
    main()
