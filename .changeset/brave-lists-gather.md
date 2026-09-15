---
"@siteimprove/alfa-rules": minor
---

**Added:** The new rule R119 checks that `<ul>`, `<ol>` and `<dl>` elements only contain the children allowed by the HTML content model.

The rule follows the content model as the HTML specification states it, rather than a relaxed reading of it:

- A `<dl>` either wraps every name-value group in a `<div>` or wraps none of them. The two forms cannot be mixed in one list.
- A `<div>` inside a `<dl>` holds exactly one group. Its content model is one or more `<dt>` elements followed by one or more `<dd>` elements, so packing a second group into the same wrapper is reported and each group needs its own.
- Every group must be well formed, not only the first, so a trailing `<dt>` with no `<dd>` of its own is reported.
- Children are matched by element name rather than by role, so a `<div role="listitem">` does not satisfy a content model asking for an `<li>`. See the [`listitem` role best practices](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/listitem_role#best_practices). Pasting the following into <https://validator.w3.org/nu> reports `Element "div" not allowed as child of element "ul" in this context`:

  ```html
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>List content model check</title>
    </head>
    <body>
      <ul>
        <div role="listitem">List item 1</div>
        <div role="listitem">List item 2</div>
      </ul>
    </body>
  </html>
  ```
  
