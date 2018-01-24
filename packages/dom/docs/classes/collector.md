[@alfa/dom](../README.md) > [Collector](../classes/collector.md)

# Class: Collector

## Type parameters

#### T : [Node](../interfaces/node.md)

## Implements

* `Iterable`.<`T`>

## Index

### Constructors

* [constructor](collector.md#constructor)

### Properties

* [\_\_@iterator](collector.md#___iterator)

### Methods

* [first](collector.md#first)
* [last](collector.md#last)
* [values](collector.md#values)
* [where](collector.md#where)

---

## Constructors

<a id="constructor"></a>

### ⊕ **new Collector**(context: _[Node](../interfaces/node.md)_, predicate?: _`Predicate`.<[Node](../interfaces/node.md)>,.<`T`>_): [Collector](collector.md)

_Defined in [collect.ts:19](https://github.com/Siteimprove/alfa/blob/master/packages/dom/src/collect.ts#L19)_

**Parameters:**

| Param     | Type                                               | Default value      | Description |
| --------- | -------------------------------------------------- | ------------------ | ----------- |
| context   | [Node](../interfaces/node.md)                      | -                  | -           |
| predicate | `Predicate`.<[Node](../interfaces/node.md)>,.<`T`> | () &#x3D;&gt; true | -           |

**Returns:** [Collector](collector.md)

---

## Properties

<a id="___iterator"></a>

### \_\_@iterator

**● \_\_@iterator**: _`function`_

_Defined in [collect.ts:7](https://github.com/Siteimprove/alfa/blob/master/packages/dom/src/collect.ts#L7)_

#### Type declaration

►(): `Iterator`.<`T`>

**Returns:** `Iterator`.<`T`>

---

## Methods

<a id="first"></a>

### first

► **first**(): `T`⎮`null`

_Defined in [collect.ts:34](https://github.com/Siteimprove/alfa/blob/master/packages/dom/src/collect.ts#L34)_

**Returns:** `T`⎮`null`

---

<a id="last"></a>

### last

► **last**(): `T`⎮`null`

_Defined in [collect.ts:42](https://github.com/Siteimprove/alfa/blob/master/packages/dom/src/collect.ts#L42)_

**Returns:** `T`⎮`null`

---

<a id="values"></a>

### values

► **values**(): `Iterator`.<`T`>

_Defined in [collect.ts:52](https://github.com/Siteimprove/alfa/blob/master/packages/dom/src/collect.ts#L52)_

**Returns:** `Iterator`.<`T`>

---

<a id="where"></a>

### where

► **where**U(predicate: _`Predicate`.<`T`>,.<`U`>_): [Collector](collector.md)`U`

_Defined in [collect.ts:27](https://github.com/Siteimprove/alfa/blob/master/packages/dom/src/collect.ts#L27)_

**Type parameters:**

#### U : `T`

**Parameters:**

| Param     | Type                     | Description |
| --------- | ------------------------ | ----------- |
| predicate | `Predicate`.<`T`>,.<`U`> | -           |

**Returns:** [Collector](collector.md)`U`

---
