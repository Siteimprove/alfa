# Class: Declaration

Defined in: [alfa-dom/src/style/declaration.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/declaration.ts)

## Implements

- `Equatable`
- `Serializable`

## Constructors

### Constructor

```ts
protected new Declaration(
   name, 
   value, 
   important): Declaration;
```

Defined in: [alfa-dom/src/style/declaration.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/declaration.ts)

#### Parameters

##### name

`string`

##### value

`string`

##### important

`boolean`

#### Returns

`Declaration`

## _attachOwner

### \_attachOwner()

```ts
_attachOwner(owner): boolean;
```

Defined in: [alfa-dom/src/style/declaration.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/declaration.ts)

#### Parameters

##### owner

[`Element`](Element-1.md)

#### Returns

`boolean`

## _attachParent

### \_attachParent()

```ts
_attachParent(parent): boolean;
```

Defined in: [alfa-dom/src/style/declaration.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/declaration.ts)

#### Parameters

##### parent

[`Rule`](Rule-1.md)

#### Returns

`boolean`

## ancestors

### ancestors()

```ts
ancestors(): Iterable<Rule>;
```

Defined in: [alfa-dom/src/style/declaration.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/declaration.ts)

#### Returns

`Iterable`\<[`Rule`](Rule-1.md)\>

## equals

### equals()

```ts
equals(value): value is Declaration;
```

Defined in: [alfa-dom/src/style/declaration.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/declaration.ts)

#### Parameters

##### value

`unknown`

#### Returns

`value is Declaration`

#### Implementation of

```ts
Equatable.equals
```

## important

### important

#### Get Signature

```ts
get important(): boolean;
```

Defined in: [alfa-dom/src/style/declaration.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/declaration.ts)

##### Returns

`boolean`

## name

### name

#### Get Signature

```ts
get name(): string;
```

Defined in: [alfa-dom/src/style/declaration.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/declaration.ts)

##### Returns

`string`

## of

### of()

```ts
static of(
   name, 
   value, 
   important?): Declaration;
```

Defined in: [alfa-dom/src/style/declaration.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/declaration.ts)

#### Parameters

##### name

`string`

##### value

`string`

##### important?

`boolean` = `false`

#### Returns

`Declaration`

## owner

### owner

#### Get Signature

```ts
get owner(): Option<Element<string>>;
```

Defined in: [alfa-dom/src/style/declaration.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/declaration.ts)

##### Returns

`Option`\<[`Element`](Element-1.md)\<`string`\>\>

## parent

### parent

#### Get Signature

```ts
get parent(): Option<Rule>;
```

Defined in: [alfa-dom/src/style/declaration.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/declaration.ts)

##### Returns

`Option`\<[`Rule`](Rule-1.md)\>

## toJSON

### toJSON()

```ts
toJSON(): JSON;
```

Defined in: [alfa-dom/src/style/declaration.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/declaration.ts)

#### Returns

[`JSON`](Declaration/JSON.md)

#### Implementation of

```ts
Serializable.toJSON
```

## toString

### toString()

```ts
toString(): string;
```

Defined in: [alfa-dom/src/style/declaration.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/declaration.ts)

#### Returns

`string`

## value

### value

#### Get Signature

```ts
get value(): string;
```

Defined in: [alfa-dom/src/style/declaration.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/declaration.ts)

##### Returns

`string`
