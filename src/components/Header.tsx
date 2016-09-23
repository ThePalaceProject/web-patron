import * as React from "react";
import CatalogLink from "opds-web-client/lib/components/CatalogLink";
import { HeaderProps } from "opds-web-client/lib/components/Root";
import { Navbar, Nav, NavItem } from "react-bootstrap";
import { NavigateContext } from "opds-web-client/lib/interfaces";

export interface HeaderContext extends NavigateContext {
  homeUrl: string;
  catalogBase: string;
  catalogName: string;
}

export default class Header extends React.Component<HeaderProps, any> {
  context: HeaderContext;

  static contextTypes = {
    homeUrl: React.PropTypes.string.isRequired,
    catalogBase: React.PropTypes.string.isRequired,
    catalogName: React.PropTypes.string.isRequired,
    router: React.PropTypes.object.isRequired,
    pathFor: React.PropTypes.func.isRequired
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
            <li>
              <CatalogLink
                collectionUrl={this.context.homeUrl}
                bookUrl={null}>
                Catalog
              </CatalogLink>
            </li>
            { this.props.loansUrl &&
              <li>
                <CatalogLink
                  collectionUrl={this.props.loansUrl}
                  bookUrl={null}>
                  Loans
                </CatalogLink>
              </li>
            }
            <li>
              { this.props.isSignedIn ?
                <a onClick={this.signOut}>Sign Out</a> :
                <a onClick={this.signIn}>Sign In</a>
              }
            </li>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }

  signIn() {
    this.props.showBasicAuthForm(() => {}, { login: "Barcode", password: "PIN" }, "Library");
  }

  signOut() {
    this.props.clearBasicAuthCredentials();
    this.context.router.push(this.context.pathFor(this.context.homeUrl, null));
  }
}