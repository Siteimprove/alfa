<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@siteimprove/alfa-xpath](./alfa-xpath.md) &gt; [Builder](./alfa-xpath.builder_namespace.md) &gt; [Path\_base](./alfa-xpath.builder_namespace.path_base_variable.md)

## Builder.Path\_base variable

<b>Signature:</b>

```typescript
Path_base: {
        new (expression: Expression.Path): {
            child(name?: string | undefined): Path;
            parent(name?: string | undefined): Path;
            descendant(name?: string | undefined): Path;
            ancestor(name?: string | undefined): Path;
            attribute(name?: string | undefined): Path;
            readonly expression: Expression.Path;
            equals(value: unknown): value is any;
            toJSON(): JSON;
            toString(): string;
        };
    }
```
