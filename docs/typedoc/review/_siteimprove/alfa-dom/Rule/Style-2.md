# Class: Style

Defined in: [alfa-dom/src/style/rule/style.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/style.ts)

## Extends

- `BaseRule`\<`"style"`\>

## Constructors

### Constructor

```ts
protected new Style(
   selector, 
   declarations, 
   hint): StyleRule;
```

Defined in: [alfa-dom/src/style/rule/style.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/style.ts)

#### Parameters

##### selector

`string`

##### declarations

[`Declaration`](../Declaration-1.md)[]

##### hint

`boolean`

#### Returns

`StyleRule`

#### Overrides

```ts
BaseRule<"style">.constructor
```

## _attachOwner

### \_attachOwner()

```ts
_attachOwner(owner): boolean;
```

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Parameters

##### owner

[`Sheet`](../Sheet-1.md)

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

[`Rule`](../Rule-1.md)

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

`Iterable`\<[`Rule`](../Rule-1.md)\>

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

`Iterable`\<[`Rule`](../Rule-1.md)\>

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

`Iterable`\<[`Rule`](../Rule-1.md)\>

#### Inherited from

```ts
BaseRule.descendants
```

## equals

### equals()

```ts
equals(value): value is Style;
```

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

#### Parameters

##### value

`unknown`

#### Returns

`value is Style`

#### Inherited from

```ts
BaseRule.equals
```

## hint

### hint

#### Get Signature

```ts
get hint(): boolean;
```

Defined in: [alfa-dom/src/style/rule/style.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/style.ts)

##### Returns

`boolean`

## of

### of()

```ts
static of(
   selector, 
   declarations, 
   hint?): StyleRule;
```

Defined in: [alfa-dom/src/style/rule/style.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/style.ts)

#### Parameters

##### selector

`string`

##### declarations

`Iterable`\<[`Declaration`](../Declaration-1.md)\>

##### hint?

`boolean` = `false`

#### Returns

`StyleRule`

## owner

### owner

#### Get Signature

```ts
get owner(): Option<Sheet>;
```

Defined in: [alfa-dom/src/style/rule/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/rule.ts)

##### Returns

`Option`\<[`Sheet`](../Sheet-1.md)\>

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

`Option`\<[`Rule`](../Rule-1.md)\>

#### Inherited from

```ts
BaseRule.parent
```

## selector

### selector

#### Get Signature

```ts
get selector(): string;
```

Defined in: [alfa-dom/src/style/rule/style.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/style.ts)

##### Returns

`string`

## style

### style

#### Get Signature

```ts
get style(): Block;
```

Defined in: [alfa-dom/src/style/rule/style.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/style.ts)

##### Returns

[`Block`](../Block-1.md)

## toJSON

### toJSON()

```ts
toJSON(): JSON;
```

Defined in: [alfa-dom/src/style/rule/style.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/style.ts)

#### Returns

[`JSON`](Style/JSON.md)

#### Overrides

```ts
BaseRule.toJSON
```

## toString

### toString()

```ts
toString(): string;
```

Defined in: [alfa-dom/src/style/rule/style.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/style/rule/style.ts)

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
