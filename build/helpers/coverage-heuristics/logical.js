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
function visit(node) {
  let total = 0;
  let depth = 0;

  /**
   * @param {TypeScript.Node} node
   */
  let visitChild = node => {
    console.log(node);
    switch (node.kind) {
      case TypeScript.SyntaxKind.BinaryExpression:
        const binaryExpression = /** @type {TypeScript.BinaryExpression} */ (node);

        switch (binaryExpression.operatorToken.kind) {
          case TypeScript.SyntaxKind.AmpersandToken:
            total += Math.pow(1.1, depth);
        }
    }
    depth++;
    TypeScript.forEachChild(node, visitChild);
    depth--;
  };

  TypeScript.forEachChild(node, visitChild);
  return total;
}

/**
 * @param {Script} script
 */
export function logicalTotalCoverage(script) {
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
}

/**
 * @param {Script} script
 * @param {BlockCoverage | FunctionCoverage} block
 * @return {number}
 */
export function logicalBlockCoverage(script, block) {
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
      file.content.substring(block.range.start.offset, block.range.end.offset),
      TypeScript.ScriptTarget.ES2015
    )
  );

  if (total === 0) {
    return 100;
  }

  return (uncovered / total) * 100;
}
