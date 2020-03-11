import * as React from "react";
import { render, fixtures, fireEvent } from "../../test-utils";
// this file with the custom mock must be imported before the useActions
import "../../test-utils/mockUseActions";
import { useActions } from "opds-web-client/lib/components/context/ActionsContext";
import Search from "../Search";
import merge from "deepmerge";
import userEvent from "@testing-library/user-event";

test("fetches search description", async () => {
  // we can call this hook here because it is actually a mocked hook
  const { actions, dispatch } = useActions();
  const node = render(<Search />, {
    initialState: merge(fixtures.initialState, {
      collection: {
        data: {
          search: {
            url: "/search-url"
          }
        }
      }
    })
  });
  expect(actions.fetchSearchDescription).toHaveBeenCalledTimes(1);
  expect(actions.fetchSearchDescription).toHaveBeenCalledWith("/search-url");
  expect(node.store.dispatch).toHaveBeenCalledTimes(1);
});

// mock out the react router stuff
const mockPush = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useHistory: () => ({
    push: mockPush
  })
}));

test("searching calls history.push with url", async () => {
  const mockedTemplate = jest.fn().mockReturnValue("templatereturn");
  const node = render(<Search />, {
    initialState: merge(fixtures.initialState, {
      collection: {
        data: {
          search: {
            url: "/search-url",
            searchData: {
              template: mockedTemplate
            }
          }
        }
      }
    })
  });
  const searchButton = node.getByText("Search");
  const input = node.getByLabelText("Enter search keyword or keywords");
  // act
  userEvent.type(input, "my search");
  fireEvent.click(searchButton);

  // assert
  expect(mockPush).toHaveBeenCalledTimes(1);
  expect(mockedTemplate).toHaveBeenCalledTimes(1);
  expect(mockedTemplate).toHaveBeenCalledWith("my%20search");
  expect(mockPush).toHaveBeenCalledWith("/collection/templatereturn");
});
