# Interface: JSON\<V\>

## Extended by

- [`JSON`](Passed/JSON.md)
- [`JSON`](Failed/JSON.md)
- [`JSON`](CantTell/JSON.md)
- [`JSON`](Inapplicable/JSON.md)

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `V` *extends* [`Value`](Value.md) | [`Value`](Value.md) |

## Indexable

```ts
[key: string]: JSON
```

## mode

### mode

```ts
mode: Mode;
```

## outcome

### outcome

```ts
outcome: V;
```

## rule

### rule

```ts
rule: JSON | MinimalJSON;
```
