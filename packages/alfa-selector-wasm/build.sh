#!/usr/bin/env bash
# Build the WASM module and generate Node.js bindings into pkg/.
#
# Prerequisites:
#   rustup target add wasm32-unknown-unknown
#   cargo install wasm-bindgen-cli --version 0.2.100
set -euo pipefail

cd "$(dirname "$0")"

cargo build --release --target wasm32-unknown-unknown
wasm-bindgen --target nodejs --out-dir pkg \
  target/wasm32-unknown-unknown/release/alfa_selector_wasm.wasm

# The repository root declares "type": "module"; mark the generated CommonJS
# bindings as CommonJS so Node loads them correctly.
printf '{\n  "type": "commonjs"\n}\n' > pkg/package.json

echo "Built pkg/. Run the PoC test with: node test/poc.cjs"
