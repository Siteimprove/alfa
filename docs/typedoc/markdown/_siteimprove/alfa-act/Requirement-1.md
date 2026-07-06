[**Alfa API documentation**](../../README.md)

***

[Alfa API documentation](../../README.md) / [@siteimprove/alfa-act](../alfa-act.md) / Requirement

# Abstract Class: Requirement\<T, U\>

Defined in: [alfa-act/src/metadata/requirement.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/metadata/requirement.ts)

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` *extends* `string` | `string` |
| `U` *extends* `string` | `string` |

## Implements

- `Equatable`
- `Serializable`\<[`JSON`](Requirement/JSON.md)\>
- `Serializable`\<[`EARL`](Requirement/EARL.md)\>

## Constructors

### Constructor

> `protected` **new Requirement**\<`T`, `U`\>(`type`, `uri`): `Requirement`\<`T`, `U`\>

Defined in: [alfa-act/src/metadata/requirement.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/metadata/requirement.ts)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `type` | `T` |
| `uri` | `U` |

#### Returns

`Requirement`\<`T`, `U`\>

## equals

### equals()

#### Call Signature

> **equals**(`value`): `boolean`

Defined in: [alfa-act/src/metadata/requirement.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/metadata/requirement.ts)

Check if a value of the same type as this are equal.

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `Requirement` |

##### Returns

`boolean`

##### Remarks

This function does not further refine the type of the given value.

##### Implementation of

`Equatable.equals`

#### Call Signature

> **equals**(`value`): `value is Requirement<T, U>`

Defined in: [alfa-act/src/metadata/requirement.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/metadata/requirement.ts)

Check if a value of an unknown type is equal to this.

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `unknown` |

##### Returns

`value is Requirement<T, U>`

##### Remarks

This function refines the type of the given value.

##### Implementation of

`Equatable.equals`

## toEARL

### toEARL()

> **toEARL**(): [`EARL`](Requirement/EARL.md)

Defined in: [alfa-act/src/metadata/requirement.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/metadata/requirement.ts)

#### Returns

[`EARL`](Requirement/EARL.md)

#### Implementation of

`earl.Serializable.toEARL`

## toJSON

### toJSON()

> **toJSON**(): [`JSON`](Requirement/JSON.md)\<`T`, `U`\>

Defined in: [alfa-act/src/metadata/requirement.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/metadata/requirement.ts)

#### Returns

[`JSON`](Requirement/JSON.md)\<`T`, `U`\>

#### Implementation of

`json.Serializable.toJSON`

## type

### type

#### Get Signature

> **get** **type**(): `T`

Defined in: [alfa-act/src/metadata/requirement.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/metadata/requirement.ts)

##### Returns

`T`

## uri

### uri

#### Get Signature

> **get** **uri**(): `U`

Defined in: [alfa-act/src/metadata/requirement.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/metadata/requirement.ts)

##### Returns

`U`
