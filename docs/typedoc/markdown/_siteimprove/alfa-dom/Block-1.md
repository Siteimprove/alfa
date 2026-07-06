[**Alfa API documentation**](../../README.md)

***

[Alfa API documentation](../../README.md) / [@siteimprove/alfa-dom](../alfa-dom.md) / Block

# Class: Block

Defined in: [alfa-dom/src/style/block.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/block.ts)

## Implements

- `Iterable`\<[`Declaration`](Declaration-1.md)\>
- `Equatable`
- `Serializable`

## Constructors

### Constructor

> `protected` **new Block**(`declarations`): `Block`

Defined in: [alfa-dom/src/style/block.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/block.ts)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `declarations` | [`Declaration`](Declaration-1.md)[] |

#### Returns

`Block`

## [iterator]

### \[iterator\]()

> **\[iterator\]**(): `Iterator`\<[`Declaration`](Declaration-1.md)\>

Defined in: [alfa-dom/src/style/block.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/block.ts)

#### Returns

`Iterator`\<[`Declaration`](Declaration-1.md)\>

#### Implementation of

`Iterable.[iterator]`

## declaration

### declaration()

> **declaration**(`predicate`): `Option`\<[`Declaration`](Declaration-1.md)\>

Defined in: [alfa-dom/src/style/block.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/block.ts)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `predicate` | `string` \| `Predicate`\<[`Declaration`](Declaration-1.md)\> |

#### Returns

`Option`\<[`Declaration`](Declaration-1.md)\>

## declarations

### declarations

#### Get Signature

> **get** **declarations**(): `Iterable`\<[`Declaration`](Declaration-1.md)\>

Defined in: [alfa-dom/src/style/block.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/block.ts)

##### Returns

`Iterable`\<[`Declaration`](Declaration-1.md)\>

## equals

### equals()

> **equals**(`value`): `value is Block`

Defined in: [alfa-dom/src/style/block.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/block.ts)

Check if a value of the same type as this are equal.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `unknown` |

#### Returns

`value is Block`

#### Remarks

This function does not further refine the type of the given value.

#### Implementation of

`Equatable.equals`

## isEmpty

### isEmpty()

> **isEmpty**(): `boolean`

Defined in: [alfa-dom/src/style/block.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/block.ts)

#### Returns

`boolean`

## of

### of()

> `static` **of**(`declarations`): `Block`

Defined in: [alfa-dom/src/style/block.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/block.ts)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `declarations` | `Iterable`\<[`Declaration`](Declaration-1.md)\> |

#### Returns

`Block`

## size

### size

#### Get Signature

> **get** **size**(): `number`

Defined in: [alfa-dom/src/style/block.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/block.ts)

##### Returns

`number`

## toJSON

### toJSON()

> **toJSON**(): [`JSON`](Block/JSON.md)

Defined in: [alfa-dom/src/style/block.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/block.ts)

#### Returns

[`JSON`](Block/JSON.md)

#### Implementation of

`Serializable.toJSON`

## toString

### toString()

> **toString**(): `string`

Defined in: [alfa-dom/src/style/block.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/block.ts)

Returns a string representation of an object.

#### Returns

`string`
