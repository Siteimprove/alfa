# Class: Import

## Extends

- `ConditionRule`\<`"import"`\>

## Constructors

### Constructor

```ts
protected new Import(
   href: string, 
   sheet: Sheet, 
   mediaCondition: Option<string>, 
   supportCondition: Option<string>, 
   layer: Option<string>
): ImportRule;
```

#### Overrides

```ts
ConditionRule<"import">.constructor
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
equals(value: unknown): value is Import;
```

#### Inherited from

```ts
ConditionRule.equals
```

## href

### href

#### Get Signature

```ts
get href(): string;
```

## layer

### layer

#### Get Signature

```ts
get layer(): Option<string>;
```

## mediaQueries

### mediaQueries

#### Get Signature

```ts
get mediaQueries(): List;
```

## of

### of()

```ts
static of(
   href: string, 
   sheet: Sheet, 
   mediaCondition?: Option<string>, 
   supportCondition?: Option<string>, 
   layer?: Option<string>
): ImportRule;
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

## rules

### rules

#### Get Signature

```ts
get rules(): Iterable<Rule>;
```

#### Overrides

```ts
ConditionRule.rules
```

## sheet

### sheet

#### Get Signature

```ts
get sheet(): Sheet;
```

## supportCondition

### supportCondition

#### Get Signature

```ts
get supportCondition(): Option<string>;
```

## supportQuery

### supportQuery

#### Get Signature

```ts
get supportQuery(): Option<Option<Query>>;
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
