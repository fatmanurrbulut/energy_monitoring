#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <username> <password>"
  exit 1
fi

USERNAME="$1"
PASSWORD="$2"
CONFIG_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

docker run --rm \
  -v "${CONFIG_DIR}:/work" \
  eclipse-mosquitto:2 \
  sh -lc "mosquitto_passwd -b -c /work/passwd '${USERNAME}' '${PASSWORD}'"

chmod 644 "${CONFIG_DIR}/passwd"
echo "Generated ${CONFIG_DIR}/passwd for user ${USERNAME}"
