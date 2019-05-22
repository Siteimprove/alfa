// tslint:disable:no-import-side-effect

import "@siteimprove/alfa-jest";

import "@siteimprove/alfa-enzyme/jest";

import * as Enzyme from "enzyme";
import * as Adapter from "enzyme-adapter-react-16";

Enzyme.configure({ adapter: new Adapter() });
