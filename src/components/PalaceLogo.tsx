import * as React from "react";

function PalaceLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 713.68 882"
      aria-label="Palace Logo"
      {...props}
    >
      <polygon
        fill="#3eb9e7"
        points="357.43 451.68 357.43 628.23 597.52 460.11 597.52 283.56 357.43 451.68"
      />
      <polygon
        fill="#2225ae"
        points="597.52 283.56 597.52 283.56 357.43 115.45 357.43 322.24 449.86 386.96 597.52 283.56"
      />
      <polygon
        fill="#fc8442"
        points="117.34 656.89 191.67 622.19 266.01 760.99 266.01 387.66 117.34 283.56 117.34 656.89"
      />
      <polygon
        fill="#fb361d"
        points="117.34 283.56 117.83 283.91 266.01 387.66 357.43 322.24 357.43 115.45 117.34 283.56"
      />
    </svg>
  );
}

export default PalaceLogo;
