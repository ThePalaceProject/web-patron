// import { visitAuthd } from "../fixtures/testUser";
// import { rest } from "msw";
// import mswServer from "../../msw";
// import { mockLoans } from "../../msw/handlers/mockLoans";

// const serverUrl = "https://qa-circulation.openebooks.us/USOEI";

// describe("Open eBooks Read Online", () => {
//   /**
//    * We will have to mock the server response for this so that there is
//    * always a checked out book viewable.
//    */
//   it("Read Online button exists and works", () => {
//     visitAuthd("/app/loans");

//     mswServer.use(rest.get(`${serverUrl}/loans`, mockLoans));

//     cy.intercept("GET", `${serverUrl}/loans`, {
//       fixture: "open-ebooks/loans.xml"
//     });
//     // make sure the read online buttons are there
//     cy.findAllByRole("link", { name: "Read Online" }).should("have.length", 3);
//   });
// });

export {};
