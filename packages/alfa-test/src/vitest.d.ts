// Workaround due to https://github.com/vitejs/vite/issues/9813
declare interface Worker {}
declare interface WebSocket {}

declare namespace WebAssembly {
  interface Module {}
}
