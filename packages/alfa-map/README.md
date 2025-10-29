# @siteimprove/alfa-map

This package provides map implementations for the Alfa project.

## Map Classes

### `Map<K, V>` - Immutable, Strutural Equality

Use `Map` when you need immutability and structural equality semantics for key lookup.

```typescript
import { Map } from "@siteimprove/alfa-map";
import { Element } from "@siteimprove/alfa-dom";

const elements = Map.of(
  [Element.of("div"), info1],
  [Element.of("span"), info2],
);

// Lookup with structurally equal key
elements.get(Element.of("div")); // Found!
```

**Best for**:

- Object keys requiring structural equality
- Keys implementing `Hashable`

### `MutableMap<K, V>` - Mutable, Reference Equality

Use `MutableMap` for performance critical code paths where immutability and structural equality is not required, e.g. for primitive keys (`number`, `string`, `boolean`).

```typescript
import { MutableMap } from "@siteimprove/alfa-map";

const config = MutableMap.of(
  ["port", 3000],
  ["host", "localhost"],
  ["debug", true],
);

config.get("port"); // Option.of(3000)
```

**Implementation**: Wrapper around native JavaScript `Map`

**Best for**:

- Keys are `number`, `string`, or `boolean`
- Frequent lookups
