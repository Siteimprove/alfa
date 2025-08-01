<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@siteimprove/alfa-string](./alfa-string.md) &gt; [String\_2](./alfa-string.string_2.md) &gt; [hasHyphenationOpportunity](./alfa-string.string_2.hashyphenationopportunity.md)

## String\_2.hasHyphenationOpportunity() function

Checks whether the string contains hyphenation opportunities [https://drafts.csswg.org/css-text-4/\#hyphenation-opportunity](https://drafts.csswg.org/css-text-4/#hyphenation-opportunity)

**Signature:**

```typescript
function hasHyphenationOpportunity(input: string): boolean;
```

## Parameters

<table><thead><tr><th>

Parameter


</th><th>

Type


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

input


</td><td>

string


</td><td>


</td></tr>
</tbody></table>

**Returns:**

boolean

## Remarks

Hyphenation opportunities are places where automatic hyphenation can happen without it to be visible if it does not happen. Hyphenation opportunities are only soft wrap opportunities when hyphenation is allowed.

The soft hyphen character (U+00AD SOFT HYPHEN (HTML &amp;<!-- -->shy;)) is a hyphenation opportunity. Always visible hyphens (e.g. U+2010 ‐ HYPHEN) are not because they are always visible and are always soft wrap opportunities, even when hyphenation is not allowed.

