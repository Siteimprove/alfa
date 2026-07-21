# Abstract Class: Tag\<`T` *extends* `string` = `string`\>

## Implements

- `Equatable`
- `Serializable`\<[`JSON`](Tag/JSON.md)\>

## Constructors

### Constructor

```typescript
protected new Tag<T extends string = string>(): Tag<T>;
```

## equals

### equals()

#### Call Signature

```typescript
equals(value: Tag): boolean;
```

##### Implementation of

```ts
Equatable.equals
```

#### Call Signature

```typescript
equals(value: unknown): value is Tag<T>;
```

##### Implementation of

```ts
Equatable.equals
```

## toJSON

### toJSON()

```typescript
toJSON(): JSON<T>;
```

#### Implementation of

```ts
Serializable.toJSON
```

## type

### type

#### Get Signature

```typescript
get abstract type(): T;
```

##### Returns

`T`
