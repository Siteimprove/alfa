import { BlockCoverage, FunctionCoverage, Script } from "../coverage";
import * as TypeScript from "typescript";

/**
 * @param {String} source
 */
const createSource = source =>
  TypeScript.createSourceFile(
    "anon.ts",
    source,
    TypeScript.ScriptTarget.ES2015
  );

/**
 * @param {Script} script
 */
function totalOperations(script) {
  let total = 0;
  if (script.sources.length > 1) {
    // typescript
    for (let i = 1, n = script.sources.length; i < n; i++) {
      total += visit(createSource(script.sources[i].content));
    }
  } else {
    // javascript
    total += visit(createSource(script.sources[0].content));
  }
  if (total === 0) {
    applicable = false;
  }
  return total;
}

/**
 * @param {TypeScript.Node} node
 */
function visit(node, depth = -1) {
  let total = 0;

  switch (node.kind) {
    case TypeScript.SyntaxKind.BinaryExpression:
      const binaryExpression = /** @type {TypeScript.BinaryExpression} */ (node);
      switch (binaryExpression.operatorToken.kind) {
        case TypeScript.SyntaxKind.AmpersandAmpersandToken:
        case TypeScript.SyntaxKind.BarBarToken:
        case TypeScript.SyntaxKind.GreaterThanToken:
        case TypeScript.SyntaxKind.GreaterThanEqualsToken:
        case TypeScript.SyntaxKind.LessThanToken:
        case TypeScript.SyntaxKind.LessThanEqualsToken:
        case TypeScript.SyntaxKind.EqualsEqualsToken:
        case TypeScript.SyntaxKind.EqualsEqualsEqualsToken:
          depth++;
          total += Math.pow(1.1, depth);
      }
  }

  TypeScript.forEachChild(node, node => {
    total += visit(node, depth > -1 ? depth++ : -1);
  });

  return total;
}

let applicable = true;

export const Logical = {
  /**
   * @param {Script} script
   */
  total(script) {
    const total = totalOperations(script);
    let uncovered = 0;

    for (let block of script.coverage) {
      if (block.count < 1) {
        const file = script.sources.find(source => {
          return source.path === block.range.start.path;
        });

        if (file === undefined) {
          continue;
        }

        uncovered += visit(
          createSource(
            file.content.substring(
              block.range.start.offset,
              block.range.end.offset
            )
          )
        );
      }
    }

    if (total === 0) {
      return 100;
    }

    return (1 - uncovered / total) * 100;
  },

  /**
   * @param {Script} script
   * @param {BlockCoverage | FunctionCoverage} block
   * @param {number} total
   * @return {number}
   */
  block(script, block, total) {
    const file = script.sources.find(source => {
      return source.path === block.range.start.path;
    });

    if (file === undefined) {
      return 0;
    }

    let uncovered = visit(
      createSource(
        file.content.substring(block.range.start.offset, block.range.end.offset)
      )
    );

    if (total === 0) {
      return 100;
    }

    return (uncovered / total) * 100;
  },

  applicable() {
    return applicable;
  }
};
