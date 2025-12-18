# Alfa Content

Packages for working with various representations of HTML content.
For now only provides a representation for visible content based on the HTML `innerText` algorithm.

## The rendered text collection steps

The rendered text collection steps, given a node node, are as follows:

1. Let items be the result of running the rendered text collection steps with each child node of node in tree order, and then concatenating the results to a single list.

2. If node's computed value of 'visibility' is not 'visible', then return items.

3. If node is not being rendered, then return items. For the purpose of this step, the following elements must act as described if the computed value of the 'display' property is not 'none':
   - select elements have an associated non-replaced inline CSS box whose child boxes include only those of optgroup and option element descendant nodes;

   - optgroup elements have an associated non-replaced block-level CSS box whose child boxes include only those of option element descendant nodes; and

   - option elements have an associated non-replaced block-level CSS box whose child boxes are as normal for non-replaced block-level CSS boxes.

**Note:** items can be non-empty due to 'display:contents'.

4. If node is a Text node, then for each CSS text box produced by node, in content order, compute the text of the box after application of the CSS 'white-space' processing rules and 'text-transform' rules, set items to the list of the resulting strings, and return items. The CSS 'white-space' processing rules are slightly modified: collapsible spaces at the end of lines are always collapsed, but they are only removed if the line is the last line of the block, or it ends with a br element. Soft hyphens should be preserved.

5. If node is a br element, then append a string containing a single U+000A LF code point to items.

6. If node's computed value of 'display' is 'table-cell', and node's CSS box is not the last 'table-cell' box of its enclosing 'table-row' box, then append a string containing a single U+0009 TAB code point to items.

7. If node's computed value of 'display' is 'table-row', and node's CSS box is not the last 'table-row' box of the nearest ancestor 'table' box, then append a string containing a single U+000A LF code point to items.

8. If node is a p element, then append 2 (a required line break count) at the beginning and end of items.

9. If node's used value of 'display' is block-level or 'table-caption', then append 1 (a required line break count) at the beginning and end of items. [CSSDISPLAY]

**Note:** Floats and absolutely-positioned elements fall into this category.

10. Return items.

**Note** that descendant nodes of most replaced elements (e.g., textarea, input, and video — but not button) are not rendered by CSS, strictly speaking, and therefore have no CSS boxes for the purposes of this algorithm.
