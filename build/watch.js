const { watcher, notify } = require("wsk");

const tasks = "build/tasks";

const groups = [
  {
    serviceName: "TypeScript",
    path: "packages/**/{src,test}/**/*.ts{,x}",
    displayOptions: {
      hideAll: true
    },
    events: [
      {
        type: "change",
        taskFiles: [
          `${tasks}/babel/transform.js`,
          `${tasks}/typescript/check.js`,
          `${tasks}/tap/test.js`
        ]
      },
      {
        type: "add",
        taskFiles: [
          `${tasks}/babel/transform.js`,
          `${tasks}/typescript/check.js`,
          `${tasks}/tap/test.js`
        ]
      }
    ]
  },

  {
    serviceName: "Locale",
    path: "packages/**/locale/*.hjson",
    displayOptions: {
      hideAll: true
    },
    events: [
      {
        type: "change",
        taskFiles: [`${tasks}/locale/transform.js`]
      },
      {
        type: "add",
        taskFiles: [`${tasks}/locale/transform.js`]
      }
    ]
  }
];

async function watch() {
  await new Promise(resolve => watcher.add(groups, resolve));

  notify({
    message: "Watching files...",
    display: "watch"
  });
}

watch();
