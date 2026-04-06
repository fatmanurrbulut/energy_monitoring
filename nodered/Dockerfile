FROM nodered/node-red:latest

USER root
RUN npm install --unsafe-perm --no-update-notifier --no-fund node-red-dashboard

COPY custom-entrypoint.sh /usr/src/node-red/custom-entrypoint.sh
RUN chmod +x /usr/src/node-red/custom-entrypoint.sh

USER root
ENTRYPOINT ["./custom-entrypoint.sh"]
