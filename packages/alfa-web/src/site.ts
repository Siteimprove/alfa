import { Graph } from "@siteimprove/alfa-graph";

import { Resource } from "./resource";

/**
 * @see https://en.wikipedia.org/wiki/Web_site
 */
export class Site {
  public static of(resources: Graph<Resource>): Site {
    return new Site(resources);
  }

  private readonly _resources: Graph<Resource>;

  private constructor(resources: Graph<Resource>) {
    this._resources = resources;
  }

  public get resources(): Graph<Resource> {
    return this._resources;
  }

  public toJSON() {
    return {
      resources: this._resources.toJSON()
    };
  }
}
