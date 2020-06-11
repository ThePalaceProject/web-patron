import React from "react";
import reader from "utils/reader";
import { useRouter } from "next/router";

const BookPage = () => {
  const router = useRouter();
  const { bookUrl } = router.query;

  /*This can be updated to point to an external manifest.json */
  const bookManifestUrl = `/${bookUrl}/manifest.json`;

  if (typeof window !== "undefined") {
    reader(bookManifestUrl);
  }

  return <div id="viewer" />;
};

export default BookPage;
