import { jest } from "@jest/globals";
import { SWRResponse } from "swr";

jest.mock("swr");

export function makeSwrResponse<T>(value?: Partial<SWRResponse<T, any>>) {
  return {
    data: undefined,
    error: undefined,
    // revalidate: jest.fn(),
    isValidating: false,
    mutate: jest.fn(),
    ...value
  };
}

export type MockSwr<T> = (value?: Partial<SWRResponse<T, any>>) => void;
