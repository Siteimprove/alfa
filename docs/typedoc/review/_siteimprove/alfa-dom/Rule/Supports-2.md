# Class: Supports

## Extends

- `ConditionRule`\<`"supports"`\>

## Constructors

### Constructor

```typescript
protected new Supports(condition: string, rules: Rule[]): SupportsRule;
```

#### Overrides

```ts
ConditionRule<"supports">.constructor
```

## _attachOwner

### \_attachOwner()

```typescript
_attachOwner(owner: Sheet): boolean;
```

#### Inherited from

```ts
ConditionRule._attachOwner
```

## _attachParent

### \_attachParent()

```typescript
_attachParent(parent: Rule): boolean;
```

#### Inherited from

```ts
ConditionRule._attachParent
```

## _condition

### \_condition

```ts
protected readonly _condition: string;
```

#### Inherited from

```ts
ConditionRule._condition
```

## _owner

### \_owner

```ts
protected _owner: Option<Sheet> = None;
```

#### Inherited from

```ts
ConditionRule._owner
```

## _parent

### \_parent

```ts
protected _parent: Option<Rule> = None;
```

#### Inherited from

```ts
ConditionRule._parent
```

## _rules

### \_rules

```ts
protected readonly _rules: Array<Rule>;
```

#### Inherited from

```ts
ConditionRule._rules
```

## ancestors

### ancestors()

```typescript
ancestors(): Iterable<Rule>;
```

#### Inherited from

```ts
ConditionRule.ancestors
```

## children

### children()

```typescript
children(): Iterable<Rule>;
```

#### Inherited from

```ts
ConditionRule.children
```

## condition

### condition

#### Get Signature

```typescript
get condition(): string;
```

##### Returns

`string`

#### Inherited from

```ts
ConditionRule.condition
```

## descendants

### descendants()

```typescript
descendants(): Iterable<Rule>;
```

#### Inherited from

```ts
ConditionRule.descendants
```

## equals

### equals()

```typescript
equals(value: unknown): value is Supports;
```

#### Inherited from

```ts
ConditionRule.equals
```

## of

### of()

```typescript
static of(condition: string, rules: Iterable<Rule>): SupportsRule;
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
ConditionRule.owner
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
ConditionRule.parent
```

## query

### query

#### Get Signature

```typescript
get query(): Option<Query>;
```

##### Returns

`Option`\<`Query`\>

## rules

### rules

#### Get Signature

```typescript
get rules(): Iterable<Rule>;
```

##### Returns

`Iterable`\<[`Rule`](../Rule-1.md)\>

#### Inherited from

```ts
ConditionRule.rules
```

## toJSON

### toJSON()

```typescript
toJSON(): JSON;
```

#### Overrides

```ts
ConditionRule.toJSON
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
ConditionRule.type
```
