import * as React from "react";
import CatalogLink from "opds-web-client/lib/components/CatalogLink";
import { HeaderProps } from "opds-web-client/lib/components/Root";
import { Navbar, Nav, NavItem } from "react-bootstrap";
import { NavigateContext } from "opds-web-client/lib/interfaces";
import { HeaderLink } from "../Config";

export interface HeaderContext extends NavigateContext {
  homeUrl: string;
  catalogBase: string;
  catalogName: string;
  headerLinks: HeaderLink[];
}

export default class Header extends React.Component<HeaderProps, any> {
  context: HeaderContext;

  static contextTypes = {
    homeUrl: React.PropTypes.string.isRequired,
    catalogBase: React.PropTypes.string.isRequired,
    catalogName: React.PropTypes.string.isRequired,
    router: React.PropTypes.object.isRequired,
    pathFor: React.PropTypes.func.isRequired,
    headerLinks: React.PropTypes.array.isRequired
  };

  constructor(props) {
    super(props);
    this.signIn = this.signIn.bind(this);
    this.signOut = this.signOut.bind(this);
  }

  render(): JSX.Element {
    let search = this.props.children ? (React.Children.only(this.props.children) as any) : null;

    return (
      <Navbar fluid={true} fixedTop={true}>
        <Navbar.Header>
          <Navbar.Brand>
            {this.context.catalogName}
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>

        <Navbar.Collapse>
          { search &&
            <Nav pullRight>
              { React.cloneElement(search, { className: "navbar-form navbar-right" }) }
            </Nav>
          }

          <Nav>
            { this.context.headerLinks && this.context.headerLinks.map(link =>
              <li>
                <a href={link.url} title={link.title}>{link.title}</a>
              </li>
            ) }
            <li>
              <CatalogLink
                collectionUrl={this.context.homeUrl}
                bookUrl={null}>
                Catalog
              </CatalogLink>
            </li>
            { this.props.loansUrl && this.props.isSignedIn &&
              <li>
                <CatalogLink
                  collectionUrl={this.props.loansUrl}
                  bookUrl={null}>
                  My Books
                </CatalogLink>
              </li>
            }
            { this.props.loansUrl && this.props.isSignedIn &&
              <li>
                <a href="#" onClick={this.signOut}>Sign Out</a>
              </li>
            }
            { this.props.loansUrl && !this.props.isSignedIn &&
              <li>
                <a href="#" onClick={this.signIn}>Sign In</a>
              </li>
            }
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }

  signIn() {
    if (this.props.fetchLoans && this.props.loansUrl) {
      this.props.fetchLoans(this.props.loansUrl);
    }
  }

  signOut() {
    this.props.clearAuthCredentials();
    this.context.router.push(this.context.pathFor(this.context.homeUrl, null));
  }
}