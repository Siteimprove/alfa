# @siteimprove/alfa-selector-wasm

WASM bindings around Servo's [`selectors`](https://crates.io/crates/selectors)
crate, intended to eventually replace Alfa's TypeScript selector parsing and
matching in `alfa-cascade`.

**Status: Milestone 2.** The engine now ingests a real Alfa DOM: a TypeScript
serializer walks the flat tree into a compact binary buffer, the Rust side
decodes it, and selectors match against actual Alfa `Element`s. Cascade
integration is still a later milestone.

## What works

- `SelectorImpl` / `Element` implementations over an in-memory DOM arena with
  O(1) tree pointers
- Binary DOM serialization bridge (`ts/serialize.ts` -> `src/serialization.rs`)
- A typed TypeScript wrapper (`ts/index.ts`, `SelectorEngine`) that serializes
  an Alfa DOM, loads it, and maps Alfa `Element`s back to WASM ids
- Parsing selectors, including `:is()`, `:where()`, `:has()` and the `&`
  nesting selector (parsing only)
- Matching type, class, id, attribute, descendant, child, sibling (`+`, `~`),
  `:root`, and `:nth-child()` selectors against a real Alfa DOM
- Reading packed specificity

## Not yet done (later milestones)

- `:has()` **matching** (parsing works; relative-selector matching needs a
  properly configured matching context)
- Non tree-structural pseudo-classes (`:hover`, `:focus`, …) — the enums are
  intentionally empty
- Shadow DOM / slot flattening beyond what `Node.flatTree` yields
- Integration into `alfa-cascade` (Milestone 3)
- `&` nesting resolution against a parent selector (Milestone 4)

## Build & test

```sh
rustup target add wasm32-unknown-unknown
cargo install wasm-bindgen-cli --version 0.2.100

./build.sh                # build the WASM module + bindings into pkg/
node test/poc.cjs         # low-level smoke test (no Alfa dependency)

# Alfa-integrated tests (from the repo root, after `yarn install && yarn build`):
ALFA_PATH=packages/alfa-selector-wasm yarn vitest run --config ./config/vitest.config.ts
```

## Layout

| File                   | Purpose                                              |
| ---------------------- | ---------------------------------------------------- |
| `src/selector_impl.rs` | `SelectorImpl`, the `Atom` name type, pseudo enums   |
| `src/dom.rs`           | In-memory DOM arena + `selectors::Element` impl      |
| `src/serialization.rs` | Binary DOM decoder                                   |
| `src/lib.rs`           | `wasm-bindgen` entry points + parser config          |
| `ts/serialize.ts`      | Alfa DOM (flat tree) -> binary serializer            |
| `ts/index.ts`          | `SelectorEngine` TypeScript wrapper                  |
| `test/poc.cjs`         | Low-level binary-format smoke test                   |
| `test/bridge.spec.tsx` | Alfa-integrated vitest tests                         |
