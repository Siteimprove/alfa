# Interface: JSON\<T\>

## Extends

- [`JSON`](../JSON.md)\<[`CantTell`](../Value.md#canttell)\>

## Type Parameters

| Type Parameter |
| ------ |
| `T` |

## Indexable

```ts
[key: string]: JSON
```

## diagnostic

### diagnostic

```ts
diagnostic: JSON;
```

## mode

### mode

```ts
mode: Mode;
```

#### Inherited from

[`JSON`](../JSON.md).[`mode`](../JSON.md#mode)

## outcome

### outcome

```ts
outcome: CantTell;
```

#### Inherited from

[`JSON`](../JSON.md).[`outcome`](../JSON.md#outcome)

## rule

### rule

```ts
rule: JSON | MinimalJSON;
```

#### Inherited from

[`JSON`](../JSON.md).[`rule`](../JSON.md#rule)

## target

### target

```ts
target: ToJSON<T>;
```
