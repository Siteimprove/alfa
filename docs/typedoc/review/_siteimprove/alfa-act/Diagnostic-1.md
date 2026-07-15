# Class: Diagnostic

## Implements

- `Equatable`
- `Hashable`
- `Serializable`\<[`JSON`](Diagnostic/JSON.md)\>

## Constructors

### Constructor

```typescript
protected new Diagnostic(message: string): Diagnostic;
```

## _message

### \_message

```ts
protected readonly _message: string;
```

## empty

### empty()

```typescript
static empty(): Diagnostic;
```

## equals

### equals()

#### Call Signature

```typescript
equals(value: Diagnostic): boolean;
```

##### Implementation of

```ts
Equatable.equals
```

#### Call Signature

```typescript
equals(value: unknown): value is Diagnostic;
```

##### Implementation of

```ts
Equatable.equals
```

## hash

### hash()

```typescript
hash(hash: Hash): void;
```

#### Implementation of

```ts
Hashable.hash
```

## message

### message

#### Get Signature

```typescript
get message(): string;
```

##### Returns

`string`

## of

### of()

```typescript
static of(message: string): Diagnostic;
```

## toJSON

### toJSON()

```typescript
toJSON(options?: Options): JSON;
```

#### Implementation of

```ts
Serializable.toJSON
```
