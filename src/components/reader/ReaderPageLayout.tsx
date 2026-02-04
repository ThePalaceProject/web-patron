import LayoutPage from "components/LayoutPage";
import ReaderWrapper from "./ReaderWrapper";
import { AppProps } from "dataflow/withAppProps";

interface ReaderPageLayoutProps extends AppProps {
  children: (args: {
    loading: boolean;
    setLoading: (value: boolean) => void;
    readUrl?: string;
  }) => React.ReactNode;
}

export default function ReaderPageLayout({
  library,
  error,
  children
}: ReaderPageLayoutProps) {
  return (
    <LayoutPage library={library} error={error}>
      <ReaderWrapper>{children}</ReaderWrapper>
    </LayoutPage>
  );
}
