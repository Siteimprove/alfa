[**Alfa API documentation**](../../../README.md)

***

[Alfa API documentation](../../../README.md) / [@siteimprove/alfa-act](../../alfa-act.md) / [Rule](../Rule.md) / Composite

# Class: Composite\<I, T, Q, S\>

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

## Extends

- [`Rule`](../Rule-1.md)\<`I`, `T`, `Q`, `S`\>

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `I` | - |
| `T` *extends* `Hashable` | - |
| `Q` *extends* [`Metadata`](../Question/Metadata.md) | `object` |
| `S` | `T` |

## Constructors

### Constructor

> `protected` **new Composite**\<`I`, `T`, `Q`, `S`\>(`uri`, `requirements`, `tags`, `composes`, `evaluate`): `Composite`\<`I`, `T`, `Q`, `S`\>

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `uri` | `string` |
| `requirements` | `Array`\<[`Requirement`](../Requirement-1.md)\<`string`, `string`\>\> |
| `tags` | `Array`\<[`Tag`](../Tag-1.md)\<`string`\>\> |
| `composes` | `Array`\<[`Rule`](../Rule-1.md)\<`I`, `T`, `Q`, `S`\>\> |
| `evaluate` | [`Evaluate`](Composite/Evaluate.md)\<`I`, `T`, `Q`, `S`\> |

#### Returns

`Composite`\<`I`, `T`, `Q`, `S`\>

#### Overrides

