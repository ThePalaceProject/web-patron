import { NextPage, GetStaticProps, GetStaticPaths } from "next";
import withAppProps, { AppProps } from "dataflow/withAppProps";
import ReaderPageLayout from "components/reader/ReaderPageLayout";
import ExternalReader from "components/reader/ExternalReader";

const ExternalReaderPage: NextPage<AppProps> = props => {
  return (
    <ReaderPageLayout {...props}>
      {({ loading, setLoading, readUrl }) => (
        <ExternalReader
          loading={loading}
          setLoading={setLoading}
          readUrl={readUrl}
        />
      )}
    </ReaderPageLayout>
  );
};

export const getStaticProps: GetStaticProps = withAppProps();

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [],
  fallback: true
});

export default ExternalReaderPage;
