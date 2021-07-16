set -e

yarn workspaces foreach \
  --no-private \
  --topological \
  npm publish
