import React, { useEffect } from "react";
import { useRouter } from "next/router";

const BookPage = () => {
  const router = useRouter();
  const { bookUrl } = router.query;
  useEffect(() => {
    router.push(`/viewer/${bookUrl}/index.html`);
  }, [bookUrl, router]);
  return null;
};

export default BookPage;
