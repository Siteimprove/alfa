[**Alfa API documentation**](../../README.md)

***

[Alfa API documentation](../../README.md) / [@siteimprove/alfa-dom](../alfa-dom.md) / Block

# Class: Block

Defined in: [alfa-dom/src/style/block.ts:13](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/block.ts#L13)

## Implements

- `Iterable`\<[`Declaration`](Declaration-1.md)\>
- `Equatable`
- `Serializable`

## Constructors

### Constructor

> `protected` **new Block**(`declarations`): `Block`

Defined in: [alfa-dom/src/style/block.ts:20](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/block.ts#L20)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `declarations` | [`Declaration`](Declaration-1.md)[] |

#### Returns

`Block`

## [iterator]

### \[iterator\]()

> **\[iterator\]**(): `Iterator`\<[`Declaration`](Declaration-1.md)\>

Defined in: [alfa-dom/src/style/block.ts:58](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/block.ts#L58)

#### Returns

`Iterator`\<[`Declaration`](Declaration-1.md)\>

#### Implementation of

`Iterable.[iterator]`

## declaration

### declaration()

> **declaration**(`predicate`): `Option`\<[`Declaration`](Declaration-1.md)\>

Defined in: [alfa-dom/src/style/block.ts:36](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/block.ts#L36)

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

Defined in: [alfa-dom/src/style/block.ts:24](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/block.ts#L24)

##### Returns

`Iterable`\<[`Declaration`](Declaration-1.md)\>

## equals

### equals()

> **equals**(`value`): `value is Block`

Defined in: [alfa-dom/src/style/block.ts:48](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/block.ts#L48)

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

Defined in: [alfa-dom/src/style/block.ts:32](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/block.ts#L32)

#### Returns

`boolean`

## of

### of()

> `static` **of**(`declarations`): `Block`

Defined in: [alfa-dom/src/style/block.ts:14](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/block.ts#L14)

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

Defined in: [alfa-dom/src/style/block.ts:28](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/block.ts#L28)

##### Returns

`number`

## toJSON

### toJSON()

> **toJSON**(): [`JSON`](Block/JSON.md)

Defined in: [alfa-dom/src/style/block.ts:62](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/block.ts#L62)

#### Returns

[`JSON`](Block/JSON.md)

#### Implementation of

`Serializable.toJSON`

## toString

### toString()

> **toString**(): `string`

Defined in: [alfa-dom/src/style/block.ts:66](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/block.ts#L66)

Returns a string representation of an object.

#### Returns

`string`
