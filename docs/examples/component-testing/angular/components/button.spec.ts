/// <reference types="@siteimprove/alfa-jest" />

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ButtonComponent } from "./button";

describe("ButtonComponent", () => {
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ButtonComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonComponent);
    fixture.detectChanges();
  });

  it("should be accessible", () => {
    expect(fixture).toBeAccessible();
  });
});
