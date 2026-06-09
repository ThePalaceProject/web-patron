import * as React from "react";

// const SvgBook = (props: React.SVGProps<SVGSVGElement>) => (
//   <svg
//     width="1em"
//     height="1em"
//     viewBox="0 0 24 24"
//     fill="currentColor"
//     {...props}
//   >
//     <path fill="none" d="M0 0h24v24H0V0z" />
//     <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" />
//   </svg>
// );

const SvgBook = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="1rem"
    height="1rem"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 640 640"
    fill="currentColor"
    {...props}
  >
    <path d="M96 128C96 92.7 124.7 64 160 64L480 64C515.3 64 544 92.7 544 128L544 512C544 547.3 515.3 576 480 576L160 576C124.7 576 96 547.3 96 512L96 128zM256 504C256 517.3 266.7 528 280 528L360 528C373.3 528 384 517.3 384 504C384 490.7 373.3 480 360 480L280 480C266.7 480 256 490.7 256 504zM480 128L160 128L160 432L480 432L480 128z" />
  </svg>
);

export default SvgBook;
