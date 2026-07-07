import { GetServerSideProps, GetStaticProps } from "next";

export default function withAppProps(pageGetStaticProps?: GetStaticProps) {
  return async (ctx: any) => {
    // Call the inner page getStaticProps directly
    return pageGetStaticProps ? pageGetStaticProps(ctx) : { props: {} };
  };
}

export function withAppPropsSSR(pageGetServerSideProps?: GetServerSideProps) {
  return async (ctx: any) => {
    // Call the inner page getServerSideProps directly
    return pageGetServerSideProps ? pageGetServerSideProps(ctx) : { props: {} };
  };
}
