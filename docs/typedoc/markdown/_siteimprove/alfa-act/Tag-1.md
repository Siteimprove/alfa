[**Alfa API documentation**](../../README.md)

***

[Alfa API documentation](../../README.md) / [@siteimprove/alfa-act](../alfa-act.md) / Tag

# Abstract Class: Tag\<T\>

Defined in: [alfa-act/src/metadata/tag.ts:9](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/metadata/tag.ts#L9)

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` *extends* `string` | `string` |

## Implements

- `Equatable`
- `Serializable`\<[`JSON`](Tag/JSON.md)\>

## Constructors

### Constructor

> `protected` **new Tag**\<`T`\>(): `Tag`\<`T`\>

Defined in: [alfa-act/src/metadata/tag.ts:12](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/metadata/tag.ts#L12)

#### Returns

`Tag`\<`T`\>

## equals

### equals()

#### Call Signature

> **equals**(`value`): `boolean`

Defined in: [alfa-act/src/metadata/tag.ts:16](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/metadata/tag.ts#L16)

Check if a value of the same type as this are equal.

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `Tag` |

##### Returns

`boolean`

##### Remarks

This function does not further refine the type of the given value.

##### Implementation of

`Equatable.equals`

#### Call Signature

> **equals**(`value`): `value is Tag<T>`

Defined in: [alfa-act/src/metadata/tag.ts:18](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/metadata/tag.ts#L18)

Check if a value of an unknown type is equal to this.

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `unknown` |

##### Returns

`value is Tag<T>`

##### Remarks

This function refines the type of the given value.

##### Implementation of

`Equatable.equals`

## toJSON

### toJSON()

> **toJSON**(): [`JSON`](Tag/JSON.md)\<`T`\>

Defined in: [alfa-act/src/metadata/tag.ts:24](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/metadata/tag.ts#L24)

#### Returns

[`JSON`](Tag/JSON.md)\<`T`\>

#### Implementation of

`Serializable.toJSON`

## type

### type

#### Get Signature

> **get** `abstract` **type**(): `T`

Defined in: [alfa-act/src/metadata/tag.ts:14](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/metadata/tag.ts#L14)

##### Returns

`T`
