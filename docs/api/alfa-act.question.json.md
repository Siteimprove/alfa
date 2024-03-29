<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@siteimprove/alfa-act](./alfa-act.md) &gt; [Question](./alfa-act.question.md) &gt; [JSON](./alfa-act.question.json.md)

## Question.JSON interface

**Signature:**

```typescript
interface JSON<TYPE, SUBJECT, CONTEXT, ANSWER, URI extends string = string> 
```

## Properties

|  Property | Modifiers | Type | Description |
|  --- | --- | --- | --- |
|  [context](./alfa-act.question.json.context.md) |  | [Serializable.ToJSON](./alfa-json.serializable.tojson.md)<!-- -->&lt;CONTEXT&gt; |  |
|  [diagnostic](./alfa-act.question.json.diagnostic.md) |  | [Diagnostic.JSON](./alfa-act.diagnostic.json.md) |  |
|  [fallback](./alfa-act.question.json.fallback.md) |  | [Option.JSON](./alfa-option.option.json.md)<!-- -->&lt;ANSWER&gt; |  |
|  [message](./alfa-act.question.json.message.md) |  | string |  |
|  [subject](./alfa-act.question.json.subject.md) |  | [Serializable.ToJSON](./alfa-json.serializable.tojson.md)<!-- -->&lt;SUBJECT&gt; |  |
|  [type](./alfa-act.question.json.type.md) |  | [Serializable.ToJSON](./alfa-json.serializable.tojson.md)<!-- -->&lt;TYPE&gt; |  |
|  [uri](./alfa-act.question.json.uri.md) |  | URI |  |

