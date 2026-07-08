# Class: Audit\<I, T, Q, S\>

Defined in: [alfa-act/src/audit.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/audit.ts)

## Type Parameters

### I

`I`

### T

`T` *extends* `Hashable`

### Q

`Q` *extends* [`Metadata`](Question/Metadata.md) = \{
\}

### S

`S` = `T`

## Constructors

### Constructor

```ts
protected new Audit<I, T, Q, S>(
   input, 
   rules, 
oracle): Audit<I, T, Q, S>;
```

Defined in: [alfa-act/src/audit.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/audit.ts)

#### Parameters

##### input

`I`

##### rules

`List`\<[`Rule`](Rule-1.md)\<`I`, `T`, `Q`, `S`\>\>

##### oracle

[`Oracle`](Oracle.md)\<`I`, `T`, `Q`, `S`\>

#### Returns

`Audit`\<`I`, `T`, `Q`, `S`\>

## evaluate

### evaluate()

```ts
evaluate(performance?): Promise<Iterable<Outcome<I, T, Q, S, Value>>>;
```

Defined in: [alfa-act/src/audit.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/audit.ts)

#### Parameters

##### performance?

`Performance`\<[`Event`](Rule/Event-1.md)\<`I`, `T`, `Q`, `S`, [`Type`](Rule/Event/Type.md), `string`\>\>

#### Returns

`Promise`\<`Iterable`\<[`Outcome`](Outcome-1.md)\<`I`, `T`, `Q`, `S`, [`Value`](Outcome/Value.md)\>\>\>

## of

### of()

```ts
static of<I, T, Q, S>(
   input, 
   rules, 
oracle?): Audit<I, T, Q, S>;
```

Defined in: [alfa-act/src/audit.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/audit.ts)

#### Type Parameters

##### I

`I`

##### T

`T` *extends* `Hashable`

##### Q

`Q` *extends* [`Metadata`](Question/Metadata.md) = \{
\}

##### S

`S` = `T`

#### Parameters

##### input

`I`

##### rules

`Iterable`\<[`Rule`](Rule-1.md)\<`I`, `T`, `Q`, `S`\>\>

##### oracle?

[`Oracle`](Oracle.md)\<`I`, `T`, `Q`, `S`\> = `...`

#### Returns

`Audit`\<`I`, `T`, `Q`, `S`\>
