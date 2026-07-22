# Class: `Passed<I, T extends Hashable, Q extends Metadata = { }, S = T>`

## Extends

- [`Outcome`](../Outcome-1.md)\<`I`, `T`, `Q`, `S`, [`Passed`](Value.md#passed)\>

## Constructors

### Constructor

```ts
protected new Passed<I, T extends Hashable, Q extends Metadata = {
}, S = T>(
   rule: Rule<I, T, Q, S>, 
   target: T, 
   expectations: Record<{
[key: string]: Result<Diagnostic, Diagnostic>;
}>, 
   mode: Mode
): Passed<I, T, Q, S>;
```

#### Overrides

[`Outcome`](../Outcome-1.md).[`constructor`](../Outcome-1.md#constructor)

## _mode

### \_mode

```ts
protected readonly _mode: Mode;
```

#### Inherited from

[`Outcome`](../Outcome-1.md).[`_mode`](../Outcome-1.md#_mode)

## _rule

### \_rule

```ts
protected readonly _rule: Rule<I, T, Q, S>;
```

#### Inherited from

[`Outcome`](../Outcome-1.md).[`_rule`](../Outcome-1.md#_rule)

## equals

### equals()

#### Call Signature

```ts
equals<I, T extends Hashable, Q extends Metadata, S>(value: Passed<I, T, Q, S>): boolean;
```

##### Overrides

[`Outcome`](../Outcome-1.md).[`equals`](../Outcome-1.md#equals)

#### Call Signature

```ts
equals(value: unknown): value is Passed<I, T, Q, S>;
```

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

## hash

### hash()

```ts
hash(hash: Hash): void;
```

#### Overrides

[`Outcome`](../Outcome-1.md).[`hash`](../Outcome-1.md#hash)

## isSemiAuto

### isSemiAuto

#### Get Signature

```ts
get isSemiAuto(): boolean;
```

#### Inherited from

[`Outcome`](../Outcome-1.md).[`isSemiAuto`](../Outcome-1.md#issemiauto)

## mode

### mode

#### Get Signature

```ts
get mode(): Mode;
```

#### Inherited from

[`Outcome`](../Outcome-1.md).[`mode`](../Outcome-1.md#mode)

## of

### of()

```ts
static of<I, T extends Hashable, Q extends Metadata, S>(
   rule: Rule<I, T, Q, S>, 
   target: T, 
   expectations: Record<{
[key: string]: Result<Diagnostic, Diagnostic>;
}>, 
   mode: Mode
): Passed<I, T, Q, S>;
```

## outcome

### outcome

#### Get Signature

```ts
get outcome(): V;
```

#### Inherited from

[`Outcome`](../Outcome-1.md).[`outcome`](../Outcome-1.md#outcome)

## rule

### rule

#### Get Signature

```ts
get rule(): Rule<I, T, Q, S>;
```

#### Inherited from

[`Outcome`](../Outcome-1.md).[`rule`](../Outcome-1.md#rule)

## target

### target

#### Get Signature

```ts
get target(): T;
```

#### Overrides

[`Outcome`](../Outcome-1.md).[`target`](../Outcome-1.md#target)

## toEARL

### toEARL()

```ts
toEARL(): EARL;
```

#### Overrides

[`Outcome`](../Outcome-1.md).[`toEARL`](../Outcome-1.md#toearl)

## toJSON

### toJSON()

```ts
toJSON(options?: Options): JSON<T>;
```

#### Overrides

[`Outcome`](../Outcome-1.md).[`toJSON`](../Outcome-1.md#tojson)

## toSARIF

### toSARIF()

```ts
toSARIF(): Result;
```

#### Overrides

[`Outcome`](../Outcome-1.md).[`toSARIF`](../Outcome-1.md#tosarif)
