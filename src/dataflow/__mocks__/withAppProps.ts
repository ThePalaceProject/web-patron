import { GetStaticProps } from "next";

export default function withAppProps(pageGetStaticProps?: GetStaticProps) {
  return async (ctx: any) => {
    // Call the inner page getStaticProps directly
    return pageGetStaticProps ? pageGetStaticProps(ctx) : { props: {} };
  };
}
