# Abstract Class: Requirement\<T, U\>

Defined in: [alfa-act/src/metadata/requirement.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/metadata/requirement.ts)

## Type Parameters

### T

`T` *extends* `string` = `string`

### U

`U` *extends* `string` = `string`

## Implements

- `Equatable`
- `Serializable`\<[`JSON`](Requirement/JSON.md)\>
- `Serializable`\<[`EARL`](Requirement/EARL.md)\>

## Constructors

### Constructor

```ts
protected new Requirement<T, U>(type: T, uri: U): Requirement<T, U>;
```

Defined in: [alfa-act/src/metadata/requirement.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/metadata/requirement.ts)

#### Parameters

##### type

`T`

##### uri

`U`

#### Returns

`Requirement`\<`T`, `U`\>

## equals

### equals()

#### Call Signature

```ts
equals(value: Requirement): boolean;
```

Defined in: [alfa-act/src/metadata/requirement.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/metadata/requirement.ts)

##### Parameters

###### value

`Requirement`

##### Returns

`boolean`

##### Implementation of

```ts
Equatable.equals
```

#### Call Signature

```ts
equals(value: unknown): value is Requirement<T, U>;
```

Defined in: [alfa-act/src/metadata/requirement.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/metadata/requirement.ts)

##### Parameters

###### value

`unknown`

##### Returns

`value is Requirement<T, U>`

##### Implementation of

```ts
Equatable.equals
```

## toEARL

### toEARL()

```ts
toEARL(): EARL;
```

Defined in: [alfa-act/src/metadata/requirement.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/metadata/requirement.ts)

#### Returns

[`EARL`](Requirement/EARL.md)

#### Implementation of

```ts
earl.Serializable.toEARL
```

## toJSON

### toJSON()

```ts
toJSON(): JSON<T, U>;
```

Defined in: [alfa-act/src/metadata/requirement.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/metadata/requirement.ts)

#### Returns

[`JSON`](Requirement/JSON.md)\<`T`, `U`\>

#### Implementation of

```ts
json.Serializable.toJSON
```

## type

### type

#### Get Signature

```ts
get type(): T;
```

Defined in: [alfa-act/src/metadata/requirement.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/metadata/requirement.ts)

##### Returns

`T`

## uri

### uri

#### Get Signature

```ts
get uri(): U;
```

Defined in: [alfa-act/src/metadata/requirement.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/metadata/requirement.ts)

##### Returns

`U`
