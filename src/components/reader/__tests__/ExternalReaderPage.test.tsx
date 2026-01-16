import { getStaticProps } from "../../../pages/[library]/read/external/[readUrl]";
import { parseUrl } from "utils/parse";

jest.mock("utils/parse");
jest.mock("dataflow/withAppProps");
describe("Routing Behavior for /read/external/[readUrl].tsx page", () => {
  const mockCtx = (readUrl?: string) => ({
    params: { readUrl }
  });

  test("missing [readUrl] returns notFound on page props", async () => {
    const props = await getStaticProps(mockCtx());
    expect(props).toEqual({ notFound: true });
  });

  test("invalid [readUrl] returns notFound on page props", async () => {
    const props = await getStaticProps(mockCtx("http://not-valid"));
    expect(props).toEqual({ notFound: true });
  });

  test("valid [readUrl] returns readUrl on page props", async () => {
    const url = new URL("https://webreader.com");
    (parseUrl as jest.Mock).mockReturnValue(url);
    const props = await getStaticProps(mockCtx("https://webreader.com"));
    expect(props).toEqual({ props: { readUrl: url.href } });
  });
});
