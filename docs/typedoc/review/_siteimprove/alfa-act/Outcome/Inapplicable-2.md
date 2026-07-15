# Class: Inapplicable\<I, T, Q, S\>

## Extends

- [`Outcome`](../Outcome-1.md)\<`I`, `T`, `Q`, `S`, [`Inapplicable`](Value.md#inapplicable)\>

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `I` | - |
| `T` *extends* `Hashable` | - |
| `Q` *extends* [`Metadata`](../Question/Metadata.md) | \{ \} |
| `S` | `T` |

## Constructors

### Constructor

```typescript
protected new Inapplicable<I, T extends Hashable, Q extends Metadata = {
}, S = T>(rule: Rule<I, T, Q, S>, mode: Mode): Inapplicable<I, T, Q, S>;
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

```typescript
equals<I, T extends Hashable, Q extends Metadata, S>(value: Inapplicable<I, T, Q, S>): boolean;
```

##### Overrides

[`Outcome`](../Outcome-1.md).[`equals`](../Outcome-1.md#equals)

#### Call Signature

```typescript
equals(value: unknown): value is Inapplicable<I, T, Q, S>;
```

##### Overrides

[`Outcome`](../Outcome-1.md).[`equals`](../Outcome-1.md#equals)

## hash

### hash()

```typescript
hash(hash: Hash): void;
```

#### Inherited from

[`Outcome`](../Outcome-1.md).[`hash`](../Outcome-1.md#hash)

## isSemiAuto

### isSemiAuto

#### Get Signature

```typescript
get isSemiAuto(): boolean;
```

##### Returns

`boolean`

#### Inherited from

[`Outcome`](../Outcome-1.md).[`isSemiAuto`](../Outcome-1.md#issemiauto)

## mode

### mode

#### Get Signature

```typescript
get mode(): Mode;
```

##### Returns

[`Mode`](Mode.md)

#### Inherited from

[`Outcome`](../Outcome-1.md).[`mode`](../Outcome-1.md#mode)

## of

### of()

```typescript
static of<I, T extends Hashable, Q extends Metadata, S>(rule: Rule<I, T, Q, S>, mode: Mode): Inapplicable<I, T, Q, S>;
```

## outcome

### outcome

#### Get Signature

```typescript
get outcome(): V;
```

##### Returns

`V`

#### Inherited from

[`Outcome`](../Outcome-1.md).[`outcome`](../Outcome-1.md#outcome)

## rule

### rule

#### Get Signature

```typescript
get rule(): Rule<I, T, Q, S>;
```

##### Returns

[`Rule`](../Rule-1.md)\<`I`, `T`, `Q`, `S`\>

#### Inherited from

[`Outcome`](../Outcome-1.md).[`rule`](../Outcome-1.md#rule)

## target

### target

#### Get Signature

```typescript
get target(): T | undefined;
```

##### Returns

`T` \| `undefined`

#### Inherited from

[`Outcome`](../Outcome-1.md).[`target`](../Outcome-1.md#target)

## toEARL

### toEARL()

```typescript
toEARL(): EARL;
```

#### Overrides

[`Outcome`](../Outcome-1.md).[`toEARL`](../Outcome-1.md#toearl)

## toJSON

### toJSON()

```typescript
toJSON(options?: Options): JSON;
```

#### Overrides

[`Outcome`](../Outcome-1.md).[`toJSON`](../Outcome-1.md#tojson)

## toSARIF

### toSARIF()

```typescript
toSARIF(): Result;
```

#### Overrides

[`Outcome`](../Outcome-1.md).[`toSARIF`](../Outcome-1.md#tosarif)
