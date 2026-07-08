# Interface: JSON\<TYPE, SUBJECT, CONTEXT, ANSWER, URI\>

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

## Type Parameters

### TYPE

`TYPE`

### SUBJECT

`SUBJECT`

### CONTEXT

`CONTEXT`

### ANSWER

`ANSWER`

### URI

`URI` *extends* `string` = `string`

## Indexable

```ts
[key: string]: JSON
```

## context

### context

```ts
context: ToJSON<CONTEXT>;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

## diagnostic

### diagnostic

```ts
diagnostic: JSON;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

## fallback

### fallback

```ts
fallback: JSON<ANSWER>;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

## message

### message

```ts
message: string;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

## subject

### subject

```ts
subject: ToJSON<SUBJECT>;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

## type

### type

```ts
type: ToJSON<TYPE>;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)

## uri

### uri

```ts
uri: URI;
```

Defined in: [alfa-act/src/expectation/question.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/question.ts)
