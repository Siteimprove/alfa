import "@siteimprove/alfa-enzyme/jest"; // tslint:disable-line:no-import-side-effect

import Enzyme from "enzyme";
import Adapter from "enzyme-adapter-react-16";

Enzyme.configure({ adapter: new Adapter() });
