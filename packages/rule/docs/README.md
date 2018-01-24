# @alfa/rule

## Index

### Interfaces

* [Aspects](interfaces/aspects.md)
* [Locale](interfaces/locale.md)
* [Rule](interfaces/rule.md)

### Type aliases

* [Applicability](#applicability)
* [Aspect](#aspect)
* [Criterion](#criterion)
* [Expectation](#expectation)
* [Outcome](#outcome)
* [Result](#result)
* [Target](#target)

### Functions

* [check](#check)
* [checkAll](#checkall)

---

# Type aliases

<a id="applicability"></a>

### Applicability

**Τ Applicability**: _`function`_

_Defined in [index.ts:43](https://github.com/Siteimprove/alfa/blob/master/packages/rule/src/index.ts#L43)_

#### Type declaration

►(context: _`Pick`.<[Aspects](interfaces/aspects.md)>,.<`A`>_): `Promise`.<`Iterable`.<`T`>>

**Parameters:**

| Param   | Type                                             | Description |
| ------- | ------------------------------------------------ | ----------- |
| context | `Pick`.<[Aspects](interfaces/aspects.md)>,.<`A`> | -           |

**Returns:** `Promise`.<`Iterable`.<`T`>>

---

<a id="aspect"></a>

### Aspect

**Τ Aspect**: _"document"⎮"style"⎮"layout"_

_Defined in [index.ts:15](https://github.com/Siteimprove/alfa/blob/master/packages/rule/src/index.ts#L15)_

---

<a id="criterion"></a>

### Criterion

**Τ Criterion**: _`string`_

_Defined in [index.ts:5](https://github.com/Siteimprove/alfa/blob/master/packages/rule/src/index.ts#L5)_

---

<a id="expectation"></a>

### Expectation

**Τ Expectation**: _`function`_

_Defined in [index.ts:47](https://github.com/Siteimprove/alfa/blob/master/packages/rule/src/index.ts#L47)_

#### Type declaration

►(target: _`T`_, context: _`Pick`.<[Aspects](interfaces/aspects.md)>,.<`A`>_): `Promise`.<`boolean`>

**Parameters:**

| Param   | Type                                             | Description |
| ------- | ------------------------------------------------ | ----------- |
| target  | `T`                                              | -           |
| context | `Pick`.<[Aspects](interfaces/aspects.md)>,.<`A`> | -           |

**Returns:** `Promise`.<`boolean`>

---

<a id="outcome"></a>

### Outcome

**Τ Outcome**: _"passed"⎮"failed"⎮"inapplicable"_

_Defined in [index.ts:29](https://github.com/Siteimprove/alfa/blob/master/packages/rule/src/index.ts#L29)_

---

<a id="result"></a>

### Result

**Τ Result**: _` object``object `⎮`object`_

_Defined in [index.ts:17](https://github.com/Siteimprove/alfa/blob/master/packages/rule/src/index.ts#L17)_

---

<a id="target"></a>

### Target

**Τ Target**: _`Node`_

_Defined in [index.ts:7](https://github.com/Siteimprove/alfa/blob/master/packages/rule/src/index.ts#L7)_

---

# Functions

<a id="check"></a>

### check

► **check**T,A(rule: _[Rule](interfaces/rule.md)`T`, `A`_, context: _`Pick`.<[Aspects](interfaces/aspects.md)>,.<`A`>_): `Promise`.<`Array`.<[Result](#result)`T`, `A`>>

_Defined in [index.ts:60](https://github.com/Siteimprove/alfa/blob/master/packages/rule/src/index.ts#L60)_

**Type parameters:**

#### T : [Target](#target)

#### A : [Aspect](#aspect)

**Parameters:**

| Param   | Type                                             | Description |
| ------- | ------------------------------------------------ | ----------- |
| rule    | [Rule](interfaces/rule.md)`T`, `A`               | -           |
| context | `Pick`.<[Aspects](interfaces/aspects.md)>,.<`A`> | -           |

**Returns:** `Promise`.<`Array`.<[Result](#result)`T`, `A`>>

---

<a id="checkall"></a>

### checkAll

► **checkAll**T,A(rules: _`Array`.<[Rule](interfaces/rule.md)`T`, `A`>_, context: _`Pick`.<[Aspects](interfaces/aspects.md)>,.<`A`>_): `Promise`.<`Array`.<[Result](#result)`T`, `A`>>

_Defined in [index.ts:98](https://github.com/Siteimprove/alfa/blob/master/packages/rule/src/index.ts#L98)_

**Type parameters:**

#### T : [Target](#target)

#### A : [Aspect](#aspect)

**Parameters:**

| Param   | Type                                             | Description |
| ------- | ------------------------------------------------ | ----------- |
| rules   | `Array`.<[Rule](interfaces/rule.md)`T`, `A`>     | -           |
| context | `Pick`.<[Aspects](interfaces/aspects.md)>,.<`A`> | -           |

**Returns:** `Promise`.<`Array`.<[Result](#result)`T`, `A`>>

---
