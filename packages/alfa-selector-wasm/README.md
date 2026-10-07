# @siteimprove/alfa-selector-wasm

WASM bindings around Servo's [`selectors`](https://crates.io/crates/selectors)
crate, intended to eventually replace Alfa's TypeScript selector parsing and
matching in `alfa-cascade`.

**Status: Milestone 3.** The engine is now wired into `alfa-cascade`'s
`SelectorMap`: candidate matching (the `_ids`/`_classes`/`_types`/`_other`
buckets, i.e. everything except `:host`/`::slotted` shadow selectors, which
still go through their own `matchHost`/`matchSlotted` paths) is delegated to
this engine wherever it can parse the selector, falling back to the original
TypeScript `Selector#matches` for anything it can't (currently: any selector
using a Context-dependent pseudo-class — see "Not yet done" below). See
`packages/alfa-cascade/src/selector-map.ts`.

## What works

- `SelectorImpl` / `Element` implementations over an in-memory DOM arena with
  O(1) tree pointers
- Binary DOM serialization bridge (`ts/serialize.ts` -> `src/serialization.rs`)
- A typed TypeScript wrapper (`ts/index.ts`, `SelectorEngine`) that serializes
  an Alfa DOM, loads it, and maps Alfa `Element`s back to WASM ids. The engine
  is a process-wide singleton (the compiled WASM module's DOM arena is
  module-global state), and `loadDom` is idempotent per root so callers can
  freely interleave work across multiple trees (e.g. cascades for different
  documents, or nested shadow trees)
- Parsing selectors, including `:is()`, `:where()`, `:has()` and the `&`
  nesting selector (parsing only)
- Matching type, class, id, attribute, descendant, child, sibling (`+`, `~`),
  `:root`, `:nth-child()`, and `:has()` selectors against a real Alfa DOM
- Reading packed specificity
- Cascade integration in `alfa-cascade`, with fallback to TypeScript matching
  for selectors this engine can't yet handle (Milestone 3)

## Not yet done (later milestones)

- Non tree-structural pseudo-classes (`:hover`, `:focus`, `:focus-within`,
  `:active`, `:visited`, …) — the enums are intentionally empty. Alfa's
  `Context` (the hover/focus/active/visited state cascade matching is
  evaluated against) has no equivalent in the WASM DOM arena yet; adding it
  needs a state-passing bridge across the WASM boundary, not just a parser
  change. Selectors using these fall back to TypeScript matching in
  `alfa-cascade` for now
- Shadow DOM / slot flattening beyond what `Node.flatTree` yields
- `&` nesting resolution against a parent selector (Milestone 4). In
  practice this doesn't yet matter for cascade correctness: Alfa's real-world
  CSSOM ingestion (`packages/alfa-dom/src/native.ts`) doesn't capture nested
  style rules at all, so a raw, unresolved `&` never reaches `alfa-cascade`
  today — only hand-desugared selectors like `:is(.foo) .bar` do (e.g. in
  `test/bridge.spec.tsx`). Capturing real nested rules is separate,
  needed `alfa-dom` work, tracked outside this package

## Known correctness caveat

`Component::Has` relative-selector matching relies on the `selectors` crate's
element-identity comparisons (`OpaqueElement`, e.g. for the implicit `:scope`
anchor). `dom.rs`'s `ElementRef::opaque()` must derive that identity from the
arena index itself, not from `&self` — `ElementRef` is a `Copy` index handle
reconstructed at every traversal step, so taking the address of a particular
copy is not stable across calls for the same logical element.

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
