import * as React from "react";

type Props = { gtmId: string | null | undefined };

// GTM container IDs are always in the form GTM-XXXXXXXX (uppercase alphanumeric).
const GTM_ID_RE = /^GTM-[A-Z0-9]+$/;

export const GTMScript: React.FC<Props> = ({ gtmId }) => {
  if (!gtmId) return null;
  if (!GTM_ID_RE.test(gtmId)) {
    console.error(
      `GTM_ID "${gtmId}" is not a valid GTM container ID (expected GTM-XXXXXXXX). ` +
        "GTM will not be loaded."
    );
    return null;
  }
  return (
    <script
      dangerouslySetInnerHTML={{
        __html:
          `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':` +
          `new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],` +
          `j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=` +
          `'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);` +
          `})(window,document,'script','dataLayer','${gtmId}');`
      }}
    />
  );
};

export const GTMNoscript: React.FC<Props> = ({ gtmId }) => {
  if (!gtmId || !GTM_ID_RE.test(gtmId)) return null;
  return (
    <noscript
      dangerouslySetInnerHTML={{
        __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`
      }}
    />
  );
};
