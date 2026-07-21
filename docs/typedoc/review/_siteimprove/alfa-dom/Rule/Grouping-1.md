# Abstract Class: Grouping\<`T` *extends* `string` = `string`\>

## Extends

- `BaseRule`\<`T`\>

## Extended by

- [`Keyframes`](Keyframes-2.md)
- [`Block`](Layer/Block-1.md)

## Constructors

### Constructor

```typescript
protected new Grouping<T extends string = string>(type: T, rules: Array<Rule>): GroupingRule<T>;
```

#### Overrides

```ts
BaseRule<T>.constructor
```

## _attachOwner

### \_attachOwner()

```typescript
_attachOwner(owner: Sheet): boolean;
```

#### Inherited from

```ts
BaseRule._attachOwner
```

## _attachParent

### \_attachParent()

```typescript
_attachParent(parent: Rule): boolean;
```

#### Inherited from

```ts
BaseRule._attachParent
```

## _owner

### \_owner

```ts
protected _owner: Option<Sheet> = None;
```

#### Inherited from

```ts
BaseRule._owner
```

## _parent

### \_parent

```ts
protected _parent: Option<Rule> = None;
```

#### Inherited from

```ts
BaseRule._parent
```

## _rules

### \_rules

```ts
protected readonly _rules: Array<Rule>;
```

## ancestors

### ancestors()

```typescript
ancestors(): Iterable<Rule>;
```

#### Inherited from

```ts
BaseRule.ancestors
```

## children

### children()

```typescript
children(): Iterable<Rule>;
```

#### Overrides

```ts
BaseRule.children
```

## descendants

### descendants()

```typescript
descendants(): Iterable<Rule>;
```

#### Inherited from

```ts
BaseRule.descendants
```

## equals

### equals()

```typescript
equals(value: unknown): value is Grouping<T>;
```

#### Inherited from

```ts
BaseRule.equals
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

```ts
BaseRule.owner
```

## parent

### parent

#### Get Signature

```typescript
get parent(): Option<Rule>;
```

##### Returns

`Option`\<[`Rule`](../Rule-1.md)\>

#### Inherited from

```ts
BaseRule.parent
```

## rules

### rules

#### Get Signature

```typescript
get rules(): Iterable<Rule>;
```

##### Returns

`Iterable`\<[`Rule`](../Rule-1.md)\>

## toJSON

### toJSON()

```typescript
toJSON(): JSON<T>;
```

#### Overrides

```ts
BaseRule.toJSON
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

```ts
BaseRule.type
```
