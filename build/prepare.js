const { findFiles } = require("./helpers/file-system");
const { endsWith, not } = require("./helpers/predicates");
const { packages } = require("./helpers/meta");
const notify = require("./helpers/notify");

const { build } = require("./tasks/build");
const { clean } = require("./tasks/clean");

const files = findFiles("build", endsWith(".js"));

for (const pkg of packages) {
  clean(`packages/${pkg}`);

  files.push(
    ...findFiles(`packages/${pkg}`, endsWith(".ts", ".tsx")).filter(
      not(endsWith(".spec.ts", ".spec.tsx"))
    )
  );
}

files.push(...findFiles("docs", endsWith(".ts", ".tsx")));

for (const file of files) {
  if (build(file)) {
    notify.success(file);
  } else {
    process.exit(1);
  }
}
