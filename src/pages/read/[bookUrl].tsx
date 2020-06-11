import React from "react";
import reader from "utils/reader";
import { useRouter } from "next/router";

const BookPage = () => {
  const router = useRouter();
  const { bookUrl } = router.query;
  const bookManifestUrl = `/${bookUrl}/manifest.json`;

  if (typeof window !== "undefined") {
    reader(bookManifestUrl);
  }

  return <div id="viewer" />;
};

export default BookPage;
