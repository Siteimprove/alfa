# Abstract Class: Outcome\<I, T, Q, S, V\>

## Extended by

- [`Passed`](Outcome/Passed-2.md)
- [`Failed`](Outcome/Failed-2.md)
- [`CantTell`](Outcome/CantTell-2.md)
- [`Inapplicable`](Outcome/Inapplicable-2.md)

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `I` | - |
| `T` *extends* `Hashable` | - |
| `Q` *extends* [`Metadata`](Question/Metadata.md) | \{ \} |
| `S` | `T` |
| `V` *extends* [`Value`](Outcome/Value.md) | [`Value`](Outcome/Value.md) |

## Implements

- `Equatable`
- `Hashable`
- `Serializable`\<[`JSON`](Outcome/JSON.md)\<`V`\>\>
- `Serializable`\<[`EARL`](Outcome/EARL.md)\>
- `Serializable`\<`sarif.Result`\>

## Constructors

### Constructor

```typescript
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

```typescript
equals<I, T extends Hashable, Q extends Metadata, S, V extends Value = Value>(value: Outcome<I, T, Q, S, V>): boolean;
```

##### Implementation of

```ts
Equatable.equals
```

#### Call Signature

```typescript
equals(value: unknown): value is Outcome<I, T, Q, S, V>;
```

##### Implementation of

```ts
Equatable.equals
```

## hash

### hash()

```typescript
hash(hash: Hash): void;
```

#### Implementation of

```ts
Hashable.hash
```

## isSemiAuto

### isSemiAuto

#### Get Signature

```typescript
get isSemiAuto(): boolean;
```

##### Returns

`boolean`

## mode

### mode

#### Get Signature

```typescript
get mode(): Mode;
```

##### Returns

[`Mode`](Outcome/Mode.md)

## outcome

### outcome

#### Get Signature

```typescript
get outcome(): V;
```

##### Returns

`V`

## rule

### rule

#### Get Signature

```typescript
get rule(): Rule<I, T, Q, S>;
```

##### Returns

[`Rule`](Rule-1.md)\<`I`, `T`, `Q`, `S`\>

## target

### target

#### Get Signature

```typescript
get target(): T | undefined;
```

##### Returns

`T` \| `undefined`

## toEARL

### toEARL()

```typescript
toEARL(): EARL;
```

#### Implementation of

```ts
earl.Serializable.toEARL
```

## toJSON

### toJSON()

```typescript
toJSON(options?: Options): JSON<V>;
```

#### Implementation of

```ts
json.Serializable.toJSON
```

## toSARIF

### toSARIF()

```typescript
abstract toSARIF(): Result;
```

#### Implementation of

```ts
sarif.Serializable.toSARIF
```
