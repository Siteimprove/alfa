<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@siteimprove/alfa-xpath](./alfa-xpath.md) &gt; [Builder](./alfa-xpath.builder.md) &gt; [Path\_base](./alfa-xpath.builder.path_base.md)

## Builder.Path\_base variable

**Signature:**

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
