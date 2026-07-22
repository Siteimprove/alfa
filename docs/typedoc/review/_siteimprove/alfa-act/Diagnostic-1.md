# Class: `Diagnostic`

## Implements

- `Equatable`
- `Hashable`
- `Serializable`\<[`JSON`](Diagnostic/JSON.md)\>

## Constructors

### Constructor

```ts
protected new Diagnostic(message: string): Diagnostic;
```

## _message

### \_message

```ts
protected readonly _message: string;
```

## empty

### empty()

```ts
static empty(): Diagnostic;
```

## equals

### equals()

#### Call Signature

```ts
equals(value: Diagnostic): boolean;
```

##### Implementation of

```ts
Equatable.equals
```

#### Call Signature

```ts
equals(value: unknown): value is Diagnostic;
```

##### Implementation of

```ts
Equatable.equals
```

## hash

### hash()

```ts
hash(hash: Hash): void;
```

#### Implementation of

```ts
Hashable.hash
```

## message

### message

#### Get Signature

```ts
get message(): string;
```

## of

### of()

```ts
static of(message: string): Diagnostic;
```

## toJSON

### toJSON()

```ts
toJSON(options?: Options): JSON;
```

#### Implementation of

```ts
Serializable.toJSON
```
