[**Alfa API documentation**](../../README.md)

***

[Alfa API documentation](../../README.md) / [@siteimprove/alfa-act](../alfa-act.md) / Rule

# Abstract Class: Rule\<I, T, Q, S\>

Defined in: [alfa-act/src/rule.ts:36](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

* I: type of Input for the rule
* T: type of the test targets
* Q: questions' metadata type
* S: possible types of questions' subject.

## Extended by

- [`Atomic`](Rule/Atomic-1.md)
- [`Composite`](Rule/Composite-1.md)

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `I` | - |
| `T` *extends* `Hashable` | - |
| `Q` *extends* [`Metadata`](Question/Metadata.md) | `object` |
| `S` | `T` |

## Implements

- `Equatable`
- `Hashable`
- `Serializable`\<[`JSON`](Rule/JSON.md)\>
- `Serializable`\<[`EARL`](Rule/EARL.md)\>
- `Serializable`\<`sarif.ReportingDescriptor`\>

## Constructors

### Constructor

> `protected` **new Rule**\<`I`, `T`, `Q`, `S`\>(`uri`, `requirements`, `tags`, `evaluator`): `Rule`\<`I`, `T`, `Q`, `S`\>

Defined in: [alfa-act/src/rule.ts:54](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `uri` | `string` |
| `requirements` | `Array`\<[`Requirement`](Requirement-1.md)\<`string`, `string`\>\> |
| `tags` | `Array`\<[`Tag`](Tag-1.md)\<`string`\>\> |
| `evaluator` | [`Evaluate`](Rule/Evaluate.md)\<`I`, `T`, `Q`, `S`\> |

#### Returns

`Rule`\<`I`, `T`, `Q`, `S`\>

## _evaluate

### \_evaluate

> `protected` `readonly` **\_evaluate**: [`Evaluate`](Rule/Evaluate.md)\<`I`, `T`, `Q`, `S`\>

Defined in: [alfa-act/src/rule.ts:52](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

## _requirements

### \_requirements

> `protected` `readonly` **\_requirements**: `Array`\<[`Requirement`](Requirement-1.md)\<`string`, `string`\>\>

Defined in: [alfa-act/src/rule.ts:50](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

## _tags

### \_tags

> `protected` `readonly` **\_tags**: `Array`\<[`Tag`](Tag-1.md)\<`string`\>\>

Defined in: [alfa-act/src/rule.ts:51](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

## _uri

### \_uri

> `protected` `readonly` **\_uri**: `string`

Defined in: [alfa-act/src/rule.ts:49](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

## equals

### equals()

#### Call Signature

> **equals**\<`I`, `T`, `Q`, `S`\>(`value`): `boolean`

Defined in: [alfa-act/src/rule.ts:119](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

Check if a value of the same type as this are equal.

##### Type Parameters

| Type Parameter |
| ------ |
| `I` |
| `T` *extends* `Hashable` |
| `Q` *extends* [`Metadata`](Question/Metadata.md) |
| `S` |

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `Rule`\<`I`, `T`, `Q`, `S`\> |

##### Returns

`boolean`

##### Remarks

This function does not further refine the type of the given value.

##### Implementation of

`Equatable.equals`

#### Call Signature

> **equals**(`value`): `value is Rule<I, T, Q, S>`

Defined in: [alfa-act/src/rule.ts:123](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

Check if a value of an unknown type is equal to this.

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `unknown` |

##### Returns

`value is Rule<I, T, Q, S>`

##### Remarks

This function refines the type of the given value.

##### Implementation of

`Equatable.equals`

## evaluate

### evaluate()

> **evaluate**(`input`, `oracle?`, `outcomes?`, `performance?`): `Promise`\<`Iterable`\<[`Outcome`](Outcome-1.md)\<`I`, `T`, `Q`, `S`, [`Value`](Outcome/Value.md)\>\>\>

Defined in: [alfa-act/src/rule.ts:108](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | `I` |
| `oracle` | `object` *extends* `Q` ? `any` : [`Oracle`](Oracle.md)\<`I`, `T`, `Q`, `S`\> |
| `outcomes` | [`Cache`](Cache.md) |
| `performance?` | `Performance`\<[`Event`](Rule/Event-1.md)\<`I`, `T`, `Q`, `S`, [`Type`](Rule/Event/Type.md), `string`\>\> |

#### Returns

`Promise`\<`Iterable`\<[`Outcome`](Outcome-1.md)\<`I`, `T`, `Q`, `S`, [`Value`](Outcome/Value.md)\>\>\>

## hasRequirement

### hasRequirement()

#### Call Signature

> **hasRequirement**(`requirement`): `boolean`

Defined in: [alfa-act/src/rule.ts:78](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `requirement` | [`Requirement`](Requirement-1.md) |

##### Returns

`boolean`

#### Call Signature

> **hasRequirement**(`predicate`): `boolean`

Defined in: [alfa-act/src/rule.ts:80](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `predicate` | `Predicate`\<[`Requirement`](Requirement-1.md)\<`string`, `string`\>\> |

##### Returns

`boolean`

## hasTag

### hasTag()

#### Call Signature

> **hasTag**(`tag`): `boolean`

Defined in: [alfa-act/src/rule.ts:91](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `tag` | [`Tag`](Tag-1.md) |

##### Returns

`boolean`

#### Call Signature

> **hasTag**(`predicate`): `boolean`

Defined in: [alfa-act/src/rule.ts:93](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `predicate` | `Predicate`\<[`Tag`](Tag-1.md)\<`string`\>\> |

##### Returns

`boolean`

## hash

### hash()

> **hash**(`hash`): `void`

Defined in: [alfa-act/src/rule.ts:129](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `hash` | `Hash` |

#### Returns

`void`

#### Implementation of

`Hashable.hash`

## requirements

### requirements

#### Get Signature

> **get** **requirements**(): readonly [`Requirement`](Requirement-1.md)\<`string`, `string`\>[]

Defined in: [alfa-act/src/rule.ts:70](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

##### Returns

readonly [`Requirement`](Requirement-1.md)\<`string`, `string`\>[]

## tags

### tags

#### Get Signature

> **get** **tags**(): readonly [`Tag`](Tag-1.md)\<`string`\>[]

Defined in: [alfa-act/src/rule.ts:74](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

##### Returns

readonly [`Tag`](Tag-1.md)\<`string`\>[]

## toEARL

### toEARL()

> **toEARL**(): [`EARL`](Rule/EARL.md)

Defined in: [alfa-act/src/rule.ts:143](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

#### Returns

[`EARL`](Rule/EARL.md)

#### Implementation of

`earl.Serializable.toEARL`

## toJSON

### toJSON()

#### Call Signature

> `abstract` **toJSON**(`options`): [`MinimalJSON`](Rule/MinimalJSON.md)

Defined in: [alfa-act/src/rule.ts:133](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | \{ `verbosity`: `Minimal`; \} | - |
| `options.verbosity` | `Minimal` |  |

##### Returns

[`MinimalJSON`](Rule/MinimalJSON.md)

##### Implementation of

`json.Serializable.toJSON`

#### Call Signature

> `abstract` **toJSON**(): [`JSON`](Rule/JSON.md)

Defined in: [alfa-act/src/rule.ts:137](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

##### Returns

[`JSON`](Rule/JSON.md)

##### Implementation of

`json.Serializable.toJSON`

#### Call Signature

> `abstract` **toJSON**(`options?`): [`JSON`](Rule/JSON.md) \| [`MinimalJSON`](Rule/MinimalJSON.md)

Defined in: [alfa-act/src/rule.ts:139](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `options?` | `Options` |

##### Returns

[`JSON`](Rule/JSON.md) \| [`MinimalJSON`](Rule/MinimalJSON.md)

##### Implementation of

`json.Serializable.toJSON`

## toSARIF

### toSARIF()

> **toSARIF**(): `ReportingDescriptor`

Defined in: [alfa-act/src/rule.ts:157](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

#### Returns

`ReportingDescriptor`

#### Implementation of

`sarif.Serializable.toSARIF`

## uri

### uri

#### Get Signature

> **get** **uri**(): `string`

Defined in: [alfa-act/src/rule.ts:66](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

##### Returns

`string`
