import { useTranslation } from "next-i18next/pages";

interface PalaceWebCatalogLogoProps {
  className?: string;
}
const PalaceWebCatalogLogo = ({ className }: PalaceWebCatalogLogoProps) => {
  const { t } = useTranslation();
  return (
    <img
      src="/img/logo-palace-web-catalog.png"
      alt={t("alt.palaceWebCatalog", "Palace Web Catalog", {
        ns: "common"
      })}
      className={className}
      height={70}
      width={223}
      sx={{ maxWidth: "100%", height: "auto" }}
    />
  );
};

export default PalaceWebCatalogLogo;
