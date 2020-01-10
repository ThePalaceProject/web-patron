/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import * as React from "react";
import { FooterProps } from "opds-web-client/lib/components/Root";
import { LinkData } from "opds-web-client/lib/interfaces";
import ExternalLink from "./ExternalLink";
import useTypedSelector from "../hooks/useTypedSelector";

const labelMap = {
  about: "About",
  "terms-of-service": "Terms of Service",
  "privacy-policy": "Privacy Policy",
  copyright: "Copyright"
};

const Footer: React.FC<{ className?: string }> = ({ className }) => {
  // const links = useTypedSelector(state => state?.collection?.links);
  return (
    <footer
      sx={{ backgroundColor: "blues.dark", color: "white" }}
      className={className}
    >
      <div
        sx={{ display: "flex", alignItems: "flex-start", letterSpacing: 0.9 }}
      >
        <div sx={{ m: 4 }}>
          <Styled.h5 sx={{ m: 0 }}>Library Name</Styled.h5>
          <FooterExternalLink>Library url</FooterExternalLink>
        </div>
        <div sx={{ m: 4 }}>
          <Styled.h5 sx={{ m: 0 }}>Patron Support</Styled.h5>
          <FooterExternalLink>Email</FooterExternalLink>
          <FooterExternalLink>Link</FooterExternalLink>
        </div>
      </div>
      <div sx={{ mx: 4, my: 2, fontSize: 0 }}>
        <span sx={{ mr: 2 }}>Copyright</span>
        <FooterExternalLink>Privacy</FooterExternalLink>
      </div>
    </footer>
  );
};

const FooterExternalLink: React.FC<React.HTMLProps<HTMLAnchorElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <ExternalLink
      sx={{ color: "blues.medium", textDecoration: "none" }}
      className={className}
      {...props}
    >
      {children}
    </ExternalLink>
  );
};

export default Footer;

// export default class Footer extends React.Component<FooterProps, {}> {
//   constructor(props) {
//     super(props);
//     this.links = this.links.bind(this);
//   }

//   links(): LinkData[] {
//     const links = [];

// const labels = {
//   about: "About",
//   "terms-of-service": "Terms of Service",
//   "privacy-policy": "Privacy Policy",
//   copyright: "Copyright"
// };

//     Object.keys(labels).forEach(type => {
//       const link = this.props.collection.links.find(link => link.type === type);
//       if (link) {
//         const linkWithLabel = Object.assign({}, link, { text: labels[type] });
//         links.push(linkWithLabel);
//       }
//     });
//     return links;
//   }

//   render(): JSX.Element {
//     return (
//       <ul aria-label="about links" className="list-inline">
//         {this.links().map(link => (
//           <li key={link.url}>
//             <a href={link.url} target="_blank" rel="noopener noreferrer">
//               {link.text}
//             </a>
//           </li>
//         ))}
//       </ul>
//     );
//   }
// }
