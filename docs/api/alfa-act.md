<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@siteimprove/alfa-act](./alfa-act.md)

## alfa-act package

This package provides functionality for implementing rules specified in the [ACT Rules Format](https://www.w3.org/TR/act-rules-format/)<!-- -->.

## Classes

|  Class | Description |
|  --- | --- |
|  [Audit](./alfa-act.audit.md) | \* I: type of Input for rules \* T: possible types of test targets \* Q: questions' metadata type \* S: possible types of questions' subject. |
|  [Cache](./alfa-act.cache.md) |  |
|  [Diagnostic](./alfa-act.diagnostic.md) |  |
|  [Question](./alfa-act.question.md) | \* TYPE is a (JavaScript manipulable) representation of the expected type of answers. It allows oracles and such to act on it. It can be an Enum, an ID, a union of string literals, … \* SUBJECT is the subject of the question. \* CONTEXT is the context, some extra info added to help the subject make sense. By convention, the context is \*always\* the test target (or potential test target when questions are asked in Applicability). \* ANSWER is the expected type of the answer. \* T is the final result of the question, after transformation. This gives a monadic structure to the question and allow manipulation of the answer without breaking the Question structure. \* URI is a unique identifier for the question. |

## Abstract Classes

|  Abstract Class | Description |
|  --- | --- |
|  [Outcome](./alfa-act.outcome.md) | I: type of Input for the associated rule T: type of the rule's test target Q: questions' metadata type S: possible types of questions' subject. V: type of outcome value |
|  [Requirement](./alfa-act.requirement.md) |  |
|  [Rule](./alfa-act.rule.md) | \* I: type of Input for the rule \* T: type of the test targets \* Q: questions' metadata type \* S: possible types of questions' subject. |
|  [Tag](./alfa-act.tag.md) |  |

## Namespaces

|  Namespace | Description |
|  --- | --- |
|  [Diagnostic](./alfa-act.diagnostic.md) |  |
|  [Interview](./alfa-act.interview.md) |  |
|  [Outcome](./alfa-act.outcome.md) |  |
|  [Question](./alfa-act.question.md) |  |
|  [Requirement](./alfa-act.requirement.md) |  |
|  [Rule](./alfa-act.rule.md) |  |
|  [Tag](./alfa-act.tag.md) |  |

## Type Aliases

|  Type Alias | Description |
|  --- | --- |
|  [Interview](./alfa-act.interview.md) | <p>An Interview is either a direct ANSWER; or a question who is ultimately going to produce one, possibly through more questions (aka, an Interview).</p><p>The QUESTION type maps questions' URI to the expected type of answer, both as a JavaScript manipulable representation (T), and an actual type (A). The SUBJECT and CONTEXT types are the subject and context of the question.</p> |
|  [Oracle](./alfa-act.oracle.md) | \* QUESTION: questions' metadata type; has the shape { URI: \[T, A\] } where URI is the question URI, T a representation of the expected return type, and A the actual return type. Example: { "q1": \["boolean", boolean\], "q2": \["number?", number \| undefined\], } |

