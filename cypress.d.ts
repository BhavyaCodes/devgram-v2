/* eslint-disable @typescript-eslint/no-unused-vars */
// declare global {
namespace Cypress {
  interface Chainable {
    login(): Chainable<void>;
    mongoRestore(): void;
    mongoDump(): void;
    dropDB(): void;
    // drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>;
    // dismiss(
    //   subject: string,
    //   options?: Partial<TypeOptions>,
    // ): Chainable<Element>;
    // visit(
    //   originalFn: CommandOriginalFn,
    //   url: string,
    //   options: Partial<VisitOptions>,
    // ): Chainable<Element>;
  }
}
// }
