#!/usr/bin/env bash
set -euo pipefail

CERT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$CERT_DIR"

openssl genrsa -out ca.key 4096
openssl req -x509 -new -nodes -key ca.key -sha256 -days 3650 \
  -subj "/C=TR/ST=Istanbul/L=Istanbul/O=EnergyMonitoring/CN=energy-ca" \
  -out ca.crt

openssl genrsa -out server.key 2048
openssl req -new -key server.key -out server.csr -config openssl.cnf
openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial \
  -out server.crt -days 825 -sha256 -extensions v3_req -extfile openssl.cnf

chmod 600 ca.key server.key
chmod 644 ca.crt server.crt
rm -f server.csr ca.srl

echo "TLS certificates generated in $CERT_DIR"
