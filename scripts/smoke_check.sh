#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

set -a
source .env
set +a

echo "[1/6] Servis durumlari kontrol ediliyor..."
docker compose ps

echo "[2/6] Frontend health endpoint..."
docker exec frontend sh -lc "wget -qO- 'http://127.0.0.1:80/health'" | grep -q '^ok$'

echo "[3/6] Alarm API health endpoint..."
docker exec alarm_api python -c "import urllib.request; print(urllib.request.urlopen('http://127.0.0.1:8000/health', timeout=5).status)" | grep -q '^200$'

echo "[4/6] Node-RED auth kontrolu (/settings => 401)..."
STATUS_CODE="$(docker exec frontend sh -lc "curl -s -o /dev/null -w '%{http_code}' 'http://nodered:1880/settings'")"
if [ "$STATUS_CODE" != "401" ]; then
  echo "Node-RED auth check failed: expected 401, got $STATUS_CODE"
  exit 1
fi

echo "[5/6] Alarm API veri endpointi..."
docker exec frontend sh -lc "wget -qO- 'http://127.0.0.1:80/api/alarms?hours=1&limit=3'" | grep -q '"alarms"'

echo "[6/6] Influx son yazimlar kontrolu..."
FLUX_QUERY="from(bucket:\"${INFLUX_BUCKET}\") |> range(start: -5m) |> filter(fn: (r) => r._measurement == \"energy_telemetry\") |> limit(n: 1)"
docker exec influxdb influx query "$FLUX_QUERY" --org "${INFLUX_ORG}" --token "${INFLUX_TOKEN}" >/tmp/influx_smoke.txt

grep -q '_measurement' /tmp/influx_smoke.txt

rm -f /tmp/influx_smoke.txt

echo "SMOKE CHECK: PASSED"
