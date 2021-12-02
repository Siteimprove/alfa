import { test } from "@siteimprove/alfa-test";

import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { Angular } from "../src";

@Component({
  selector: "btn",
  template: `<button class="btn"></button>`,
})
class ButtonComponent {}

TestBed.configureTestingModule({
  declarations: [ButtonComponent],
}).compileComponents();

const fixture = TestBed.createComponent(ButtonComponent);

test(`.toPage creates an Alfa page`, (t) => {
  const page = Angular.toPage(fixture);

  console.dir(page.toJSON());
});
