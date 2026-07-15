# Class: Statement

## Extends

- `BaseRule`\<`"layer-statement"`\>

## Constructors

### Constructor

```typescript
protected new Statement(layers: Array<string>): StatementRule;
```

#### Overrides

```ts
BaseRule<"layer-statement">.constructor
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

#### Inherited from

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
equals(value: unknown): value is Statement;
```

#### Inherited from

```ts
BaseRule.equals
```

## layers

### layers

#### Get Signature

```typescript
get layers(): Iterable<string>;
```

##### Returns

`Iterable`\<`string`\>

## of

### of()

```typescript
static of(layers: Iterable<string>): StatementRule;
```

## owner

### owner

#### Get Signature

```typescript
get owner(): Option<Sheet>;
```

##### Returns

`Option`\<[`Sheet`](../../Sheet-1.md)\>

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

`Option`\<[`Rule`](../../Rule-1.md)\>

#### Inherited from

```ts
BaseRule.parent
```

## toJSON

### toJSON()

```typescript
toJSON(): JSON;
```

#### Overrides

```ts
BaseRule.toJSON
```

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

```ts
BaseRule.type
```
