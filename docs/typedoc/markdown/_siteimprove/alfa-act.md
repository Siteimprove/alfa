[**Alfa API documentation**](../README.md)

***

[Alfa API documentation](../README.md) / @siteimprove/alfa-act

# @siteimprove/alfa-act

This package provides functionality for implementing rules specified in the
[ACT Rules Format](https://www.w3.org/TR/act-rules-format/).

## Audit

| Class | Description |
| ------ | ------ |
| [Audit](alfa-act/Audit.md) | An Audit is built from an input (usually a page), a set of rules that apply to this kind of input, and optionally an oracle to answer questions arising during the audit. Audits need to be explicitly evaluated to produce outcomes. |

## Cache

| Class | Description |
| ------ | ------ |
| [Cache](alfa-act/Cache.md) | Cache from rules to outcomes. |

## Diagnostic

| Name | Description |
| ------ | ------ |
| [Diagnostic (Namespace)](alfa-act/Diagnostic.md) | - |
| [Diagnostic (Class)](alfa-act/Diagnostic-1.md) | Diagnostics are associated with each Question or final Outcome. They at least contain an explanatory message. Diagnostics can be extended to include more information for the rules that need it. test typedoc |

## Finding

| Name | Description |
| ------ | ------ |
| [Finding (Namespace)](alfa-act/Finding.md) | - |
| [Finding (Type Alias)](alfa-act/Finding-1.md) | The result of an Interview: either a Conclusive finding (a final answer was reached) or an Inconclusive one (more information is needed). |

## Interview

| Name | Description |
| ------ | ------ |
| [Interview (Namespace)](alfa-act/Interview.md) | - |
| [Interview (Type Alias)](alfa-act/Interview-1.md) | An Interview is either a direct ANSWER; or a question who is ultimately going to produce one, possibly through more questions (aka, an Interview). |

## Oracle

| Type Alias | Description |
| ------ | ------ |
| [Oracle](alfa-act/Oracle.md) | * QUESTION: questions' metadata type; has the shape { URI: [T, A] } where URI is the question URI, T a representation of the expected return type, and A the actual return type. Example: { "q1": ["boolean", boolean], "q2": ["number?", number | undefined], } |

## Outcome

| Name | Description |
| ------ | ------ |
| [Outcome (Namespace)](alfa-act/Outcome.md) | - |
| [Outcome (Class)](alfa-act/Outcome-1.md) | I: type of Input for the associated rule T: type of the rule's test target Q: questions' metadata type S: possible types of questions' subject. V: type of outcome value |

## Question

| Name | Description |
| ------ | ------ |
| [Question (Namespace)](alfa-act/Question.md) | - |
| [Question (Class)](alfa-act/Question-1.md) | * TYPE is a (JavaScript manipulable) representation of the expected type of answers. It allows oracles and such to act on it. It can be an Enum, an ID, a union of string literals, … * SUBJECT is the subject of the question. * CONTEXT is the context, some extra info added to help the subject make sense. By convention, the context is *always* the test target (or potential test target when questions are asked in Applicability). * ANSWER is the expected type of the answer. * T is the final result of the question, after transformation. This gives a monadic structure to the question and allow manipulation of the answer without breaking the Question structure. * URI is a unique identifier for the question. |

## Requirement

| Name | Description |
| ------ | ------ |
| [Requirement (Namespace)](alfa-act/Requirement.md) | - |
| [Requirement (Class)](alfa-act/Requirement-1.md) | - |

## Rule

| Name | Description |
| ------ | ------ |
| [Rule (Namespace)](alfa-act/Rule.md) | - |
| [Rule (Class)](alfa-act/Rule-1.md) | * I: type of Input for the rule * T: type of the test targets * Q: questions' metadata type * S: possible types of questions' subject. |

## Tag

| Name | Description |
| ------ | ------ |
| [Tag (Namespace)](alfa-act/Tag.md) | - |
| [Tag (Class)](alfa-act/Tag-1.md) | - |
