import "@siteimprove/alfa-enzyme/jest"; // tslint:disable-line:no-import-side-effect

import * as Enzyme from "enzyme";
import * as Adapter from "enzyme-adapter-react-16";

Enzyme.configure({ adapter: new Adapter() });
