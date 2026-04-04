import json
import random
import time
from datetime import datetime
import paho.mqtt.client as mqtt

BROKER_HOST = "mosquitto"
BROKER_PORT = 1883
TOPIC = "energy/device01/telemetry"

client = mqtt.Client()
client.connect(BROKER_HOST, BROKER_PORT, 60)

while True:
    voltage = round(random.uniform(210, 230), 2)
    current = round(random.uniform(1.0, 8.0), 2)

    if random.random() < 0.15:
        current = round(random.uniform(15.0, 25.0), 2)

    power_est = round(voltage * current, 2)
    status = "ALERT" if current > 15 else "NORMAL"

    payload = {
        "device_id": "device01",
        "voltage": voltage,
        "current": current,
        "power_est": power_est,
        "status": status,
        "timestamp": datetime.utcnow().isoformat()
    }

    client.publish(TOPIC, json.dumps(payload))
    print("Published:", payload)

    time.sleep(2)
