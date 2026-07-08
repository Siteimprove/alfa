# Abstract Class: Tag\<T\>

Defined in: [alfa-act/src/metadata/tag.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/metadata/tag.ts)

## Type Parameters

### T

`T` *extends* `string` = `string`

## Implements

- `Equatable`
- `Serializable`\<[`JSON`](Tag/JSON.md)\>

## Constructors

### Constructor

```ts
protected new Tag<T>(): Tag<T>;
```

Defined in: [alfa-act/src/metadata/tag.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/metadata/tag.ts)

#### Returns

`Tag`\<`T`\>

## equals

### equals()

#### Call Signature

```ts
equals(value): boolean;
```

Defined in: [alfa-act/src/metadata/tag.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/metadata/tag.ts)

##### Parameters

###### value

`Tag`

##### Returns

`boolean`

##### Implementation of

```ts
Equatable.equals
```

#### Call Signature

```ts
equals(value): value is Tag<T>;
```

Defined in: [alfa-act/src/metadata/tag.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/metadata/tag.ts)

##### Parameters

###### value

`unknown`

##### Returns

`value is Tag<T>`

##### Implementation of

```ts
Equatable.equals
```

## toJSON

### toJSON()

```ts
toJSON(): JSON<T>;
```

Defined in: [alfa-act/src/metadata/tag.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/metadata/tag.ts)

#### Returns

[`JSON`](Tag/JSON.md)\<`T`\>

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

Defined in: [alfa-act/src/metadata/tag.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/metadata/tag.ts)

##### Returns

`T`
