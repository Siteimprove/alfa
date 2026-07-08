# Class: Cache

Defined in: [alfa-act/src/cache.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/cache.ts)

## Constructors

### Constructor

```ts
protected new Cache(): Cache;
```

Defined in: [alfa-act/src/cache.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/cache.ts)

#### Returns

`Cache`

## empty

### empty()

```ts
static empty(): Cache;
```

Defined in: [alfa-act/src/cache.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/cache.ts)

#### Returns

`Cache`

## get

### get()

```ts
get<I, T, Q, S>(rule: Rule<I, T, Q, S>, ifMissing: Thunk<Promise<Iterable<Outcome<I, T, Q, S, Value>, any, any>>>): Promise<Iterable<Outcome<I, T, Q, S, Value>, any, any>>;
```

Defined in: [alfa-act/src/cache.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/cache.ts)

#### Type Parameters

##### I

`I`

##### T

`T` *extends* `Hashable`

##### Q

`Q` *extends* [`Metadata`](Question/Metadata.md)

##### S

`S`

#### Parameters

##### rule

[`Rule`](Rule-1.md)\<`I`, `T`, `Q`, `S`\>

##### ifMissing

`Thunk`\<`Promise`\<`Iterable`\<[`Outcome`](Outcome-1.md)\<`I`, `T`, `Q`, `S`, [`Value`](Outcome/Value.md)\>, `any`, `any`\>\>\>

#### Returns

`Promise`\<`Iterable`\<[`Outcome`](Outcome-1.md)\<`I`, `T`, `Q`, `S`, [`Value`](Outcome/Value.md)\>, `any`, `any`\>\>
