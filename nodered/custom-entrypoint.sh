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

if [ -n "${NODE_RED_CREDENTIAL_SECRET:-}" ] && [ -f /data/settings.js ]; then
  ESCAPED_SECRET=$(printf '%s' "${NODE_RED_CREDENTIAL_SECRET}" | sed -e 's/[\/&]/\\&/g')

  if grep -q '^    //credentialSecret:' /data/settings.js; then
    sed -i "s#^    //credentialSecret: .*#    credentialSecret: \"${ESCAPED_SECRET}\",#" /data/settings.js
  elif grep -q '^    credentialSecret:' /data/settings.js; then
    sed -i "s#^    credentialSecret: .*#    credentialSecret: \"${ESCAPED_SECRET}\",#" /data/settings.js
  fi
fi

exec ./entrypoint.sh "$@"
