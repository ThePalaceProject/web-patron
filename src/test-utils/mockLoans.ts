import { BookData } from "interfaces";
import * as fetch from "dataflow/opds1/fetch";
import { fixtures } from "test-utils";

(fetch as any).fetchCollection = jest.fn();
export const mockedFetchCollection = fetch.fetchCollection as jest.MockedFunction<
  typeof fetch.fetchCollection
>;

export default function mockLoans(books: BookData[] = fixtures.loans.books) {
  mockedFetchCollection.mockResolvedValue({ ...fixtures.loans, books });
}
