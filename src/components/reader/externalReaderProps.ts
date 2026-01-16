import withAppProps from "dataflow/withAppProps";
import { GetStaticProps } from "next";
import { parseUrl } from "utils/parse";

export const getExternalReaderProps: GetStaticProps = withAppProps(
  async ctx => {
    const raw = ctx.params?.readUrl;

    if (typeof raw !== "string") {
      return { notFound: true };
    }

    const url = parseUrl(raw);

    if (!url) {
      return { notFound: true };
    }

    return {
      props: {
        readUrl: url.href
      }
    };
  }
);
