# Class: `Media`

## Extends

- `ConditionRule`\<`"media"`\>

## Constructors

### Constructor

```ts
protected new Media(condition: string, rules: Rule[]): MediaRule;
```

#### Overrides

```ts
ConditionRule<"media">.constructor
```

## _attachOwner

### \_attachOwner()

```ts
_attachOwner(owner: Sheet): boolean;
```

#### Inherited from

```ts
ConditionRule._attachOwner
```

## _attachParent

### \_attachParent()

```ts
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

```ts
ancestors(): Iterable<Rule>;
```

#### Inherited from

```ts
ConditionRule.ancestors
```

## children

### children()

```ts
children(): Iterable<Rule>;
```

#### Inherited from

```ts
ConditionRule.children
```

## condition

### condition

#### Get Signature

```ts
get condition(): string;
```

#### Inherited from

```ts
ConditionRule.condition
```

## descendants

### descendants()

```ts
descendants(): Iterable<Rule>;
```

#### Inherited from

```ts
ConditionRule.descendants
```

## equals

### equals()

```ts
equals(value: unknown): value is Media;
```

#### Inherited from

```ts
ConditionRule.equals
```

## of

### of()

```ts
static of(condition: string, rules: Iterable<Rule>): MediaRule;
```

## owner

### owner

#### Get Signature

```ts
get owner(): Option<Sheet>;
```

#### Inherited from

```ts
ConditionRule.owner
```

## parent

### parent

#### Get Signature

```ts
get parent(): Option<Rule>;
```

#### Inherited from

```ts
ConditionRule.parent
```

## queries

### queries

#### Get Signature

```ts
get queries(): List;
```

## rules

### rules

#### Get Signature

```ts
get rules(): Iterable<Rule>;
```

#### Inherited from

```ts
ConditionRule.rules
```

## toJSON

### toJSON()

```ts
toJSON(): JSON;
```

#### Overrides

```ts
ConditionRule.toJSON
```

## toString

### toString()

```ts
toString(): string;
```

## type

### type

#### Get Signature

```ts
get type(): T;
```

#### Inherited from

```ts
ConditionRule.type
```
