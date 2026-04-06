#!/usr/bin/env sh
set -eu

# Always sync tracked dashboard flow into /data at container start.
# This keeps runtime flow deterministic even when named volume has stale data.
if [ -f /data/custom_dashboard/flows.json ]; then
  cp /data/custom_dashboard/flows.json /data/flows.json
fi

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

if [ -n "${NODE_RED_CREDENTIAL_SECRET:-}" ] && [ -f /data/settings.js ]; then
  ESCAPED_SECRET=$(printf '%s' "${NODE_RED_CREDENTIAL_SECRET}" | sed -e 's/[\/&]/\\&/g')

  if grep -q '^    //credentialSecret:' /data/settings.js; then
    sed -i "s#^    //credentialSecret: .*#    credentialSecret: \"${ESCAPED_SECRET}\",#" /data/settings.js
  elif grep -q '^    credentialSecret:' /data/settings.js; then
    sed -i "s#^    credentialSecret: .*#    credentialSecret: \"${ESCAPED_SECRET}\",#" /data/settings.js
  fi
fi

exec ./entrypoint.sh "$@"
