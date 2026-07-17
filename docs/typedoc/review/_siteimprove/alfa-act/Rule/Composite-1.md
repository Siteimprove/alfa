# Class: Composite\<`I`, `T` *extends* `Hashable`, `Q` *extends* [`Metadata`](../Question/Metadata.md) = \{ \}, `S` = `T`\>

## Extends

- [`Rule`](../Rule-1.md)\<`I`, `T`, `Q`, `S`\>

## Constructors

### Constructor

```typescript
protected new Composite<I, T extends Hashable, Q extends Metadata = {
}, S = T>(
   uri: string, 
   requirements: Array<Requirement<string, string>>, 
   tags: Array<Tag<string>>, 
   composes: Array<Rule<I, T, Q, S>>, 
   evaluate: Evaluate<I, T, Q, S>
): Composite<I, T, Q, S>;
```

#### Overrides

[`Rule`](../Rule-1.md).[`constructor`](../Rule-1.md#constructor)

## _evaluate

### \_evaluate

```ts
protected readonly _evaluate: Evaluate<I, T, Q, S>;
```

#### Inherited from

[`Rule`](../Rule-1.md).[`_evaluate`](../Rule-1.md#_evaluate)

## _requirements

### \_requirements

```ts
protected readonly _requirements: Array<Requirement<string, string>>;
```

#### Inherited from

[`Rule`](../Rule-1.md).[`_requirements`](../Rule-1.md#_requirements)

## _tags

### \_tags

```ts
protected readonly _tags: Array<Tag<string>>;
```

#### Inherited from

[`Rule`](../Rule-1.md).[`_tags`](../Rule-1.md#_tags)

## _uri

### \_uri

```ts
protected readonly _uri: string;
```

#### Inherited from

[`Rule`](../Rule-1.md).[`_uri`](../Rule-1.md#_uri)

## composes

### composes

#### Get Signature

```typescript
get composes(): readonly Rule<I, T, Q, S>[];
```

##### Returns

readonly [`Rule`](../Rule-1.md)\<`I`, `T`, `Q`, `S`\>[]

## equals

### equals()

#### Call Signature

```typescript
equals<I, T extends Hashable, Q extends Metadata, S>(value: Rule<I, T, Q, S>): boolean;
```

##### Inherited from

[`Rule`](../Rule-1.md).[`equals`](../Rule-1.md#equals)

#### Call Signature

```typescript
equals(value: unknown): value is Composite<I, T, Q, S>;
```

##### Inherited from

[`Rule`](../Rule-1.md).[`equals`](../Rule-1.md#equals)

## evaluate

### evaluate()

```typescript
evaluate(
   input: I, 
   oracle?: {
} extends Q ? any : Oracle<I, T, Q, S>, 
   outcomes?: Cache, 
   performance?: Performance<Event<I, T, Q, S, Type, string>>
): Promise<Iterable<Outcome<I, T, Q, S, Value>>>;
```

#### Inherited from

[`Rule`](../Rule-1.md).[`evaluate`](../Rule-1.md#evaluate)

## hash

### hash()

```typescript
hash(hash: Hash): void;
```

#### Inherited from

[`Rule`](../Rule-1.md).[`hash`](../Rule-1.md#hash)

## hasRequirement

### hasRequirement()

#### Call Signature

```typescript
hasRequirement(requirement: Requirement): boolean;
```

##### Inherited from

[`Rule`](../Rule-1.md).[`hasRequirement`](../Rule-1.md#hasrequirement)

#### Call Signature

```typescript
hasRequirement(predicate: Predicate<Requirement<string, string>>): boolean;
```

##### Inherited from

[`Rule`](../Rule-1.md).[`hasRequirement`](../Rule-1.md#hasrequirement)

## hasTag

### hasTag()

#### Call Signature

```typescript
hasTag(tag: Tag): boolean;
```

##### Inherited from

[`Rule`](../Rule-1.md).[`hasTag`](../Rule-1.md#hastag)

#### Call Signature

```typescript
hasTag(predicate: Predicate<Tag<string>>): boolean;
```

##### Inherited from

[`Rule`](../Rule-1.md).[`hasTag`](../Rule-1.md#hastag)

## of

### of()

```typescript
static of<I, T extends Hashable, Q extends Metadata = {
}, S = T>(properties: {
  composes: Iterable<Rule<I, T, Q, S>>;
  evaluate: Evaluate<I, T, Q, S>;
  requirements?: Iterable<Requirement<string, string>>;
  tags?: Iterable<Tag<string>>;
  uri: string;
}): Composite<I, T, Q, S>;
```

## requirements

### requirements

#### Get Signature

```typescript
get requirements(): readonly Requirement<string, string>[];
```

##### Returns

readonly [`Requirement`](../Requirement-1.md)\<`string`, `string`\>[]

#### Inherited from

[`Rule`](../Rule-1.md).[`requirements`](../Rule-1.md#requirements)

## tags

### tags

#### Get Signature

```typescript
get tags(): readonly Tag<string>[];
```

##### Returns

readonly [`Tag`](../Tag-1.md)\<`string`\>[]

#### Inherited from

[`Rule`](../Rule-1.md).[`tags`](../Rule-1.md#tags)

## toEARL

### toEARL()

```typescript
toEARL(): EARL;
```

#### Inherited from

[`Rule`](../Rule-1.md).[`toEARL`](../Rule-1.md#toearl)

## toJSON

### toJSON()

#### Call Signature

```typescript
toJSON(options: {
  verbosity: Minimal;
}): MinimalJSON;
```

##### Overrides

[`Rule`](../Rule-1.md).[`toJSON`](../Rule-1.md#tojson)

#### Call Signature

```typescript
toJSON(): JSON;
```

##### Overrides

[`Rule`](../Rule-1.md).[`toJSON`](../Rule-1.md#tojson)

## toSARIF

### toSARIF()

```typescript
toSARIF(): ReportingDescriptor;
```

#### Inherited from

[`Rule`](../Rule-1.md).[`toSARIF`](../Rule-1.md#tosarif)

## uri

### uri

#### Get Signature

```typescript
get uri(): string;
```

##### Returns

`string`

#### Inherited from

[`Rule`](../Rule-1.md).[`uri`](../Rule-1.md#uri)
