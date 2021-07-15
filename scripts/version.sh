set -e

yarn workspaces foreach \
  --no-private \
  --topological-dev \
  version --deferred "$@"

yarn version apply --all
