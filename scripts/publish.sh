set -e

yarn workspaces foreach \
  --no-private \
  --topological-dev \
  npm publish
