import { Device } from "@siteimprove/alfa-device";
import { Document } from "@siteimprove/alfa-dom";

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
      document = {
        nodeType: 9,
        childNodes: [],
        styleSheets: []
      },

      device = Device.getDefaultDevice()
    } = page;

    return { ...Resource.of(page), document, device };
  }
}
