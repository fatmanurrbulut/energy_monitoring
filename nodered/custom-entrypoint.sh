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

if [ -n "${NODERED_ADMIN_USERNAME:-}" ] && [ -n "${NODERED_ADMIN_PASSWORD:-}" ] && [ -f /data/settings.js ]; then
  ADMIN_HASH=$(node -e "console.log(require('bcryptjs').hashSync(process.env.NODERED_ADMIN_PASSWORD, 8))")

  awk -v user="${NODERED_ADMIN_USERNAME}" -v pass="${ADMIN_HASH}" '
    BEGIN { replaced=0; skip=0 }
    /^    \/\/adminAuth: \{/ && replaced==0 {
      print "    adminAuth: {"
      print "        type: \"credentials\","
      print "        users: [{"
      print "            username: \"" user "\","
      print "            password: \"" pass "\","
      print "            permissions: \"*\""
      print "        }]"
      print "    },"
      replaced=1
      skip=1
      next
    }
    /^    adminAuth: \{/ && replaced==0 {
      print "    adminAuth: {"
      print "        type: \"credentials\","
      print "        users: [{"
      print "            username: \"" user "\","
      print "            password: \"" pass "\","
      print "            permissions: \"*\""
      print "        }]"
      print "    },"
      replaced=1
      skip=2
      next
    }
    skip==1 {
      if ($0 ~ /^    \/\/},/) { skip=0 }
      next
    }
    skip==2 {
      if ($0 ~ /^    },/) { skip=0 }
      next
    }
    { print }
  ' /data/settings.js > /data/settings.js.tmp && mv /data/settings.js.tmp /data/settings.js
fi

exec ./entrypoint.sh "$@"
