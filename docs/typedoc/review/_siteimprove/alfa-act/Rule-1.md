# Abstract Class: Rule\<I, T, Q, S\>

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

## Extended by

- [`Atomic`](Rule/Atomic-1.md)
- [`Composite`](Rule/Composite-1.md)

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

## Implements

- `Equatable`
- `Hashable`
- `Serializable`\<[`JSON`](Rule/JSON.md)\>
- `Serializable`\<[`EARL`](Rule/EARL.md)\>
- `Serializable`\<`sarif.ReportingDescriptor`\>

## Constructors

### Constructor

```ts
protected new Rule<I, T, Q, S>(
   uri, 
   requirements, 
   tags, 
evaluator): Rule<I, T, Q, S>;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

#### Parameters

##### uri

`string`

##### requirements

`Array`\<[`Requirement`](Requirement-1.md)\<`string`, `string`\>\>

##### tags

`Array`\<[`Tag`](Tag-1.md)\<`string`\>\>

##### evaluator

[`Evaluate`](Rule/Evaluate.md)\<`I`, `T`, `Q`, `S`\>

#### Returns

`Rule`\<`I`, `T`, `Q`, `S`\>

## _evaluate

### \_evaluate

```ts
protected readonly _evaluate: Evaluate<I, T, Q, S>;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

## _requirements

### \_requirements

```ts
protected readonly _requirements: Array<Requirement<string, string>>;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

## _tags

### \_tags

```ts
protected readonly _tags: Array<Tag<string>>;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

## _uri

### \_uri

```ts
protected readonly _uri: string;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

## equals

### equals()

#### Call Signature

```ts
equals<I, T, Q, S>(value): boolean;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

##### Type Parameters

###### I

`I`

###### T

`T` *extends* `Hashable`

###### Q

`Q` *extends* [`Metadata`](Question/Metadata.md)

###### S

`S`

##### Parameters

###### value

`Rule`\<`I`, `T`, `Q`, `S`\>

##### Returns

`boolean`

##### Implementation of

```ts
Equatable.equals
```

#### Call Signature

```ts
equals(value): value is Rule<I, T, Q, S>;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

##### Parameters

###### value

`unknown`

##### Returns

`value is Rule<I, T, Q, S>`

##### Implementation of

```ts
Equatable.equals
```

## evaluate

### evaluate()

```ts
evaluate(
   input, 
   oracle?, 
   outcomes?, 
performance?): Promise<Iterable<Outcome<I, T, Q, S, Value>>>;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

#### Parameters

##### input

`I`

##### oracle?

`object` *extends* `Q` ? `any` : [`Oracle`](Oracle.md)\<`I`, `T`, `Q`, `S`\> = `...`

##### outcomes?

[`Cache`](Cache.md) = `...`

##### performance?

`Performance`\<[`Event`](Rule/Event-1.md)\<`I`, `T`, `Q`, `S`, [`Type`](Rule/Event/Type.md), `string`\>\>

#### Returns

`Promise`\<`Iterable`\<[`Outcome`](Outcome-1.md)\<`I`, `T`, `Q`, `S`, [`Value`](Outcome/Value.md)\>\>\>

## hash

### hash()

```ts
hash(hash): void;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

#### Parameters

##### hash

`Hash`

#### Returns

`void`

#### Implementation of

```ts
Hashable.hash
```

## hasRequirement

### hasRequirement()

#### Call Signature

```ts
hasRequirement(requirement): boolean;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

##### Parameters

###### requirement

[`Requirement`](Requirement-1.md)

##### Returns

`boolean`

#### Call Signature

```ts
hasRequirement(predicate): boolean;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

##### Parameters

###### predicate

`Predicate`\<[`Requirement`](Requirement-1.md)\<`string`, `string`\>\>

##### Returns

`boolean`

## hasTag

### hasTag()

#### Call Signature

```ts
hasTag(tag): boolean;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

##### Parameters

###### tag

[`Tag`](Tag-1.md)

##### Returns

`boolean`

#### Call Signature

```ts
hasTag(predicate): boolean;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

##### Parameters

###### predicate

`Predicate`\<[`Tag`](Tag-1.md)\<`string`\>\>

##### Returns

`boolean`

## requirements

### requirements

#### Get Signature

```ts
get requirements(): readonly Requirement<string, string>[];
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

##### Returns

readonly [`Requirement`](Requirement-1.md)\<`string`, `string`\>[]

## tags

### tags

#### Get Signature

```ts
get tags(): readonly Tag<string>[];
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

##### Returns

readonly [`Tag`](Tag-1.md)\<`string`\>[]

## toEARL

### toEARL()

```ts
toEARL(): EARL;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

#### Returns

[`EARL`](Rule/EARL.md)

#### Implementation of

```ts
earl.Serializable.toEARL
```

## toJSON

### toJSON()

#### Call Signature

```ts
abstract toJSON(options): MinimalJSON;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

##### Parameters

###### options

###### verbosity

`Minimal`

##### Returns

[`MinimalJSON`](Rule/MinimalJSON.md)

##### Implementation of

```ts
json.Serializable.toJSON
```

#### Call Signature

```ts
abstract toJSON(): JSON;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

##### Returns

[`JSON`](Rule/JSON.md)

##### Implementation of

```ts
json.Serializable.toJSON
```

#### Call Signature

```ts
abstract toJSON(options?): JSON | MinimalJSON;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

##### Parameters

###### options?

`Options`

##### Returns

[`JSON`](Rule/JSON.md) \| [`MinimalJSON`](Rule/MinimalJSON.md)

##### Implementation of

```ts
json.Serializable.toJSON
```

## toSARIF

### toSARIF()

```ts
toSARIF(): ReportingDescriptor;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

#### Returns

`ReportingDescriptor`

#### Implementation of

```ts
sarif.Serializable.toSARIF
```

## uri

### uri

#### Get Signature

```ts
get uri(): string;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

##### Returns

`string`
