# @siteimprove/alfa-map

This package provides immutable map implementations for the Alfa project.

## Map Classes

### `Map<K, V>` - For Object Keys

Use `Map` when you need object keys with structural equality.

```typescript
import { Map } from "@siteimprove/alfa-map";
import { Element } from "@siteimprove/alfa-dom";

// Object keys with structural equality
const elements = Map.of(
  [Element.of("div"), info1],
  [Element.of("span"), info2],
);

// Lookup with structurally equal key
elements.get(Element.of("div")); // Found!
```

**Implementation**: Hash Array Mapped Trie (HAMT) with FNV-1a hashing

**Best for**:

- Object keys requiring structural equality
- Large maps
- Keys implementing `Hashable`

### `ValueMap<K, V>` - For Primitive Keys

Use `ValueMap` for primitive keys (`number`, `string`, `boolean`) to get significantly better performance.

```typescript
import { ValueMap } from "@siteimprove/alfa-map";

// Value-based keys
const config = ValueMap.of(
  ["port", 3000],
  ["host", "localhost"],
  ["debug", true],
);

config.get("port"); // Option.of(3000)
```

**Implementation**: Immutable wrapper around native JavaScript `Map`

**Best for**:

- Keys are `number`, `string`, or `boolean`
- Small to medium maps
- Frequent lookups
- Infrequent writes

> **Note**: `ValueMap` maintains immutability by copying all entries on each mutation (`set`, `delete`). This makes it less suitable for use cases requiring frequent modifications, especially with larger maps. For write-heavy workloads with >1000 entries, consider using `Map` instead, which uses structural sharing for more efficient updates.
