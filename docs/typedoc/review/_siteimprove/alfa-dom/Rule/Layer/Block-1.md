# Class: `Block`

## Extends

- [`Grouping`](../Grouping-1.md)\<`"layer-block"`\>

## Constructors

### Constructor

```ts
protected new Block(layer: Option<string>, rules: Array<Rule>): BlockRule;
```

#### Overrides

[`Grouping`](../Grouping-1.md).[`constructor`](../Grouping-1.md#constructor)

## _attachOwner

### \_attachOwner()

```ts
_attachOwner(owner: Sheet): boolean;
```

#### Inherited from

[`Grouping`](../Grouping-1.md).[`_attachOwner`](../Grouping-1.md#_attachowner)

## _attachParent

### \_attachParent()

```ts
_attachParent(parent: Rule): boolean;
```

#### Inherited from

[`Grouping`](../Grouping-1.md).[`_attachParent`](../Grouping-1.md#_attachparent)

## _owner

### \_owner

```ts
protected _owner: Option<Sheet> = None;
```

#### Inherited from

[`Grouping`](../Grouping-1.md).[`_owner`](../Grouping-1.md#_owner)

## _parent

### \_parent

```ts
protected _parent: Option<Rule> = None;
```

#### Inherited from

[`Grouping`](../Grouping-1.md).[`_parent`](../Grouping-1.md#_parent)

## _rules

### \_rules

```ts
protected readonly _rules: Array<Rule>;
```

#### Inherited from

[`Grouping`](../Grouping-1.md).[`_rules`](../Grouping-1.md#_rules)

## ancestors

### ancestors()

```ts
ancestors(): Iterable<Rule>;
```

#### Inherited from

[`Grouping`](../Grouping-1.md).[`ancestors`](../Grouping-1.md#ancestors)

## children

### children()

```ts
children(): Iterable<Rule>;
```

#### Inherited from

[`Grouping`](../Grouping-1.md).[`children`](../Grouping-1.md#children)

## descendants

### descendants()

```ts
descendants(): Iterable<Rule>;
```

#### Inherited from

[`Grouping`](../Grouping-1.md).[`descendants`](../Grouping-1.md#descendants)

## equals

### equals()

```ts
equals(value: unknown): value is Block;
```

#### Overrides

[`Grouping`](../Grouping-1.md).[`equals`](../Grouping-1.md#equals)

## layer

### layer

#### Get Signature

```ts
get layer(): Option<string>;
```

## of

### of()

```ts
static of(rules: Iterable<Rule>, layer?: string | null): BlockRule;
```

## owner

### owner

#### Get Signature

```ts
get owner(): Option<Sheet>;
```

#### Inherited from

[`Grouping`](../Grouping-1.md).[`owner`](../Grouping-1.md#owner)

## parent

### parent

#### Get Signature

```ts
get parent(): Option<Rule>;
```

#### Inherited from

[`Grouping`](../Grouping-1.md).[`parent`](../Grouping-1.md#parent)

## rules

### rules

#### Get Signature

```ts
get rules(): Iterable<Rule>;
```

#### Inherited from

[`Grouping`](../Grouping-1.md).[`rules`](../Grouping-1.md#rules)

## toJSON

### toJSON()

```ts
toJSON(): JSON;
```

#### Overrides

[`Grouping`](../Grouping-1.md).[`toJSON`](../Grouping-1.md#tojson)

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

[`Grouping`](../Grouping-1.md).[`type`](../Grouping-1.md#type)
