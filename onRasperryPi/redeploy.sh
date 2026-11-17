#!/bin/bash
#
# Rebuilds the data4loxone image and recreates the container after a code change.
# Implements the "Build and Deployment after code change" steps from the README.
#
# Run on the Raspberry Pi (ARM64 image), from anywhere:
#   sudo ./onRasperryPi/redeploy.sh            # git pull, build, recreate, start
#   sudo ./onRasperryPi/redeploy.sh --no-pull  # skip the git pull
#
# Tokens live in the docker volume "tokenStorage" and survive the redeploy.
# If they need to be replaced, copy them to the volume mount point
# (sudo docker volume inspect tokenStorage) before running this script.

set -euo pipefail

IMAGE="guidosch/node-app-data4loxone"
CONTAINER="data4loxone"
SERVICE="docker-data4loxone.service"
VOLUME="tokenStorage"
HOST_PORT=8081
APP_PORT=8000

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_DIR"

if [ "$(id -u)" -ne 0 ]; then
    echo "Please run as root (sudo $0)" >&2
    exit 1
fi

if [ ! -f .env ]; then
    echo ".env not found in $REPO_DIR (copy .env.sample to .env)" >&2
    exit 1
fi

# 1. Update git repo
if [ "${1:-}" != "--no-pull" ]; then
    echo "==> Updating git repo"
    # run as the repo owner so we don't create root-owned files in .git
    sudo -u "$(stat -c '%U' .git)" git pull --ff-only
fi

# Remember the current image so it can be removed after the new one is built
old_image_id=$(docker images -q "$IMAGE" || true)

# 6. Build the new image first, so the old container keeps running if the build fails
echo "==> Building image $IMAGE"
docker build . -t "$IMAGE"
new_image_id=$(docker images -q "$IMAGE")

# 3. Stop service
echo "==> Stopping $SERVICE"
systemctl stop "$SERVICE" || true

# 4. Stop and delete old container
if docker container inspect "$CONTAINER" >/dev/null 2>&1; then
    echo "==> Removing old container $CONTAINER"
    docker stop "$CONTAINER" >/dev/null || true
    docker rm "$CONTAINER" >/dev/null
fi

# 5. Delete old image (now untagged, since the new build took over the tag)
if [ -n "$old_image_id" ] && [ "$old_image_id" != "$new_image_id" ]; then
    echo "==> Removing old image $old_image_id"
    docker rmi "$old_image_id" || echo "   could not remove old image (still in use?), skipping"
fi

# 7. Create new container
echo "==> Creating container $CONTAINER"
docker create --name="$CONTAINER" \
    -p "$HOST_PORT:$APP_PORT" \
    --env-file .env \
    -v "$VOLUME:/usr/app/dist/tokenStorage" \
    "$IMAGE"

# 9. Start container via systemd service
echo "==> Starting $SERVICE"
systemctl start "$SERVICE"

# 8. Quick check
sleep 5
if docker ps --filter "name=^${CONTAINER}$" --filter status=running -q | grep -q .; then
    echo "==> $CONTAINER is running"
    docker logs --tail 20 "$CONTAINER"
else
    echo "==> $CONTAINER is NOT running, check: journalctl -u $SERVICE / docker logs $CONTAINER" >&2
    exit 1
fi
