set -e

yarn workspaces foreach \
  --no-private \
  --topological \
  version --deferred "$@"

yarn version apply --all
