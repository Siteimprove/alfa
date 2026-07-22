# Abstract Class: Tag\<T extends string = string\>

## Implements

- `Equatable`
- `Serializable`\<[`JSON`](Tag/JSON.md)\>

## Constructors

### Constructor

```ts
protected new Tag<T extends string = string>(): Tag<T>;
```

## equals

### equals()

#### Call Signature

```ts
equals(value: Tag): boolean;
```

##### Implementation of

```ts
Equatable.equals
```

#### Call Signature

```ts
equals(value: unknown): value is Tag<T>;
```

##### Implementation of

```ts
Equatable.equals
```

## toJSON

### toJSON()

```ts
toJSON(): JSON<T>;
```

#### Implementation of

```ts
Serializable.toJSON
```

## type

### type

#### Get Signature

```ts
get abstract type(): T;
```
