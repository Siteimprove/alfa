# Abstract Class: `Grouping<T extends string = string>`

## Extends

- `BaseRule`\<`T`\>

## Extended by

- [`Keyframes`](Keyframes-2.md)
- [`Block`](Layer/Block-1.md)

## Constructors

### Constructor

```ts
protected new Grouping<T extends string = string>(type: T, rules: Array<Rule>): GroupingRule<T>;
```

#### Overrides

```ts
BaseRule<T>.constructor
```

## _attachOwner

### \_attachOwner()

```ts
_attachOwner(owner: Sheet): boolean;
```

#### Inherited from

```ts
BaseRule._attachOwner
```

## _attachParent

### \_attachParent()

```ts
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

```ts
ancestors(): Iterable<Rule>;
```

#### Inherited from

```ts
BaseRule.ancestors
```

## children

### children()

```ts
children(): Iterable<Rule>;
```

#### Overrides

```ts
BaseRule.children
```

## descendants

### descendants()

```ts
descendants(): Iterable<Rule>;
```

#### Inherited from

```ts
BaseRule.descendants
```

## equals

### equals()

```ts
equals(value: unknown): value is Grouping<T>;
```

#### Inherited from

```ts
BaseRule.equals
```

## owner

### owner

#### Get Signature

```ts
get owner(): Option<Sheet>;
```

#### Inherited from

```ts
BaseRule.owner
```

## parent

### parent

#### Get Signature

```ts
get parent(): Option<Rule>;
```

#### Inherited from

```ts
BaseRule.parent
```

## rules

### rules

#### Get Signature

```ts
get rules(): Iterable<Rule>;
```

## toJSON

### toJSON()

```ts
toJSON(): JSON<T>;
```

#### Overrides

```ts
BaseRule.toJSON
```

## type

### type

#### Get Signature

```ts
get type(): T;
```

#### Inherited from

```ts
BaseRule.type
```
