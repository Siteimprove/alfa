# Class: Statement

Defined in: [alfa-dom/src/style/rule/layer.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/layer.ts)

## Extends

- `BaseRule`\<`"layer-statement"`\>

## Constructors

### Constructor

```ts
protected new Statement(layers): StatementRule;
```

Defined in: [alfa-dom/src/style/rule/layer.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/layer.ts)

#### Parameters

##### layers

`Array`\<`string`\>

#### Returns

`StatementRule`

#### Overrides

```ts
BaseRule<"layer-statement">.constructor
```

## _attachOwner

### \_attachOwner()

```ts
_attachOwner(owner): boolean;
```

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Parameters

##### owner

[`Sheet`](../../Sheet-1.md)

#### Returns

`boolean`

#### Inherited from

```ts
BaseRule._attachOwner
```

## _attachParent

### \_attachParent()

```ts
_attachParent(parent): boolean;
```

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Parameters

##### parent

[`Rule`](../../Rule-1.md)

#### Returns

`boolean`

#### Inherited from

```ts
BaseRule._attachParent
```

## _owner

### \_owner

```ts
protected _owner: Option<Sheet> = None;
```

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Inherited from

```ts
BaseRule._owner
```

## _parent

### \_parent

```ts
protected _parent: Option<Rule> = None;
```

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Inherited from

```ts
BaseRule._parent
```

## ancestors

### ancestors()

```ts
ancestors(): Iterable<Rule>;
```

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Returns

`Iterable`\<[`Rule`](../../Rule-1.md)\>

#### Inherited from

```ts
BaseRule.ancestors
```

## children

### children()

```ts
children(): Iterable<Rule>;
```

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Returns

`Iterable`\<[`Rule`](../../Rule-1.md)\>

#### Inherited from

```ts
BaseRule.children
```

## descendants

### descendants()

```ts
descendants(): Iterable<Rule>;
```

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Returns

`Iterable`\<[`Rule`](../../Rule-1.md)\>

#### Inherited from

```ts
BaseRule.descendants
```

## equals

### equals()

```ts
equals(value): value is Statement;
```

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Parameters

##### value

`unknown`

#### Returns

`value is Statement`

#### Inherited from

```ts
BaseRule.equals
```

## layers

### layers

#### Get Signature

```ts
get layers(): Iterable<string>;
```

Defined in: [alfa-dom/src/style/rule/layer.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/layer.ts)

##### Returns

`Iterable`\<`string`\>

## of

### of()

```ts
static of(layers): StatementRule;
```

Defined in: [alfa-dom/src/style/rule/layer.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/layer.ts)

#### Parameters

##### layers

`Iterable`\<`string`\>

#### Returns

`StatementRule`

## owner

### owner

#### Get Signature

```ts
get owner(): Option<Sheet>;
```

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

##### Returns

`Option`\<[`Sheet`](../../Sheet-1.md)\>

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

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

##### Returns

`Option`\<[`Rule`](../../Rule-1.md)\>

#### Inherited from

```ts
BaseRule.parent
```

## toJSON

### toJSON()

```ts
toJSON(): JSON;
```

Defined in: [alfa-dom/src/style/rule/layer.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/layer.ts)

#### Returns

[`JSON`](Statement/JSON.md)

#### Overrides

```ts
BaseRule.toJSON
```

## toString

### toString()

```ts
toString(): string;
```

Defined in: [alfa-dom/src/style/rule/layer.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/layer.ts)

#### Returns

`string`

## type

### type

#### Get Signature

```ts
get type(): T;
```

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

##### Returns

`T`

#### Inherited from

```ts
BaseRule.type
```
