# Class: Keyframes

## Extends

- [`Grouping`](Grouping-1.md)\<`"keyframes"`\>

## Constructors

### Constructor

```typescript
protected new Keyframes(name: string, rules: Rule[]): KeyframesRule;
```

#### Overrides

[`Grouping`](Grouping-1.md).[`constructor`](Grouping-1.md#constructor)

## _attachOwner

### \_attachOwner()

```typescript
_attachOwner(owner: Sheet): boolean;
```

#### Inherited from

[`Grouping`](Grouping-1.md).[`_attachOwner`](Grouping-1.md#_attachowner)

## _attachParent

### \_attachParent()

```typescript
_attachParent(parent: Rule): boolean;
```

#### Inherited from

[`Grouping`](Grouping-1.md).[`_attachParent`](Grouping-1.md#_attachparent)

## _owner

### \_owner

```ts
protected _owner: Option<Sheet> = None;
```

#### Inherited from

[`Grouping`](Grouping-1.md).[`_owner`](Grouping-1.md#_owner)

## _parent

### \_parent

```ts
protected _parent: Option<Rule> = None;
```

#### Inherited from

[`Grouping`](Grouping-1.md).[`_parent`](Grouping-1.md#_parent)

## _rules

### \_rules

```ts
protected readonly _rules: Array<Rule>;
```

#### Inherited from

[`Grouping`](Grouping-1.md).[`_rules`](Grouping-1.md#_rules)

## ancestors

### ancestors()

```typescript
ancestors(): Iterable<Rule>;
```

#### Inherited from

[`Grouping`](Grouping-1.md).[`ancestors`](Grouping-1.md#ancestors)

## children

### children()

```typescript
children(): Iterable<Rule>;
```

#### Inherited from

[`Grouping`](Grouping-1.md).[`children`](Grouping-1.md#children)

## descendants

### descendants()

```typescript
descendants(): Iterable<Rule>;
```

#### Inherited from

[`Grouping`](Grouping-1.md).[`descendants`](Grouping-1.md#descendants)

## equals

### equals()

```typescript
equals(value: unknown): value is Keyframes;
```

#### Inherited from

[`Grouping`](Grouping-1.md).[`equals`](Grouping-1.md#equals)

## name

### name

#### Get Signature

```typescript
get name(): string;
```

##### Returns

`string`

## of

### of()

```typescript
static of(name: string, rules: Iterable<Rule>): KeyframesRule;
```

## owner

### owner

#### Get Signature

```typescript
get owner(): Option<Sheet>;
```

##### Returns

`Option`\<[`Sheet`](../Sheet-1.md)\>

#### Inherited from

[`Grouping`](Grouping-1.md).[`owner`](Grouping-1.md#owner)

## parent

### parent

#### Get Signature

```typescript
get parent(): Option<Rule>;
```

##### Returns

`Option`\<[`Rule`](../Rule-1.md)\>

#### Inherited from

[`Grouping`](Grouping-1.md).[`parent`](Grouping-1.md#parent)

## rules

### rules

#### Get Signature

```typescript
get rules(): Iterable<Rule>;
```

##### Returns

`Iterable`\<[`Rule`](../Rule-1.md)\>

#### Inherited from

[`Grouping`](Grouping-1.md).[`rules`](Grouping-1.md#rules)

## toJSON

### toJSON()

```typescript
toJSON(): JSON;
```

#### Overrides

[`Grouping`](Grouping-1.md).[`toJSON`](Grouping-1.md#tojson)

## toString

### toString()

```typescript
toString(): string;
```

## type

### type

#### Get Signature

```typescript
get type(): T;
```

##### Returns

`T`

#### Inherited from

[`Grouping`](Grouping-1.md).[`type`](Grouping-1.md#type)
