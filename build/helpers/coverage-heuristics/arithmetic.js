import { BlockCoverage, FunctionCoverage, Script } from "../coverage";
import * as TypeScript from "typescript";

function visit(node) {
  let total = 0;
  let visitChild = node => {
    switch (node.kind) {
      case TypeScript.SyntaxKind.BinaryExpression:
        switch (node.operatorToken.kind) {
          case TypeScript.SyntaxKind.SlashToken:
          case TypeScript.SyntaxKind.PlusToken:
          case TypeScript.SyntaxKind.MinusToken:
          case TypeScript.SyntaxKind.AsteriskToken:
            total++;
        }
    }

    TypeScript.forEachChild(node, visitChild);
  };

  TypeScript.forEachChild(node, visitChild);
  return total;
}

/**
 * @param {Script} script
 */
export function arithmeticTotalCoverage(script) {
  let total = 0;
  let uncovered = 0;
  if (script.sources.length > 1) {
    // typescript
    for (let i = 1, n = script.sources.length; i < n; i++) {
      total += visit(
        TypeScript.createSourceFile("anon.ts", script.sources[i].content)
      );
    }
  } else {
    // javascript
    total += visit(
      TypeScript.createSourceFile("anon.ts", script.sources[0].content)
    );
  }

  for (let block of script.coverage) {
    if (block.count < 1) {
      const file = script.sources.find(source => {
        return source.path === block.range.start.path;
      });
      uncovered += visit(
        TypeScript.createSourceFile(
          "anon.ts",
          file.content.substring(
            block.range.start.offset,
            block.range.end.offset
          )
        )
      );
    }
  }
  console.log(uncovered, total);
  return (1 - uncovered / total) * 100;
}

/**
 * @param {Script} script
 * @param {BlockCoverage | FunctionCoverage} block
 */
export function arithmeticBlockCoverage(script, block) {
  return 7;
}
