# Class: Block

Defined in: [alfa-dom/src/style/block.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/block.ts)

## Implements

- `Iterable`\<[`Declaration`](Declaration-1.md)\>
- `Equatable`
- `Serializable`

## Constructors

### Constructor

```ts
protected new Block(declarations: Declaration[]): Block;
```

Defined in: [alfa-dom/src/style/block.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/block.ts)

#### Parameters

##### declarations

[`Declaration`](Declaration-1.md)[]

#### Returns

`Block`

## [iterator]

### \[iterator\]()

```ts
iterator: Iterator<Declaration>;
```

Defined in: [alfa-dom/src/style/block.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/block.ts)

#### Returns

`Iterator`\<[`Declaration`](Declaration-1.md)\>

#### Implementation of

```ts
Iterable.[iterator]
```

## declaration

### declaration()

```ts
declaration(predicate: string | Predicate<Declaration>): Option<Declaration>;
```

Defined in: [alfa-dom/src/style/block.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/block.ts)

#### Parameters

##### predicate

`string` \| `Predicate`\<[`Declaration`](Declaration-1.md)\>

#### Returns

`Option`\<[`Declaration`](Declaration-1.md)\>

## declarations

### declarations

#### Get Signature

```ts
get declarations(): Iterable<Declaration>;
```

Defined in: [alfa-dom/src/style/block.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/block.ts)

##### Returns

`Iterable`\<[`Declaration`](Declaration-1.md)\>

## equals

### equals()

```ts
equals(value: unknown): value is Block;
```

Defined in: [alfa-dom/src/style/block.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/block.ts)

#### Parameters

##### value

`unknown`

#### Returns

`value is Block`

#### Implementation of

```ts
Equatable.equals
```

## isEmpty

### isEmpty()

```ts
isEmpty(): boolean;
```

Defined in: [alfa-dom/src/style/block.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/block.ts)

#### Returns

`boolean`

## of

### of()

```ts
static of(declarations: Iterable<Declaration>): Block;
```

Defined in: [alfa-dom/src/style/block.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/block.ts)

#### Parameters

##### declarations

`Iterable`\<[`Declaration`](Declaration-1.md)\>

#### Returns

`Block`

## size

### size

#### Get Signature

```ts
get size(): number;
```

Defined in: [alfa-dom/src/style/block.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/block.ts)

##### Returns

`number`

## toJSON

### toJSON()

```ts
toJSON(): JSON;
```

Defined in: [alfa-dom/src/style/block.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/block.ts)

#### Returns

[`JSON`](Block/JSON.md)

#### Implementation of

```ts
Serializable.toJSON
```

## toString

### toString()

```ts
toString(): string;
```

Defined in: [alfa-dom/src/style/block.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/block.ts)

#### Returns

`string`
