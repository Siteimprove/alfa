# Interface: JSON\<V\>

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

## Extended by

- [`JSON`](Passed/JSON.md)
- [`JSON`](Failed/JSON.md)
- [`JSON`](CantTell/JSON.md)
- [`JSON`](Inapplicable/JSON.md)

## Type Parameters

### V

`V` *extends* [`Value`](Value.md) = [`Value`](Value.md)

## Indexable

```ts
[key: string]: JSON
```

## mode

### mode

```ts
mode: Mode;
```

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

## outcome

### outcome

```ts
outcome: V;
```

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

## rule

### rule

```ts
rule: JSON | MinimalJSON;
```

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)
