# Abstract Class: Outcome\<I, T extends Hashable, Q extends Metadata = { }, S = T, V extends Value = Value\>

## Extended by

- [`Passed`](Outcome/Passed-2.md)
- [`Failed`](Outcome/Failed-2.md)
- [`CantTell`](Outcome/CantTell-2.md)
- [`Inapplicable`](Outcome/Inapplicable-2.md)

## Implements

- `Equatable`
- `Hashable`
- `Serializable`\<[`JSON`](Outcome/JSON.md)\<`V`\>\>
- `Serializable`\<[`EARL`](Outcome/EARL.md)\>
- `Serializable`\<`sarif.Result`\>

## Constructors

### Constructor

```ts
protected new Outcome<I, T extends Hashable, Q extends Metadata = {
}, S = T, V extends Value = Value>(
   outcome: V, 
   rule: Rule<I, T, Q, S>, 
   mode: Mode
): Outcome<I, T, Q, S, V>;
```

## _mode

### \_mode

```ts
protected readonly _mode: Mode;
```

## _rule

### \_rule

```ts
protected readonly _rule: Rule<I, T, Q, S>;
```

## equals

### equals()

#### Call Signature

```ts
equals<I, T extends Hashable, Q extends Metadata, S, V extends Value = Value>(value: Outcome<I, T, Q, S, V>): boolean;
```

##### Implementation of

```ts
Equatable.equals
```

#### Call Signature

```ts
equals(value: unknown): value is Outcome<I, T, Q, S, V>;
```

##### Implementation of

```ts
Equatable.equals
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

## isSemiAuto

### isSemiAuto

#### Get Signature

```ts
get isSemiAuto(): boolean;
```

## mode

### mode

#### Get Signature

```ts
get mode(): Mode;
```

## outcome

### outcome

#### Get Signature

```ts
get outcome(): V;
```

## rule

### rule

#### Get Signature

```ts
get rule(): Rule<I, T, Q, S>;
```

## target

### target

#### Get Signature

```ts
get target(): T | undefined;
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

```ts
toJSON(options?: Options): JSON<V>;
```

#### Implementation of

```ts
json.Serializable.toJSON
```

## toSARIF

### toSARIF()

```ts
abstract toSARIF(): Result;
```

#### Implementation of

```ts
sarif.Serializable.toSARIF
```
