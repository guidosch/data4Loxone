#!/bin/bash
#
# Checks the logs of all running docker containers for errors in the last
# 24 hours and sends a notification to ntfy.sh for each container that has
# matching error lines.
#
# Requires: docker, jq
# Must run as root (or via sudo) since container log files are only
# readable by root.
#
# Crontab (run once a day at 07:00), added via `sudo crontab -e`:
#   0 7 * * * /home/pi/data4Loxone/onRasperryPi/check-docker-logs.sh >> /var/log/check-docker-logs.log 2>&1

set -uo pipefail

NTFY_URL="https://ntfy.sh/raspi-notications-f8ba49cf-ff12-4de5-9652"
ERROR_PATTERN='error|exception|fatal|traceback|failed'
SINCE_HOURS=24
MAX_SCAN_LINES=200000  # only look at the most recent lines, so old/huge log files don't make the scan take forever
DOCKER_TIMEOUT=30
CURL_TIMEOUT=10

if ! command -v jq >/dev/null 2>&1; then
    echo "jq is required but not installed (sudo apt install jq)" >&2
    exit 1
fi

cutoff=$(date -u -d "-${SINCE_HOURS} hours" +%Y-%m-%dT%H:%M:%S)

containers=$(timeout "$DOCKER_TIMEOUT" docker ps --format '{{.Names}}')

for container in $containers; do
    echo "Checking $container..."

    log_path=$(timeout "$DOCKER_TIMEOUT" docker inspect --format='{{.LogPath}}' "$container")

    if [ ! -f "$log_path" ]; then
        echo "  no log file found, skipping"
        continue
    fi

    matches=$(tail -n "$MAX_SCAN_LINES" "$log_path" | jq -r --arg cutoff "$cutoff" '
        select(.time >= $cutoff) | .log
    ' 2>/dev/null | grep -iE "$ERROR_PATTERN")

    count=$(printf '%s\n' "$matches" | grep -c .)

    if [ "$count" -gt 0 ]; then
        first_line=$(printf '%s\n' "$matches" | head -n 1 | tr -d '\n' | cut -c1-200)
        echo "  found $count error(s), notifying"
        curl -s --max-time "$CURL_TIMEOUT" -d "[$container] $count error(s) in last ${SINCE_HOURS}h: $first_line" "$NTFY_URL" > /dev/null
    else
        echo "  no errors found"
    fi
done

echo "Done."
