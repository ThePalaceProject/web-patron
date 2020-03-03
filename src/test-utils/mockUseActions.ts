import { mockDispatch } from "./index";
import ActionsCreator from "opds-web-client/lib/actions";
import DataFetcher from "opds-web-client/lib/DataFetcher";
import { useActions } from "opds-web-client/lib/components/context/ActionsContext";
/**
 * First we mock the ActionsCreator
 */
jest.mock("opds-web-client/lib/actions");
const MockedActionCreator = ActionsCreator as jest.MockedClass<
  typeof ActionsCreator
>;

/**
 * We should also mock the DataFetcher but this is currently causing
 * an issue because jest reads the DataFetcher mock from opds-web-client
 * which doest work here
 */

export const mockFetcher = new DataFetcher();

// const mockedUseActions = useActions as jest.Mock;
export const mockActionCreator = new MockedActionCreator(new DataFetcher());

const mockUseActions = jest.fn().mockReturnValue({
  actions: mockActionCreator,
  fetcher: mockFetcher,
  dispatch: mockDispatch
});
jest.mock("opds-web-client/lib/components/context/ActionsContext", () => ({
  ...jest.requireActual(
    "opds-web-client/lib/components/context/ActionsContext"
  ),
  useActions: mockUseActions
}));

beforeEach(() => {
  MockedActionCreator.mockClear();
  mockUseActions.mockClear();
  mockDispatch.mockClear();
});
