# Abstract Class: Rule\<I, T extends Hashable, Q extends Metadata = { }, S = T\>

## Extended by

- [`Atomic`](Rule/Atomic-1.md)
- [`Composite`](Rule/Composite-1.md)

## Implements

- `Equatable`
- `Hashable`
- `Serializable`\<[`JSON`](Rule/JSON.md)\>
- `Serializable`\<[`EARL`](Rule/EARL.md)\>
- `Serializable`\<`sarif.ReportingDescriptor`\>

## Constructors

### Constructor

```ts
protected new Rule<I, T extends Hashable, Q extends Metadata = {
}, S = T>(
   uri: string, 
   requirements: Array<Requirement<string, string>>, 
   tags: Array<Tag<string>>, 
   evaluator: Evaluate<I, T, Q, S>
): Rule<I, T, Q, S>;
```

## _evaluate

### \_evaluate

```ts
protected readonly _evaluate: Evaluate<I, T, Q, S>;
```

## _requirements

### \_requirements

```ts
protected readonly _requirements: Array<Requirement<string, string>>;
```

## _tags

### \_tags

```ts
protected readonly _tags: Array<Tag<string>>;
```

## _uri

### \_uri

```ts
protected readonly _uri: string;
```

## equals

### equals()

#### Call Signature

```ts
equals<I, T extends Hashable, Q extends Metadata, S>(value: Rule<I, T, Q, S>): boolean;
```

##### Implementation of

```ts
Equatable.equals
```

#### Call Signature

```ts
equals(value: unknown): value is Rule<I, T, Q, S>;
```

##### Implementation of

```ts
Equatable.equals
```

## evaluate

### evaluate()

```ts
evaluate(
   input: I, 
   oracle?: {
} extends Q ? any : Oracle<I, T, Q, S>, 
   outcomes?: Cache, 
   performance?: Performance<Event<I, T, Q, S, Type, string>>
): Promise<Iterable<Outcome<I, T, Q, S, Value>>>;
```

## hash

### hash()

```ts
hash(hash: Hash): void;
```

#### Implementation of

```ts
Hashable.hash
```

## hasRequirement

### hasRequirement()

#### Call Signature

```ts
hasRequirement(requirement: Requirement): boolean;
```

#### Call Signature

```ts
hasRequirement(predicate: Predicate<Requirement<string, string>>): boolean;
```

## hasTag

### hasTag()

#### Call Signature

```ts
hasTag(tag: Tag): boolean;
```

#### Call Signature

```ts
hasTag(predicate: Predicate<Tag<string>>): boolean;
```

## requirements

### requirements

#### Get Signature

```ts
get requirements(): readonly Requirement<string, string>[];
```

## tags

### tags

#### Get Signature

```ts
get tags(): readonly Tag<string>[];
```

## toEARL

### toEARL()

```ts
toEARL(): EARL;
```

#### Implementation of

```ts
earl.Serializable.toEARL
```

## toJSON

### toJSON()

#### Call Signature

```ts
abstract toJSON(options: {
  verbosity: Minimal;
}): MinimalJSON;
```

##### Implementation of

```ts
json.Serializable.toJSON
```

#### Call Signature

```ts
abstract toJSON(): JSON;
```

##### Implementation of

```ts
json.Serializable.toJSON
```

#### Call Signature

```ts
abstract toJSON(options?: Options): JSON | MinimalJSON;
```

##### Implementation of

```ts
json.Serializable.toJSON
```

## toSARIF

### toSARIF()

```ts
toSARIF(): ReportingDescriptor;
```

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
