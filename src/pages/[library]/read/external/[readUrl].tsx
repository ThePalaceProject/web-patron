import { NextPage, GetStaticPaths, GetStaticProps } from "next";
import { AppProps } from "dataflow/withAppProps";
import ReaderPageLayout from "components/reader/ReaderPageLayout";
import ExternalReader from "components/reader/ExternalReader";
import { getExternalReaderProps } from "components/reader/externalReaderProps";

interface PageProps extends AppProps {
  readUrl: string;
}

const ExternalReaderPage: NextPage<PageProps> = props => {
  return (
    <ReaderPageLayout {...props}>
      {({ loading, setLoading }) => (
        <ExternalReader
          loading={loading}
          setLoading={setLoading}
          readUrl={props.readUrl}
        />
      )}
    </ReaderPageLayout>
  );
};

export const getStaticProps: GetStaticProps = getExternalReaderProps;

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [],
  fallback: "blocking"
});

export default ExternalReaderPage;
