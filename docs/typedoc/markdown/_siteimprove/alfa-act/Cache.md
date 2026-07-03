[**Alfa API documentation**](../../README.md)

***

[Alfa API documentation](../../README.md) / [@siteimprove/alfa-act](../alfa-act.md) / Cache

# Class: Cache

Defined in: [alfa-act/src/cache.ts:24](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/cache.ts#L24)

Cache from rules to outcomes.

## Remarks

This duplicates the cache from `alfa-cache` but adds a type link between
the keys (rules) and values (outcomes). That is, it is guaranteed that if
`rule` is `Rule<I, T, Q, S>`, then `cache.get(rule)` is `Outcome<I, T, Q, S>`
with the same type parameters. Such a link is not possible with the basic cache.

These caches do nothing to remember the actual input that was concerned when
it was built. So care must be taken to ensure that they are not accidentally
shared between inputs, … This is normally enforced by keeping the cache local
to a given `Audit` where the input is fixed.

## Constructors

### Constructor

> `protected` **new Cache**(): `Cache`

Defined in: [alfa-act/src/cache.ts:33](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/cache.ts#L33)

#### Returns

`Cache`

## empty

### empty()

> `static` **empty**(): `Cache`

Defined in: [alfa-act/src/cache.ts:27](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/cache.ts#L27)

#### Returns

`Cache`

## get

### get()

> **get**\<`I`, `T`, `Q`, `S`\>(`rule`, `ifMissing`): `Promise`\<`Iterable`\<[`Outcome`](Outcome-1.md)\<`I`, `T`, `Q`, `S`, [`Value`](Outcome/Value.md)\>, `any`, `any`\>\>

Defined in: [alfa-act/src/cache.ts:35](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/cache.ts#L35)

#### Type Parameters

| Type Parameter |
| ------ |
| `I` |
| `T` *extends* `Hashable` |
| `Q` *extends* [`Metadata`](Question/Metadata.md) |
| `S` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `rule` | [`Rule`](Rule-1.md)\<`I`, `T`, `Q`, `S`\> |
| `ifMissing` | `Thunk`\<`Promise`\<`Iterable`\<[`Outcome`](Outcome-1.md)\<`I`, `T`, `Q`, `S`, [`Value`](Outcome/Value.md)\>, `any`, `any`\>\>\> |

#### Returns

`Promise`\<`Iterable`\<[`Outcome`](Outcome-1.md)\<`I`, `T`, `Q`, `S`, [`Value`](Outcome/Value.md)\>, `any`, `any`\>\>
