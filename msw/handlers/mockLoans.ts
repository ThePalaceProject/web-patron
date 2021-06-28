// src/mocks/resolvers/mockUser.js
import loansFixture from "../fixtures/open-ebooks/loans";

export const mockLoans = (req: any, res: any, ctx: any) => {
  return res(ctx.xml(loansFixture));
};
