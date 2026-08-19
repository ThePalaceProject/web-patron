import ErrorComponent from "../components/Error";
import { GetStaticProps } from "next";
import { getTranslationProps } from "dataflow/translationProps";
import { useTranslation } from "next-i18next/pages";

function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <ErrorComponent
      info={{
        status: 404,
        title: t("404.title", "Page Not Found"),
        detail: t("404.detail", "The requested url is not available.")
      }}
    />
  );
}

export const getStaticProps: GetStaticProps = async ctx => {
  return {
    props: {
      ...(await getTranslationProps(ctx.locale))
    }
  };
};

export default NotFoundPage;
