import { CheerioWrapper } from "@siteimprove/alfa-cheerio";
import { Wrapper } from "@vue/test-utils";
import Vue from "vue";

export type VueWrapper = Wrapper<Vue | null> | CheerioWrapper;
