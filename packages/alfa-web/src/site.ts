import { Graph } from "@siteimprove/alfa-graph";

import * as json from "@siteimprove/alfa-json";

import { Resource } from "./resource";

/**
 * @see https://en.wikipedia.org/wiki/Web_site
 */
export class Site<R extends Resource = Resource>
  implements json.Serializable<Site.JSON<R>> {
  public static of<R extends Resource>(resources: Graph<R>): Site<R> {
    return new Site(resources);
  }

  private readonly _resources: Graph<R>;

  private constructor(resources: Graph<R>) {
    this._resources = resources;
  }

  public get resources(): Graph<R> {
    return this._resources;
  }

  public toJSON(): Site.JSON<R> {
    return {
      resources: this._resources.toJSON(),
    };
  }
}

export namespace Site {
  export interface JSON<R extends Resource = Resource> {
    [key: string]: json.JSON;
    resources: Graph.JSON<R>;
  }
}
