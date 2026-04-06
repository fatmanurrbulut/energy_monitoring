#!/usr/bin/env sh
set -eu

if [ -n "${MQTT_USERNAME:-}" ] && [ -n "${MQTT_PASSWORD:-}" ]; then
  cat > /data/flows_cred.json <<CRED
{
  "74f60a6b88fcb6f6": {
    "user": "${MQTT_USERNAME}",
    "password": "${MQTT_PASSWORD}"
  }
}
CRED
fi

exec ./entrypoint.sh "$@"
