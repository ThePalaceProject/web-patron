import { jest } from "@jest/globals";
import { SWRResponse, KeyedMutator } from "swr";

jest.mock("swr");

export function makeSwrResponse<T>(value?: Partial<SWRResponse<T>>) {
  // Casting through unknown here to bypass strict type checking.
  const mockMutate = jest.fn() as unknown as KeyedMutator<T>;

  return {
    data: undefined,
    error: undefined,
    isValidating: false,
    mutate: mockMutate,
    ...value
  };
}

export type MockSwr<T> = (value?: Partial<SWRResponse<T, any>>) => void;
