# Class: Composite\<I, T, Q, S\>

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

## Extends

- [`Rule`](../Rule-1.md)\<`I`, `T`, `Q`, `S`\>

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
protected new Composite<I, T, Q, S>(
   uri, 
   requirements, 
   tags, 
   composes, 
evaluate): Composite<I, T, Q, S>;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

#### Parameters

##### uri

`string`

##### requirements

`Array`\<[`Requirement`](../Requirement-1.md)\<`string`, `string`\>\>

##### tags

`Array`\<[`Tag`](../Tag-1.md)\<`string`\>\>

##### composes

`Array`\<[`Rule`](../Rule-1.md)\<`I`, `T`, `Q`, `S`\>\>

##### evaluate

[`Evaluate`](Composite/Evaluate.md)\<`I`, `T`, `Q`, `S`\>

#### Returns

`Composite`\<`I`, `T`, `Q`, `S`\>

#### Overrides

[`Rule`](../Rule-1.md).[`constructor`](../Rule-1.md#constructor)

## _evaluate

### \_evaluate

```ts
protected readonly _evaluate: Evaluate<I, T, Q, S>;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

#### Inherited from

[`Rule`](../Rule-1.md).[`_evaluate`](../Rule-1.md#_evaluate)

## _requirements

### \_requirements

```ts
protected readonly _requirements: Array<Requirement<string, string>>;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

#### Inherited from

[`Rule`](../Rule-1.md).[`_requirements`](../Rule-1.md#_requirements)

## _tags

### \_tags

```ts
protected readonly _tags: Array<Tag<string>>;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

#### Inherited from

[`Rule`](../Rule-1.md).[`_tags`](../Rule-1.md#_tags)

## _uri

### \_uri

```ts
protected readonly _uri: string;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

#### Inherited from

[`Rule`](../Rule-1.md).[`_uri`](../Rule-1.md#_uri)

## composes

### composes

#### Get Signature

```ts
get composes(): readonly Rule<I, T, Q, S>[];
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

##### Returns

readonly [`Rule`](../Rule-1.md)\<`I`, `T`, `Q`, `S`\>[]

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

`Q` *extends* [`Metadata`](../Question/Metadata.md)

###### S

`S`

##### Parameters

###### value

[`Rule`](../Rule-1.md)\<`I`, `T`, `Q`, `S`\>

##### Returns

`boolean`

##### Inherited from

[`Rule`](../Rule-1.md).[`equals`](../Rule-1.md#equals)

#### Call Signature

```ts
equals(value): value is Composite<I, T, Q, S>;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

##### Parameters

###### value

`unknown`

##### Returns

`value is Composite<I, T, Q, S>`

##### Inherited from

[`Rule`](../Rule-1.md).[`equals`](../Rule-1.md#equals)

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

`object` *extends* `Q` ? `any` : [`Oracle`](../Oracle.md)\<`I`, `T`, `Q`, `S`\> = `...`

##### outcomes?

[`Cache`](../Cache.md) = `...`

##### performance?

`Performance`\<[`Event`](Event-1.md)\<`I`, `T`, `Q`, `S`, [`Type`](Event/Type.md), `string`\>\>

#### Returns

`Promise`\<`Iterable`\<[`Outcome`](../Outcome-1.md)\<`I`, `T`, `Q`, `S`, [`Value`](../Outcome/Value.md)\>\>\>

#### Inherited from

[`Rule`](../Rule-1.md).[`evaluate`](../Rule-1.md#evaluate)

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

#### Inherited from

[`Rule`](../Rule-1.md).[`hash`](../Rule-1.md#hash)

## hasRequirement

### hasRequirement()

#### Call Signature

```ts
hasRequirement(requirement): boolean;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

##### Parameters

###### requirement

[`Requirement`](../Requirement-1.md)

##### Returns

`boolean`

##### Inherited from

[`Rule`](../Rule-1.md).[`hasRequirement`](../Rule-1.md#hasrequirement)

#### Call Signature

```ts
hasRequirement(predicate): boolean;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

##### Parameters

###### predicate

`Predicate`\<[`Requirement`](../Requirement-1.md)\<`string`, `string`\>\>

##### Returns

`boolean`

##### Inherited from

[`Rule`](../Rule-1.md).[`hasRequirement`](../Rule-1.md#hasrequirement)

## hasTag

### hasTag()

#### Call Signature

```ts
hasTag(tag): boolean;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

##### Parameters

###### tag

[`Tag`](../Tag-1.md)

##### Returns

`boolean`

##### Inherited from

[`Rule`](../Rule-1.md).[`hasTag`](../Rule-1.md#hastag)

#### Call Signature

```ts
hasTag(predicate): boolean;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

##### Parameters

###### predicate

`Predicate`\<[`Tag`](../Tag-1.md)\<`string`\>\>

##### Returns

`boolean`

##### Inherited from

[`Rule`](../Rule-1.md).[`hasTag`](../Rule-1.md#hastag)

## of

### of()

```ts
static of<I, T, Q, S>(properties): Composite<I, T, Q, S>;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

#### Type Parameters

##### I

`I`

##### T

`T` *extends* `Hashable`

##### Q

`Q` *extends* [`Metadata`](../Question/Metadata.md) = \{
\}

##### S

`S` = `T`

#### Parameters

##### properties

###### composes

`Iterable`\<[`Rule`](../Rule-1.md)\<`I`, `T`, `Q`, `S`\>\>

###### evaluate

[`Evaluate`](Composite/Evaluate.md)\<`I`, `T`, `Q`, `S`\>

###### requirements?

`Iterable`\<[`Requirement`](../Requirement-1.md)\<`string`, `string`\>\>

###### tags?

`Iterable`\<[`Tag`](../Tag-1.md)\<`string`\>\>

###### uri

`string`

#### Returns

`Composite`\<`I`, `T`, `Q`, `S`\>

## requirements

### requirements

#### Get Signature

```ts
get requirements(): readonly Requirement<string, string>[];
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

##### Returns

readonly [`Requirement`](../Requirement-1.md)\<`string`, `string`\>[]

#### Inherited from

[`Rule`](../Rule-1.md).[`requirements`](../Rule-1.md#requirements)

## tags

### tags

#### Get Signature

```ts
get tags(): readonly Tag<string>[];
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

##### Returns

readonly [`Tag`](../Tag-1.md)\<`string`\>[]

#### Inherited from

[`Rule`](../Rule-1.md).[`tags`](../Rule-1.md#tags)

## toEARL

### toEARL()

```ts
toEARL(): EARL;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

#### Returns

[`EARL`](EARL.md)

#### Inherited from

[`Rule`](../Rule-1.md).[`toEARL`](../Rule-1.md#toearl)

## toJSON

### toJSON()

#### Call Signature

```ts
toJSON(options): MinimalJSON;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

##### Parameters

###### options

###### verbosity

`Minimal`

##### Returns

[`MinimalJSON`](MinimalJSON.md)

##### Overrides

[`Rule`](../Rule-1.md).[`toJSON`](../Rule-1.md#tojson)

#### Call Signature

```ts
toJSON(): JSON;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

##### Returns

[`JSON`](Composite/JSON.md)

##### Overrides

[`Rule`](../Rule-1.md).[`toJSON`](../Rule-1.md#tojson)

## toSARIF

### toSARIF()

```ts
toSARIF(): ReportingDescriptor;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

#### Returns

`ReportingDescriptor`

#### Inherited from

[`Rule`](../Rule-1.md).[`toSARIF`](../Rule-1.md#tosarif)

## uri

### uri

#### Get Signature

```ts
get uri(): string;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

##### Returns

`string`

#### Inherited from

[`Rule`](../Rule-1.md).[`uri`](../Rule-1.md#uri)
