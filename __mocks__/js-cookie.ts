/**
 * Stateful js-cookie mock. get, set, and remove operate on a shared
 * in-memory store so they interact correctly. The store is cleared before
 * each test to mirror session-cookie behavior.
 */
const store: Record<string, string> = {};

const mockCookie = {
  get: jest.fn((key: string) => store[key]),
  set: jest.fn((key: string, value: string) => {
    store[key] = value;
  }),
  remove: jest.fn((key: string) => {
    delete store[key];
  })
};

beforeEach(() => {
  Object.keys(store).forEach(key => delete store[key]);
});

export default mockCookie;
