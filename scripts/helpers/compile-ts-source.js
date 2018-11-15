const TypeScript = require("typescript");

/**
 * @param {string} file
 * Creates a typescript source file from a specified file
 * with the relevant options.
 * This enables us to easily change the compile settings.
 */
function createTypeScriptSource(file) {
  return TypeScript.createSourceFile(
    "anon.ts",
    file,
    TypeScript.ScriptTarget.ES2015
  );
}

exports.createTypeScriptSource = createTypeScriptSource;
