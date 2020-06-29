import React from "react";
import reader from "utils/reader";
import { useRouter } from "next/router";

const BookPage = () => {
  const router = useRouter();
  const { bookUrl } = router.query;
  const bookManifestUrl = `${bookUrl}OEBPS/package.opf`;

  if (typeof window !== "undefined") {
    reader(bookManifestUrl);
  }

  return (
    <>
      <div id="viewer" /> {/* <style global jsx>{`
        
      `}</style> */}
    </>
  );
};

export default BookPage;
