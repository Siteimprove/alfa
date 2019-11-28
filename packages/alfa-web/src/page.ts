import { Device } from "@siteimprove/alfa-device";
import { Document } from "@siteimprove/alfa-dom";
import { isObject } from "@siteimprove/alfa-guards";

import { Resource } from "./resource";

/**
 * @see https://en.wikipedia.org/wiki/Web_page
 */
export interface Page extends Resource {
  readonly document: Document;
  readonly device: Device;
}

export namespace Page {
  export function of(page: Partial<Page>): Page {
    const {
      document = Document.of(self => []),

      device = Device.getDefaultDevice()
    } = page;

    return { ...Resource.of(page), document, device };
  }

  export function isPage(value: unknown): value is Page {
    return isObject(value);
  }
}
