# Function: isEvent()

```ts
function isEvent<INPUT, TARGET, QUESTION, SUBJECT, TYPE, NAME>(value: unknown): value is Event<INPUT, TARGET, QUESTION, SUBJECT, TYPE, NAME>;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

## Type Parameters

### INPUT

`INPUT`

### TARGET

`TARGET` *extends* `Hashable`

### QUESTION

`QUESTION` *extends* [`Metadata`](../../Question/Metadata.md)

### SUBJECT

`SUBJECT`

### TYPE

`TYPE` *extends* [`Type`](Type.md) = [`Type`](Type.md)

### NAME

`NAME` *extends* `string` = `string`

## Parameters

### value

`unknown`

## Returns

`value is Event<INPUT, TARGET, QUESTION, SUBJECT, TYPE, NAME>`
