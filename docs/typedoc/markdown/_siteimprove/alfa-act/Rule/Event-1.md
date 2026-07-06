[**Alfa API documentation**](../../../README.md)

***

[Alfa API documentation](../../../README.md) / [@siteimprove/alfa-act](../../alfa-act.md) / [Rule](../Rule.md) / Event

# Class: Event\<INPUT, TARGET, QUESTION, SUBJECT, TYPE, NAME\>

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `INPUT` | - |
| `TARGET` *extends* `Hashable` | - |
| `QUESTION` *extends* [`Metadata`](../Question/Metadata.md) | - |
| `SUBJECT` | - |
| `TYPE` *extends* [`Type`](Event/Type.md) | [`Type`](Event/Type.md) |
| `NAME` *extends* `string` | `string` |

## Implements

- `Serializable`\<[`JSON`](Event/JSON.md)\<`TYPE`, `NAME`\>\>

## Constructors

### Constructor

> **new Event**\<`INPUT`, `TARGET`, `QUESTION`, `SUBJECT`, `TYPE`, `NAME`\>(`type`, `rule`, `name`): `Event`\<`INPUT`, `TARGET`, `QUESTION`, `SUBJECT`, `TYPE`, `NAME`\>

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `type` | `TYPE` |
| `rule` | [`Rule`](../Rule-1.md)\<`INPUT`, `TARGET`, `QUESTION`, `SUBJECT`\> |
| `name` | `NAME` |

#### Returns

`Event`\<`INPUT`, `TARGET`, `QUESTION`, `SUBJECT`, `TYPE`, `NAME`\>

## name

### name

#### Get Signature

> **get** **name**(): `NAME`

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

##### Returns

`NAME`

## of

### of()

> `static` **of**\<`INPUT`, `TARGET`, `QUESTION`, `SUBJECT`, `TYPE`, `NAME`\>(`type`, `rule`, `name`): `Event`\<`INPUT`, `TARGET`, `QUESTION`, `SUBJECT`, `TYPE`, `NAME`\>

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

#### Type Parameters

| Type Parameter |
| ------ |
| `INPUT` |
| `TARGET` *extends* `Hashable` |
| `QUESTION` *extends* [`Metadata`](../Question/Metadata.md) |
| `SUBJECT` |
| `TYPE` *extends* [`Type`](Event/Type.md) |
| `NAME` *extends* `string` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `type` | `TYPE` |
| `rule` | [`Rule`](../Rule-1.md)\<`INPUT`, `TARGET`, `QUESTION`, `SUBJECT`\> |
| `name` | `NAME` |

#### Returns

`Event`\<`INPUT`, `TARGET`, `QUESTION`, `SUBJECT`, `TYPE`, `NAME`\>

## rule

### rule

#### Get Signature

> **get** **rule**(): [`Rule`](../Rule-1.md)\<`INPUT`, `TARGET`, `QUESTION`, `SUBJECT`\>

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

##### Returns

[`Rule`](../Rule-1.md)\<`INPUT`, `TARGET`, `QUESTION`, `SUBJECT`\>

## toJSON

### toJSON()

> **toJSON**(): [`JSON`](Event/JSON.md)\<`TYPE`, `NAME`\>

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

#### Returns

[`JSON`](Event/JSON.md)\<`TYPE`, `NAME`\>

#### Implementation of

`Serializable.toJSON`

## type

### type

#### Get Signature

> **get** **type**(): `TYPE`

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

##### Returns

`TYPE`
