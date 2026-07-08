# Class: Failed\<I, T, Q, S\>

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

## Extends

- [`Outcome`](../Outcome-1.md)\<`I`, `T`, `Q`, `S`, [`Failed`](Value.md#failed)\>

## Type Parameters

### I

`I`

### T

`T` *extends* `Hashable`

### Q

`Q` *extends* [`Metadata`](../Question/Metadata.md) = \{
\}

### S

`S` = `T`

## Constructors

### Constructor

```ts
protected new Failed<I, T, Q, S>(
   rule, 
   target, 
   expectations, 
mode): Failed<I, T, Q, S>;
```

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

#### Parameters

##### rule

[`Rule`](../Rule-1.md)\<`I`, `T`, `Q`, `S`\>

##### target

`T`

##### expectations

`Record`\<\{
\[`key`: `string`\]: `Result`\<[`Diagnostic`](../Diagnostic-1.md), [`Diagnostic`](../Diagnostic-1.md)\>;
\}\>

##### mode

[`Mode`](Mode.md)

#### Returns

`Failed`\<`I`, `T`, `Q`, `S`\>

#### Overrides

[`Outcome`](../Outcome-1.md).[`constructor`](../Outcome-1.md#constructor)

## _mode

### \_mode

```ts
protected readonly _mode: Mode;
```

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

#### Inherited from

[`Outcome`](../Outcome-1.md).[`_mode`](../Outcome-1.md#_mode)

## _rule

### \_rule

```ts
protected readonly _rule: Rule<I, T, Q, S>;
```

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

#### Inherited from

[`Outcome`](../Outcome-1.md).[`_rule`](../Outcome-1.md#_rule)

## equals

### equals()

#### Call Signature

```ts
equals<I, T, Q, S>(value): boolean;
```

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

##### Type Parameters

###### I

`I`

###### T

`T` *extends* `Hashable`

###### Q

`Q` *extends* [`Metadata`](../Question/Metadata.md)

###### S

`S`

##### Parameters

###### value

`Failed`\<`I`, `T`, `Q`, `S`\>

##### Returns

`boolean`

##### Overrides

[`Outcome`](../Outcome-1.md).[`equals`](../Outcome-1.md#equals)

#### Call Signature

```ts
equals(value): value is Failed<I, T, Q, S>;
```

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

##### Parameters

###### value

`unknown`

##### Returns

`value is Failed<I, T, Q, S>`

##### Overrides

[`Outcome`](../Outcome-1.md).[`equals`](../Outcome-1.md#equals)

## expectations

### expectations

#### Get Signature

```ts
get expectations(): Record<{
[key: string]: Result<Diagnostic, Diagnostic>;
}>;
```

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

##### Returns

`Record`\<\{
\[`key`: `string`\]: `Result`\<[`Diagnostic`](../Diagnostic-1.md), [`Diagnostic`](../Diagnostic-1.md)\>;
\}\>

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

#### Overrides

[`Outcome`](../Outcome-1.md).[`hash`](../Outcome-1.md#hash)

## isSemiAuto

### isSemiAuto

#### Get Signature

```ts
get isSemiAuto(): boolean;
```

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

##### Returns

`boolean`

#### Inherited from

[`Outcome`](../Outcome-1.md).[`isSemiAuto`](../Outcome-1.md#issemiauto)

## mode

### mode

#### Get Signature

```ts
get mode(): Mode;
```

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

##### Returns

[`Mode`](Mode.md)

#### Inherited from

[`Outcome`](../Outcome-1.md).[`mode`](../Outcome-1.md#mode)

## of

### of()

```ts
static of<I, T, Q, S>(
   rule, 
   target, 
   expectations, 
mode): Failed<I, T, Q, S>;
```

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

#### Type Parameters

##### I

`I`

##### T

`T` *extends* `Hashable`

##### Q

`Q` *extends* [`Metadata`](../Question/Metadata.md)

##### S

`S`

#### Parameters

##### rule

[`Rule`](../Rule-1.md)\<`I`, `T`, `Q`, `S`\>

##### target

`T`

##### expectations

`Record`\<\{
\[`key`: `string`\]: `Result`\<[`Diagnostic`](../Diagnostic-1.md), [`Diagnostic`](../Diagnostic-1.md)\>;
\}\>

##### mode

[`Mode`](Mode.md)

#### Returns

`Failed`\<`I`, `T`, `Q`, `S`\>

## outcome

### outcome

#### Get Signature

```ts
get outcome(): V;
```

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

##### Returns

`V`

#### Inherited from

[`Outcome`](../Outcome-1.md).[`outcome`](../Outcome-1.md#outcome)

## rule

### rule

#### Get Signature

```ts
get rule(): Rule<I, T, Q, S>;
```

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

##### Returns

[`Rule`](../Rule-1.md)\<`I`, `T`, `Q`, `S`\>

#### Inherited from

[`Outcome`](../Outcome-1.md).[`rule`](../Outcome-1.md#rule)

## target

### target

#### Get Signature

```ts
get target(): T;
```

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

##### Returns

`T`

#### Overrides

[`Outcome`](../Outcome-1.md).[`target`](../Outcome-1.md#target)

## toEARL

### toEARL()

```ts
toEARL(): EARL;
```

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

#### Returns

[`EARL`](Failed/EARL.md)

#### Overrides

[`Outcome`](../Outcome-1.md).[`toEARL`](../Outcome-1.md#toearl)

## toJSON

### toJSON()

```ts
toJSON(options?): JSON<T>;
```

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

#### Parameters

##### options?

`Options`

#### Returns

[`JSON`](Failed/JSON.md)\<`T`\>

#### Overrides

[`Outcome`](../Outcome-1.md).[`toJSON`](../Outcome-1.md#tojson)

## toSARIF

### toSARIF()

```ts
toSARIF(): Result;
```

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

#### Returns

`Result`

#### Overrides

[`Outcome`](../Outcome-1.md).[`toSARIF`](../Outcome-1.md#tosarif)
