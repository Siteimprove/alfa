import { Graph } from "@siteimprove/alfa-graph";

import { Resource } from "./resource";

/**
 * @see https://en.wikipedia.org/wiki/Web_site
 */
export interface Site {
  readonly resources: Graph<Resource>;
}
