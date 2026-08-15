import * as React from "react";
import { hasTranslationKey } from "test-utils/mockUseTranslation";

type TransProps = {
  i18nKey: string;
  ns?: string;
  children?: React.ReactNode;
};

export const mockTrans: React.FC<TransProps> = ({ i18nKey, ns, children }) => {
  if (!hasTranslationKey(i18nKey, ns)) {
    throw new Error(
      `<Trans> used i18nKey "${i18nKey}", which is missing from the "${
        ns ?? "translations"
      }" namespace in public/locales. Run "npm run translations:extract".`
    );
  }

  return <>{children}</>;
};
