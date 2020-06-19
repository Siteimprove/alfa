/// <reference types="node" />

import * as fs from "fs";
import * as path from "path";
import * as url from "url";

import type { Command } from "@siteimprove/alfa-command";
import { Device, Display, Scripting, Viewport } from "@siteimprove/alfa-device";
import { Header, Cookie } from "@siteimprove/alfa-http";
import { Ok, Err } from "@siteimprove/alfa-result";
import {
  Awaiter,
  Credentials,
  Scraper,
  Screenshot,
} from "@siteimprove/alfa-scraper";
import { Timeout } from "@siteimprove/alfa-time";

import type { Arguments } from "./arguments";
import type { Flags } from "./flags";

export const run: Command.Runner<typeof Flags, typeof Arguments> = async ({
  flags,
  args: { url: target },
}) => {
  const scraper = await Scraper.of();

  let awaiter: Awaiter | undefined;

  for (const state of flags.awaitState) {
    switch (state) {
      case "ready":
        awaiter = Awaiter.ready();
        break;
      case "loaded":
        awaiter = Awaiter.loaded();
        break;
      case "idle":
        awaiter = Awaiter.idle();
    }
  }

  for (const duration of flags.awaitDuration) {
    awaiter = Awaiter.duration(duration);
  }

  for (const selector of flags.awaitSelector) {
    awaiter = Awaiter.selector(selector);
  }

  for (const xpath of flags.awaitXPath) {
    awaiter = Awaiter.xpath(xpath);
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
    flags.username.isNone() || flags.password.isNone()
      ? undefined
      : Credentials.of(flags.username.get(), flags.password.get());

  let screenshot: Screenshot | undefined;

  for (const path of flags.screenshot) {
    switch (flags.screenshotType) {
      case "png":
        screenshot = Screenshot.of(
          path,
          Screenshot.Type.PNG.of(flags.screenshotBackground)
        );
        break;

      case "jpeg":
        screenshot = Screenshot.of(
          path,
          Screenshot.Type.JPEG.of(flags.screenshotQuality)
        );
    }
  }

  const headers = [...flags.headers].map((header) => {
    const index = header.indexOf(":");

    if (index === -1) {
      return Header.of(header, "");
    }

    return Header.of(header.substring(0, index), header.substring(index + 1));
  });

  for (const path of flags.headersPath) {
    try {
      const parsed = Array.from<Header.JSON>(
        JSON.parse(fs.readFileSync(path, "utf-8"))
      );

      headers.push(
        ...parsed.map((header) => Header.of(header.name, header.value))
      );
    } catch (err) {
      return Err.of(err.message);
    }
  }

  const cookies = [...flags.cookies].map((cookie) => {
    const index = cookie.indexOf("=");

    if (index === -1) {
      return Cookie.of(cookie, "");
    }

    return Cookie.of(cookie.substring(0, index), cookie.substring(index + 1));
  });

  for (const path of flags.cookiesPath) {
    try {
      const parsed = Array.from<Cookie.JSON>(
        JSON.parse(fs.readFileSync(path, "utf-8"))
      );

      cookies.push(
        ...parsed.map((cookie) => Cookie.of(cookie.name, cookie.value))
      );
    } catch (err) {
      return Err.of(err.message);
    }
  }

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
    return result;
  }

  const output = JSON.stringify(result.get());

  if (flags.output.isNone()) {
    return Ok.of(output);
  } else {
    fs.writeFileSync(flags.output.get() + "\n", output);
    return Ok.of("");
  }
};
