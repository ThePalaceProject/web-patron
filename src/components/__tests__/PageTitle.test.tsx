import * as React from "react";
import { render, fixtures, actions } from "../../test-utils";
import merge from "deepmerge";

test.todo("Format Filter tests", () => {});

// describe.skip("Format filters", () => {
//   test("Format filters not rendered when showFormatFilter not provided", () => {
//     const node = render(<Layout>Child</Layout>, {
//       initialState: stateWithFacets
//     });
//     expect(node.queryByLabelText("Format filters")).toBeFalsy();
//     expect(node.queryByText("All")).toBeFalsy();
//     expect(node.queryByLabelText("Books")).toBeFalsy();
//     expect(node.queryByLabelText("Audiobooks")).toBeFalsy();
//   });
//   test("Format filters are visible on home w/ facets", () => {
//     const node = render(<Layout showFormatFilter>Child</Layout>, {
//       initialState: stateWithFacets
//     });
//     expect(node.getByText("ALL")).toBeTruthy();
//     expect(node.getByLabelText("Books")).toBeTruthy();
//     expect(node.getByLabelText("Audiobooks")).toBeTruthy();
//   });

//   test("format filters are visible on collection w/ facets present", () => {
//     const node = render(<Layout showFormatFilter>Child</Layout>, {
//       initialState: stateWithFacets
//     });
//     expect(node.getByText("ALL")).toBeTruthy();
//     expect(node.getByLabelText("Books")).toBeTruthy();
//     expect(node.getByLabelText("Audiobooks")).toBeTruthy();
//   });

//   test("format filters are not visible if facets arent present", () => {
//     const node = render(<Layout showFormatFilter>Child</Layout>, {
//       // should render collection.data = null
//       initialState: undefined
//     });

//     expect(node.queryByText("ALL")).toBeNull();
//     expect(node.queryByLabelText("Books")).toBeNull();
//     expect(node.queryByLabelText("Audiobooks")).toBeNull();
//   });

//   test("format filters navigate to respective urls", () => {
//     const node = render(<Layout showFormatFilter>Child</Layout>, {
//       initialState: stateWithFacets
//     });

//     expect(node.queryByText("ALL")?.closest("a")).toHaveAttribute(
//       "href",
//       "/collection/all"
//     );
//     expect(node.queryByLabelText("Books")?.closest("a")).toHaveAttribute(
//       "href",
//       "/collection/ebooks"
//     );
//     expect(node.queryByLabelText("Audiobooks")?.closest("a")).toHaveAttribute(
//       "href",
//       "/collection/audiobooks"
//     );
//   });

//   test("format filter has aria-current", () => {
//     const node = render(<Layout showFormatFilter>Child</Layout>, {
//       initialState: stateWithFacets
//     });
//     // need to test both visual and aria here
//     expect(node.queryByText("ALL")?.closest("a")).toHaveAttribute(
//       "aria-current",
//       "false"
//     );
//     expect(node.queryByLabelText("Books")?.closest("a")).toHaveAttribute(
//       "aria-current",
//       "true"
//     );
//     expect(node.queryByLabelText("Audiobooks")?.closest("a")).toHaveAttribute(
//       "aria-current",
//       "false"
//     );
//   });
// });
