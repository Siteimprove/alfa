import { Config } from "webdriverio";

export const config: Config = {
  runner: "local",
  path: "/",
  specs: ["./test/**/*.spec.js"],
  capabilities: [{ browserName: "chrome" }],
  logLevel: "info",
  services: ["chromedriver"],
  framework: "mocha",
  reporters: ["spec"]
};
