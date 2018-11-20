const TypeScript = require("typescript");
const { writeFile } = require("./file-system");

const annotatedComment = ["@todo", "@hack", "@bug", "@fixme"];

const lines = /**@type {Set<String>} */ (new Set());

/**
 * @param {string} file
 * @param {TypeScript.SourceFile} source
 */
function computeComments(file, source) {
  /**
   * @param {TypeScript.Node} node
   */
  function visit(node) {
    const comment = TypeScript.getCommentRange(node);
    if (comment !== undefined) {
      const start = source.getLineAndCharacterOfPosition(comment.pos).line + 1;
      const text = source.getText().substring(comment.pos, comment.end);
      const split = text.split("\n");

      for (let i = 0; i < split.length; i++) {
        const line = split[i].trim();
        for (const ac of annotatedComment) {
          if (line.toLowerCase().startsWith(`* ${ac}`)) {
            const url = `https://github.com/siteimprove/alfa/blob/master/${file.replace(
              /\\/g,
              "/"
            )}#L${start + i}`;
            lines.add(
              `* [${file}:${start + i}](${url}): ${line.substring(2)}\r\n`
            );
            break;
          }
        }
      }
    }
    TypeScript.forEachChild(node, visit);
  }
  TypeScript.forEachChild(source, visit);
}

function createTODOSFile() {
  let commentFileData = "";
  const all = /**@type {Map<String, String[]>} */ (new Map());

  for (const line of lines) {
    for (const ac of annotatedComment) {
      if (line.toLowerCase().includes(`${ac}`)) {
        const list = all.get(ac);
        if (list !== undefined) {
          list.push(line);
          all.set(ac, list);
        } else {
          all.set(ac, [line]);
        }
        break;
      }
    }
  }
  for (const key of all.keys()) {
    commentFileData += "\r\n";
    commentFileData += `# ${key.substring(1, key.length).toUpperCase()}:\r\n`;
    const val = all.get(key);
    if (val === undefined) {
      continue;
    }
    for (const ln of val) {
      commentFileData += ln;
    }
  }
  writeFile("./TODOS.md", commentFileData);
}

exports.computeComments = computeComments;
exports.createTODOSFile = createTODOSFile;
