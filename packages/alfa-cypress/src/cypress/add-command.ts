/// <reference types="cypress" />

export function addCommand(
  name: string,
  options: Cypress.CommandOptions,
  command: (...args: Array<any>) => unknown
): void {
  Cypress.Commands.add(name, options, command);
}
