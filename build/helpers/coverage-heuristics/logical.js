import { BlockCoverage, FunctionCoverage, Script } from "../coverage";
import * as TypeScript from "typescript";

/**
 * @param {Script} script
 */
function totalOperations(script) {
  let total = 0;
  if (script.sources.length > 1) {
    // typescript
    for (let i = 1, n = script.sources.length; i < n; i++) {
      total += visit(
        TypeScript.createSourceFile(
          "anon.ts",
          script.sources[i].content,
          TypeScript.ScriptTarget.ES2015
        )
      );
    }
  } else {
    // javascript
    total += visit(
      TypeScript.createSourceFile(
        "anon.ts",
        script.sources[0].content,
        TypeScript.ScriptTarget.ES2015
      )
    );
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
          TypeScript.createSourceFile(
            "anon.ts",
            file.content.substring(
              block.range.start.offset,
              block.range.end.offset
            ),
            TypeScript.ScriptTarget.ES2015
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
   * @return {number}
   */
  block(script, block) {
    const total = totalOperations(script);
    const file = script.sources.find(source => {
      return source.path === block.range.start.path;
    });

    if (file === undefined) {
      return 0;
    }

    let uncovered = visit(
      TypeScript.createSourceFile(
        "anon.ts",
        file.content.substring(
          block.range.start.offset,
          block.range.end.offset
        ),
        TypeScript.ScriptTarget.ES2015
      )
    );

    if (total === 0) {
      return 100;
    }

    return (uncovered / total) * 100;
  }
};
