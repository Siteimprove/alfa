import { Document } from "@siteimprove/alfa-json-ld";

/**
 * @public
 */
export interface EARL extends Document {
  "@context"?: {
    earl?: "http://www.w3.org/ns/earl#";
    cnt?: "http://www.w3.org/2011/content#";
    dct?: "http://purl.org/dc/terms/";
    doap?: "http://usefulinc.com/ns/doap#";
    // https://github.com/w3c/json-ld-syntax/issues/399#issuecomment-1161749807
    foaf?: "http://xmlns.com/foaf/0.1/";
    http?: "http://www.w3.org/2011/http#";
    ptr?: "http://www.w3.org/2009/pointers#";
  };
}
