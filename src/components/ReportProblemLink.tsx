import * as React from "react";

export interface ReportProblemLinkProps {
  reportUrl: string;
}

export default class ReportProblemLink extends React.Component<ReportProblemLinkProps, any> {
  render() {
    return (
      <a href="javascript:void(0);" onClick={this.report}>Report a Problem</a>
    );
  }

  report() {
  }
}