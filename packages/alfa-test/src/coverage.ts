import * as inspector from "inspector";

const { Session } = inspector;

const session = new Session();
session.connect();

session.post("Profiler.enable");
session.post("Profiler.startPreciseCoverage", {
  callCount: false,
  detailed: true
});

process.on("exit", () => {
  session.post("Profiler.takePreciseCoverage", (err, res) => {
    if (err) {
      console.error(err.message);
    } else {
      // Do something with collected coverage
    }
  });
});
