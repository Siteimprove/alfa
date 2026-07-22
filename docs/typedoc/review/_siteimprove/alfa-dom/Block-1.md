# Class: `Block`

## Implements

- `Iterable`\<[`Declaration`](Declaration-1.md)\>
- `Equatable`
- `Serializable`

## Constructors

### Constructor

```ts
protected new Block(declarations: Declaration[]): Block;
```

## [iterator]

### \[iterator\]()

```ts
iterator: Iterator<Declaration>;
```

#### Implementation of

```ts
Iterable.[iterator]
```

## declaration

### declaration()

```ts
declaration(predicate: string | Predicate<Declaration>): Option<Declaration>;
```

## declarations

### declarations

#### Get Signature

```ts
get declarations(): Iterable<Declaration>;
```

## equals

### equals()

```ts
equals(value: unknown): value is Block;
```

#### Implementation of

```ts
Equatable.equals
```

## isEmpty

### isEmpty()

```ts
isEmpty(): boolean;
```

## of

### of()

```ts
static of(declarations: Iterable<Declaration>): Block;
```

## size

### size

#### Get Signature

```ts
get size(): number;
```

## toJSON

### toJSON()

```ts
toJSON(): JSON;
```

#### Implementation of

```ts
Serializable.toJSON
```

## toString

### toString()

```ts
toString(): string;
```
