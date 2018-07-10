import { Context } from "../../src/types";

export const Person: Context = {
  schema: "http://schema.org/",
  name: "schema:name",
  image: {
    "@id": "schema:image",
    "@type": "@id"
  },
  homepage: {
    "@id": "schema:url",
    "@type": "@id"
  }
};
