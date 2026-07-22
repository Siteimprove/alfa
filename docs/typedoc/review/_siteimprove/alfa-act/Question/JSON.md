# Interface: JSON\<TYPE, SUBJECT, CONTEXT, ANSWER, URI extends string = string\>

## Indexable

```ts
[key: string]: JSON
```

## context

### context

```ts
context: ToJSON<CONTEXT>;
```

## diagnostic

### diagnostic

```ts
diagnostic: JSON;
```

## fallback

### fallback

```ts
fallback: JSON<ANSWER>;
```

## message

### message

```ts
message: string;
```

## subject

### subject

```ts
subject: ToJSON<SUBJECT>;
```

## type

### type

```ts
type: ToJSON<TYPE>;
```

## uri

### uri

```ts
uri: URI;
```
