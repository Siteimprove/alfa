[**Alfa API documentation**](../../README.md)

***

[Alfa API documentation](../../README.md) / [@siteimprove/alfa-act](../alfa-act.md) / Audit

# Class: Audit\<I, T, Q, S\>

Defined in: [alfa-act/src/audit.ts:25](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/audit.ts)

An Audit is built from an input (usually a page), a set of rules that apply
to this kind of input, and optionally an oracle to answer questions arising
during the audit. Audits need to be explicitly evaluated to produce outcomes.

## Remarks

* I: type of Input for rules
* T: possible types of test targets
* Q: questions' metadata type
* S: possible types of questions' subject.

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `I` | - |
| `T` *extends* `Hashable` | - |
| `Q` *extends* [`Metadata`](Question/Metadata.md) | `object` |
| `S` | `T` |

## Constructors

### Constructor

> `protected` **new Audit**\<`I`, `T`, `Q`, `S`\>(`input`, `rules`, `oracle`): `Audit`\<`I`, `T`, `Q`, `S`\>

Defined in: [alfa-act/src/audit.ts:48](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/audit.ts)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | `I` |
| `rules` | `List`\<[`Rule`](Rule-1.md)\<`I`, `T`, `Q`, `S`\>\> |
| `oracle` | [`Oracle`](Oracle.md)\<`I`, `T`, `Q`, `S`\> |

#### Returns

`Audit`\<`I`, `T`, `Q`, `S`\>

## evaluate

### evaluate()

> **evaluate**(`performance?`): `Promise`\<`Iterable`\<[`Outcome`](Outcome-1.md)\<`I`, `T`, `Q`, `S`, [`Value`](Outcome/Value.md)\>\>\>

Defined in: [alfa-act/src/audit.ts:58](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/audit.ts)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `performance?` | `Performance`\<[`Event`](Rule/Event-1.md)\<`I`, `T`, `Q`, `S`, [`Type`](Rule/Event/Type.md), `string`\>\> |

#### Returns

`Promise`\<`Iterable`\<[`Outcome`](Outcome-1.md)\<`I`, `T`, `Q`, `S`, [`Value`](Outcome/Value.md)\>\>\>

## of

### of()

> `static` **of**\<`I`, `T`, `Q`, `S`\>(`input`, `rules`, `oracle?`): `Audit`\<`I`, `T`, `Q`, `S`\>

Defined in: [alfa-act/src/audit.ts:31](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/audit.ts)

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `I` | - |
| `T` *extends* `Hashable` | - |
| `Q` *extends* [`Metadata`](Question/Metadata.md) | `object` |
| `S` | `T` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | `I` |
| `rules` | `Iterable`\<[`Rule`](Rule-1.md)\<`I`, `T`, `Q`, `S`\>\> |
| `oracle` | [`Oracle`](Oracle.md)\<`I`, `T`, `Q`, `S`\> |

#### Returns

`Audit`\<`I`, `T`, `Q`, `S`\>
