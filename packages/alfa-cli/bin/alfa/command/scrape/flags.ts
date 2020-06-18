import { Flag } from "../../../../src/flag";

export const Flags = {
  help: Flag.help("Display the help information."),

  output: Flag.string(
    "output",
    `The path to write the page to. If no path is provided, the page is written
    to stdout.`
  )
    .type("path")
    .alias("o")
    .optional(),

  timeout: Flag.integer(
    "timeout",
    "The maximum time to wait for the page to load."
  )
    .type("milliseconds")
    .default(10000),

  width: Flag.integer("width", "The width of the browser viewport.")
    .type("pixels")
    .alias("w")
    .default(1280),

  height: Flag.integer("height", "The height of the browser viewport.")
    .type("pixels")
    .alias("h")
    .default(720),

  orientation: Flag.string(
    "orientation",
    "The orientation of the browser viewport."
  )
    .choices("landscape", "portrait")
    .default("landscape"),

  resolution: Flag.integer(
    "resolution",
    "The pixel density of the browser as a device pixel ratio."
  )
    .type("ratio")
    .default(1),

  scripting: Flag.boolean(
    "scripting",
    "Whether or not scripts, such as JavaScript, are evaluated."
  ).default(true),

  username: Flag.string(
    "username",
    "The username to use for HTTP Basic authentication."
  )
    .alias("u")
    .optional(),

  password: Flag.string(
    "password",
    "The password to use for HTTP Basic authentication."
  )
    .alias("p")
    .optional(),

  headers: Flag.string(
    "header",
    `An additional header to set as a name:value pair. This flag can be repeated
    to set multiple headers.`
  )
    .type("name:value")
    .repeatable()
    .default([]),

  headersPath: Flag.string(
    "headers",
    `A path to a JSON file containing additional headers to set. The file must
    contain a list of { name: string, value: string } objects.`
  )
    .type("path")
    .optional(),

  cookies: Flag.string(
    "cookie",
    `An additional cookie to set as a name=value pair. This flag can be repeated
    to set multiple cookies.`
  )
    .type("name=value")
    .repeatable()
    .default([]),

  cookiesPath: Flag.string(
    "cookies",
    `A path to a JSON file containing additional cookies to set. The file must
    contain a list of { name: string, value: string } objects.`
  )
    .type("path")
    .optional(),

  awaitState: Flag.string(
    "await-state",
    "The state to await before considering the page loaded."
  )
    .choices("ready", "loaded", "idle")
    .default("loaded"),

  awaitDuration: Flag.integer(
    "await-duration",
    "The duration to wait before considering the page loaded."
  )
    .type("milliseconds")
    .optional(),

  awaitSelector: Flag.string(
    "await-selector",
    `A CSS selector matching an element that must be present before considering
    the page loaded.`
  )
    .type("selector")
    .optional(),

  awaitXPath: Flag.string(
    "await-xpath",
    `An XPath expression evaluating to an element that must be present before
    considering the page loaded.`
  )
    .type("expression")
    .optional(),

  screenshot: Flag.string(
    "screenshot",
    "The path to write a screenshot to. If not provided, no screenshot is taken."
  )
    .type("path")
    .optional(),

  screenshotType: Flag.string(
    "screenshot-type",
    "The file type of the screenshot"
  )
    .choices("png", "jpeg")
    .default("png"),

  screenshotBackground: Flag.boolean(
    "screenshot-background",
    `Whether or not the screenshot should include a default white background.
    Only applies to PNG screenshots.`
  ).default(true),

  screenshotQuality: Flag.integer(
    "screenshot-quality",
    "The quality of the screenshot. Only applies to JPEG screenshots."
  )
    .type("0-100")
    .filter((value) => value >= 0 && value <= 100)
    .default(100),
};
