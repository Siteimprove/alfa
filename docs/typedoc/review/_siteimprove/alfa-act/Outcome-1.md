# Abstract Class: Outcome\<I, T, Q, S, V\>

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

## Extended by

- [`Passed`](Outcome/Passed-2.md)
- [`Failed`](Outcome/Failed-2.md)
- [`CantTell`](Outcome/CantTell-2.md)
- [`Inapplicable`](Outcome/Inapplicable-2.md)

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

### V

`V` *extends* [`Value`](Outcome/Value.md) = [`Value`](Outcome/Value.md)

## Implements

- `Equatable`
- `Hashable`
- `Serializable`\<[`JSON`](Outcome/JSON.md)\<`V`\>\>
- `Serializable`\<[`EARL`](Outcome/EARL.md)\>
- `Serializable`\<`sarif.Result`\>

## Constructors

### Constructor

```ts
protected new Outcome<I, T, Q, S, V>(
   outcome, 
   rule, 
mode): Outcome<I, T, Q, S, V>;
```

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

#### Parameters

##### outcome

`V`

##### rule

[`Rule`](Rule-1.md)\<`I`, `T`, `Q`, `S`\>

##### mode

[`Mode`](Outcome/Mode.md)

#### Returns

`Outcome`\<`I`, `T`, `Q`, `S`, `V`\>

## _mode

### \_mode

```ts
protected readonly _mode: Mode;
```

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

## _rule

### \_rule

```ts
protected readonly _rule: Rule<I, T, Q, S>;
```

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

## equals

### equals()

#### Call Signature

```ts
equals<I, T, Q, S, V>(value): boolean;
```

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

##### Type Parameters

###### I

`I`

###### T

`T` *extends* `Hashable`

###### Q

`Q` *extends* [`Metadata`](Question/Metadata.md)

###### S

`S`

###### V

`V` *extends* [`Value`](Outcome/Value.md) = [`Value`](Outcome/Value.md)

##### Parameters

###### value

`Outcome`\<`I`, `T`, `Q`, `S`, `V`\>

##### Returns

`boolean`

##### Implementation of

```ts
Equatable.equals
```

#### Call Signature

```ts
equals(value): value is Outcome<I, T, Q, S, V>;
```

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

##### Parameters

###### value

`unknown`

##### Returns

`value is Outcome<I, T, Q, S, V>`

##### Implementation of

```ts
Equatable.equals
```

## hash

### hash()

```ts
hash(hash): void;
```

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

#### Parameters

##### hash

`Hash`

#### Returns

`void`

#### Implementation of

```ts
Hashable.hash
```

## isSemiAuto

### isSemiAuto

#### Get Signature

```ts
get isSemiAuto(): boolean;
```

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

##### Returns

`boolean`

## mode

### mode

#### Get Signature

```ts
get mode(): Mode;
```

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

##### Returns

[`Mode`](Outcome/Mode.md)

## outcome

### outcome

#### Get Signature

```ts
get outcome(): V;
```

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

##### Returns

`V`

## rule

### rule

#### Get Signature

```ts
get rule(): Rule<I, T, Q, S>;
```

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

##### Returns

[`Rule`](Rule-1.md)\<`I`, `T`, `Q`, `S`\>

## target

### target

#### Get Signature

```ts
get target(): T | undefined;
```

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

##### Returns

`T` \| `undefined`

## toEARL

### toEARL()

```ts
toEARL(): EARL;
```

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

#### Returns

[`EARL`](Outcome/EARL.md)

#### Implementation of

```ts
earl.Serializable.toEARL
```

## toJSON

### toJSON()

```ts
toJSON(options?): JSON<V>;
```

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

#### Parameters

##### options?

`Options`

#### Returns

[`JSON`](Outcome/JSON.md)\<`V`\>

#### Implementation of

```ts
json.Serializable.toJSON
```

## toSARIF

### toSARIF()

```ts
abstract toSARIF(): Result;
```

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

#### Returns

`Result`

#### Implementation of

```ts
sarif.Serializable.toSARIF
```
