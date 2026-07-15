# Class: Block

## Implements

- `Iterable`\<[`Declaration`](Declaration-1.md)\>
- `Equatable`
- `Serializable`

## Constructors

### Constructor

```typescript
protected new Block(declarations: Declaration[]): Block;
```

## [iterator]

### \[iterator\]()

```typescript
iterator: Iterator<Declaration>;
```

#### Implementation of

```ts
Iterable.[iterator]
```

## declaration

### declaration()

```typescript
declaration(predicate: string | Predicate<Declaration>): Option<Declaration>;
```

## declarations

### declarations

#### Get Signature

```typescript
get declarations(): Iterable<Declaration>;
```

##### Returns

`Iterable`\<[`Declaration`](Declaration-1.md)\>

## equals

### equals()

```typescript
equals(value: unknown): value is Block;
```

#### Implementation of

```ts
Equatable.equals
```

## isEmpty

### isEmpty()

```typescript
isEmpty(): boolean;
```

## of

### of()

```typescript
static of(declarations: Iterable<Declaration>): Block;
```

## size

### size

#### Get Signature

```typescript
get size(): number;
```

##### Returns

`number`

## toJSON

### toJSON()

```typescript
toJSON(): JSON;
```

#### Implementation of

```ts
Serializable.toJSON
```

## toString

### toString()

```typescript
toString(): string;
```
