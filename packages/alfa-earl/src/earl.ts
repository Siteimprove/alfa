import { Document } from "@siteimprove/alfa-json-ld";

export interface EARL extends Document {
  "@context"?: {
    earl?: "http://www.w3.org/ns/earl#";
    cnt?: "http://www.w3.org/2011/content#";
    dct?: "http://purl.org/dc/terms/";
    http?: "http://www.w3.org/2011/http#";
    ptr?: "http://www.w3.org/2009/pointers#";
  };
}