[`Rule`](../Rule-1.md).[`constructor`](../Rule-1.md#constructor)

## _evaluate

### \_evaluate

> `protected` `readonly` **\_evaluate**: [`Evaluate`](Evaluate.md)\<`I`, `T`, `Q`, `S`\>

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

#### Inherited from

[`Rule`](../Rule-1.md).[`_evaluate`](../Rule-1.md#_evaluate)

## _requirements

### \_requirements

> `protected` `readonly` **\_requirements**: `Array`\<[`Requirement`](../Requirement-1.md)\<`string`, `string`\>\>

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

#### Inherited from

[`Rule`](../Rule-1.md).[`_requirements`](../Rule-1.md#_requirements)

## _tags

### \_tags

> `protected` `readonly` **\_tags**: `Array`\<[`Tag`](../Tag-1.md)\<`string`\>\>

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

#### Inherited from

[`Rule`](../Rule-1.md).[`_tags`](../Rule-1.md#_tags)

## _uri

### \_uri

> `protected` `readonly` **\_uri**: `string`

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

#### Inherited from

[`Rule`](../Rule-1.md).[`_uri`](../Rule-1.md#_uri)

## composes

### composes

#### Get Signature

> **get** **composes**(): readonly [`Rule`](../Rule-1.md)\<`I`, `T`, `Q`, `S`\>[]

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

##### Returns

readonly [`Rule`](../Rule-1.md)\<`I`, `T`, `Q`, `S`\>[]

## equals

### equals()

#### Call Signature

> **equals**\<`I`, `T`, `Q`, `S`\>(`value`): `boolean`

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

Check if a value of the same type as this are equal.

##### Type Parameters

| Type Parameter |
| ------ |
| `I` |
| `T` *extends* `Hashable` |
| `Q` *extends* [`Metadata`](../Question/Metadata.md) |
| `S` |

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | [`Rule`](../Rule-1.md)\<`I`, `T`, `Q`, `S`\> |

##### Returns

`boolean`

##### Remarks

This function does not further refine the type of the given value.

##### Inherited from

[`Rule`](../Rule-1.md).[`equals`](../Rule-1.md#equals)

#### Call Signature

> **equals**(`value`): `value is Composite<I, T, Q, S>`

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

Check if a value of an unknown type is equal to this.

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `unknown` |

##### Returns

`value is Composite<I, T, Q, S>`

##### Remarks

This function refines the type of the given value.

##### Inherited from

[`Rule`](../Rule-1.md).[`equals`](../Rule-1.md#equals)

## evaluate

### evaluate()

> **evaluate**(`input`, `oracle?`, `outcomes?`, `performance?`): `Promise`\<`Iterable`\<[`Outcome`](../Outcome-1.md)\<`I`, `T`, `Q`, `S`, [`Value`](../Outcome/Value.md)\>\>\>

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | `I` |
| `oracle` | `object` *extends* `Q` ? `any` : [`Oracle`](../Oracle.md)\<`I`, `T`, `Q`, `S`\> |
| `outcomes` | [`Cache`](../Cache.md) |
| `performance?` | `Performance`\<[`Event`](Event-1.md)\<`I`, `T`, `Q`, `S`, [`Type`](Event/Type.md), `string`\>\> |

#### Returns

`Promise`\<`Iterable`\<[`Outcome`](../Outcome-1.md)\<`I`, `T`, `Q`, `S`, [`Value`](../Outcome/Value.md)\>\>\>

#### Inherited from

[`Rule`](../Rule-1.md).[`evaluate`](../Rule-1.md#evaluate)

## hash

### hash()

> **hash**(`hash`): `void`

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `hash` | `Hash` |

#### Returns

`void`

#### Inherited from

[`Rule`](../Rule-1.md).[`hash`](../Rule-1.md#hash)

## hasRequirement

### hasRequirement()

#### Call Signature

> **hasRequirement**(`requirement`): `boolean`

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `requirement` | [`Requirement`](../Requirement-1.md) |

##### Returns

`boolean`

##### Inherited from

[`Rule`](../Rule-1.md).[`hasRequirement`](../Rule-1.md#hasrequirement)

#### Call Signature

> **hasRequirement**(`predicate`): `boolean`

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `predicate` | `Predicate`\<[`Requirement`](../Requirement-1.md)\<`string`, `string`\>\> |

##### Returns

`boolean`

##### Inherited from

[`Rule`](../Rule-1.md).[`hasRequirement`](../Rule-1.md#hasrequirement)

## hasTag

### hasTag()

#### Call Signature

> **hasTag**(`tag`): `boolean`

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `tag` | [`Tag`](../Tag-1.md) |

##### Returns

`boolean`

##### Inherited from

[`Rule`](../Rule-1.md).[`hasTag`](../Rule-1.md#hastag)

#### Call Signature

> **hasTag**(`predicate`): `boolean`

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `predicate` | `Predicate`\<[`Tag`](../Tag-1.md)\<`string`\>\> |

##### Returns

`boolean`

##### Inherited from

[`Rule`](../Rule-1.md).[`hasTag`](../Rule-1.md#hastag)

## of

### of()

> `static` **of**\<`I`, `T`, `Q`, `S`\>(`properties`): `Composite`\<`I`, `T`, `Q`, `S`\>

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `I` | - |
| `T` *extends* `Hashable` | - |
| `Q` *extends* [`Metadata`](../Question/Metadata.md) | `object` |
| `S` | `T` |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `properties` | \{ `composes`: `Iterable`\<[`Rule`](../Rule-1.md)\<`I`, `T`, `Q`, `S`\>\>; `evaluate`: [`Evaluate`](Composite/Evaluate.md)\<`I`, `T`, `Q`, `S`\>; `requirements?`: `Iterable`\<[`Requirement`](../Requirement-1.md)\<`string`, `string`\>\>; `tags?`: `Iterable`\<[`Tag`](../Tag-1.md)\<`string`\>\>; `uri`: `string`; \} | - |
| `properties.composes` | `Iterable`\<[`Rule`](../Rule-1.md)\<`I`, `T`, `Q`, `S`\>\> |  |
| `properties.evaluate` | [`Evaluate`](Composite/Evaluate.md)\<`I`, `T`, `Q`, `S`\> |  |
| `properties.requirements?` | `Iterable`\<[`Requirement`](../Requirement-1.md)\<`string`, `string`\>\> |  |
| `properties.tags?` | `Iterable`\<[`Tag`](../Tag-1.md)\<`string`\>\> |  |
| `properties.uri` | `string` |  |

#### Returns

`Composite`\<`I`, `T`, `Q`, `S`\>

## requirements

### requirements

#### Get Signature

> **get** **requirements**(): readonly [`Requirement`](../Requirement-1.md)\<`string`, `string`\>[]

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

##### Returns

readonly [`Requirement`](../Requirement-1.md)\<`string`, `string`\>[]

#### Inherited from

[`Rule`](../Rule-1.md).[`requirements`](../Rule-1.md#requirements)

## tags

### tags

#### Get Signature

> **get** **tags**(): readonly [`Tag`](../Tag-1.md)\<`string`\>[]

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

##### Returns

readonly [`Tag`](../Tag-1.md)\<`string`\>[]

#### Inherited from

[`Rule`](../Rule-1.md).[`tags`](../Rule-1.md#tags)

## toEARL

### toEARL()

> **toEARL**(): [`EARL`](EARL.md)

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

#### Returns

[`EARL`](EARL.md)

#### Inherited from

[`Rule`](../Rule-1.md).[`toEARL`](../Rule-1.md#toearl)

## toJSON

### toJSON()

#### Call Signature

> **toJSON**(`options`): [`MinimalJSON`](MinimalJSON.md)

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | \{ `verbosity`: `Minimal`; \} | - |
| `options.verbosity` | `Minimal` |  |

##### Returns

[`MinimalJSON`](MinimalJSON.md)

##### Overrides

[`Rule`](../Rule-1.md).[`toJSON`](../Rule-1.md#tojson)

#### Call Signature

> **toJSON**(): [`JSON`](Composite/JSON.md)

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

##### Returns

[`JSON`](Composite/JSON.md)

##### Overrides

[`Rule`](../Rule-1.md).[`toJSON`](../Rule-1.md#tojson)

## toSARIF

### toSARIF()

> **toSARIF**(): `ReportingDescriptor`

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

#### Returns

`ReportingDescriptor`

#### Inherited from

[`Rule`](../Rule-1.md).[`toSARIF`](../Rule-1.md#tosarif)

## uri

### uri

#### Get Signature

> **get** **uri**(): `string`

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

##### Returns

`string`

#### Inherited from

[`Rule`](../Rule-1.md).[`uri`](../Rule-1.md#uri)
