import React from "react";
import reader from "utils/reader";

const BookPage = () => {
  if (typeof window !== "undefined") {
    reader();
  }

  return <div id="viewer" />;
};

export default BookPage;
