/// <reference types="node" />

import * as fs from "fs";
import * as path from "path";
import * as url from "url";

import { Command, flags } from "@oclif/command";
import { error } from "@oclif/errors";

import * as parser from "@oclif/parser";

import { Device, Display, Scripting, Viewport } from "@siteimprove/alfa-device";
import { Header, Cookie } from "@siteimprove/alfa-http";
import {
  Awaiter,
  Credentials,
  Scraper,
  Screenshot,
} from "@siteimprove/alfa-scraper";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Timeout } from "@siteimprove/alfa-time";

export default class Scrape extends Command {
  public static description =
    "Scrape a page and output it in a serialisable format";

  public static flags = {
    help: flags.help({
      description: "Display this command help",
    }),

    output: flags.string({
      char: "o",
      helpValue: "path",
      description:
        "The path to write the page to. If no path is provided, the page is written to stdout",
    }),

    timeout: flags.integer({
      default: 10000,
      helpValue: "milliseconds",
      description: "The maximum time to wait for the page to load",
    }),

    width: flags.integer({
      char: "w",
      default: Viewport.standard().width,
      helpValue: "pixels",
      description: "The width of the browser viewport",
    }),

    height: flags.integer({
      char: "h",
      default: Viewport.standard().height,
      helpValue: "pixels",
      description: "The height of the browser viewport",
    }),

    orientation: flags.enum({
      options: ["landscape", "portrait"],
      default: Viewport.standard().orientation,
      description: "The orientation of the browser viewport",
    }),

    resolution: flags.integer({
      default: 1,
      description: "The pixel density of the browser",
    }),

    scripting: flags.boolean({
      default: true,
      allowNo: true,
      description: "Whether or not scripts, such as JavaScript, are evaluated",
    }),

    username: flags.string({
      char: "u",
      dependsOn: ["password"],
      description: "The username to use for HTTP Basic authentication",
    }),

    password: flags.string({
      char: "p",
      dependsOn: ["username"],
      description: "The password to use for HTTP Basic authentication",
    }),

    headers: flags.string({
      helpValue: "name:value or path",
      multiple: true,
      description: `Additional headers to set, either as name:value pairs or a path to a JSON file`,
    }),

    cookies: flags.string({
      helpValue: "name=value or path",
      multiple: true,
      description: `Additional cookies to set, either as name=value pairs or a path to a JSON file`,
    }),

    "await-state": flags.enum({
      options: ["ready", "loaded", "idle"],
      exclusive: ["await-duration", "await-selector", "await-xpath"],
      description: "The state to await before considering the page loaded",
    }),

    "await-duration": flags.integer({
      exclusive: ["await-state", "await-selector", "await-xpath"],
      helpValue: "milliseconds",
      description: "The duration to wait before considering the page loaded",
    }),

    "await-selector": flags.string({
      exclusive: ["await-state", "await-duration", "await-xpath"],
      helpValue: "selector",
      description:
        "A CSS selector matching an element that must be present before considering the page loaded",
    }),

    "await-xpath": flags.string({
      exclusive: ["await-state", "await-duration", "await-selector"],
      helpValue: "expression",
      description:
        "An XPath expression evaluating to an element that must be present before considering the page loaded",
    }),

    screenshot: flags.string({
      helpValue: "path",
      description:
        "The path to write a screenshot to. If not provided, no screenshot is taken",
    }),

    "screenshot-type": flags.enum({
      options: ["png", "jpeg"],
      default: "png",
      description: "The file type of the screenshot",
    }),

    "screenshot-background": flags.boolean({
      default: true,
      allowNo: true,
      description:
        "Whether or not the screenshot should include a default white background. Only applies to PNG screenshots",
    }),

    "screenshot-quality": flags.integer({
      default: 100,
      helpValue: "0-100",
      description:
        "The quality of the screenshot. Only applies to JPEG screenshots",
    }),
  };

  public static args = [
    {
      name: "url",
      required: true,
      description: "The URL of the page to scrape",
    },
  ];

  public async run() {
    const { args, flags } = this.parse(Scrape);

    await Scrape.runWithFlags(flags, args.url);
  }

  public static async runWithFlags(flags: Flags, target: string) {
    const scraper = await Scraper.of();

    let awaiter: Awaiter | undefined;

    switch (flags["await-state"]) {
      case "ready":
        awaiter = Awaiter.ready();
        break;
      case "loaded":
        awaiter = Awaiter.loaded();
        break;
      case "idle":
        awaiter = Awaiter.idle();
    }

    if (flags["await-duration"] !== undefined) {
      awaiter = Awaiter.duration(flags["await-duration"]);
    }

    if (flags["await-selector"] !== undefined) {
      awaiter = Awaiter.selector(flags["await-selector"]);
    }

    if (flags["await-xpath"] !== undefined) {
      awaiter = Awaiter.xpath(flags["await-xpath"]);
    }

    const orientation =
      flags.orientation === "portrait"
        ? Viewport.Orientation.Portrait
        : Viewport.Orientation.Landscape;

    const device = Device.of(
      Device.Type.Screen,
      Viewport.of(flags.width, flags.height, orientation),
      Display.of(flags.resolution),
      Scripting.of(flags.scripting)
    );

    const credentials =
      flags.username === undefined || flags.password === undefined
        ? undefined
        : Credentials.of(flags.username, flags.password);

    let screenshot: Screenshot | undefined;

    if (flags.screenshot !== undefined) {
      switch (flags["screenshot-type"]) {
        case "png":
          screenshot = Screenshot.of(
            flags.screenshot,
            Screenshot.Type.PNG.of(flags["screenshot-background"])
          );
          break;

        case "jpeg":
          screenshot = Screenshot.of(
            flags.screenshot,
            Screenshot.Type.JPEG.of(flags["screenshot-quality"])
          );
      }
    }

    const headers = Sequence.from(flags.headers ?? []).flatMap((header) => {
      const index = header.indexOf(":");

      if (index === -1) {
        try {
          const headers = Sequence.from<Header.JSON>(
            JSON.parse(fs.readFileSync(header, "utf-8"))
          );

          return headers.map((header) => Header.of(header.name, header.value));
        } catch (err) {
          error(err.message, { exit: 1 });
        }
      }

      return Sequence.of(
        Header.of(header.substring(0, index), header.substring(index + 1))
      );
    });

    const cookies = Sequence.from(flags.cookies ?? []).flatMap((cookie) => {
      const index = cookie.indexOf("=");

      if (index === -1) {
        try {
          const cookies = Sequence.from<Cookie.JSON>(
            JSON.parse(fs.readFileSync(cookie, "utf-8"))
          );

          return cookies.map((cookie) => Cookie.of(cookie.name, cookie.value));
        } catch (err) {
          error(err.message, { exit: 1 });
        }
      }

      return Sequence.of(
        Cookie.of(cookie.substring(0, index), cookie.substring(index + 1))
      );
    });

    const timeout = Timeout.of(flags.timeout);

    const result = await scraper.scrape(
      new URL(target, url.pathToFileURL(process.cwd() + path.sep)),
      {
        timeout,
        awaiter,
        device,
        credentials,
        screenshot,
        headers,
        cookies,
      }
    );

    await scraper.close();

    if (result.isErr()) {
      error(result.getErr(), { exit: 1 });
    }

    const output = JSON.stringify(result.get()) + "\n";

    if (flags.output === undefined) {
      process.stdout.write(output);
    } else {
      fs.writeFileSync(flags.output, output);
    }
  }
}

export type Flags = typeof Scrape extends parser.Input<infer F> ? F : never;
