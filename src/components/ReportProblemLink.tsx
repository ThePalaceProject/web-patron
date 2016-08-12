import * as React from "react";
import ReportProblemForm from "./ReportProblemForm";

export interface ReportProblemLinkProps extends React.HTMLProps<any> {
  reportUrl: string;
  report: (url: string) => Promise<any>;
  fetchTypes: (url: string) => Promise<string[]>;
  types: string[];
}

export default class ReportProblemLink extends React.Component<ReportProblemLinkProps, any> {
  constructor(props) {
    super(props);
    this.state = { showForm: false };
    this.openForm = this.openForm.bind(this);
    this.closeForm = this.closeForm.bind(this);
  }

  render() {
    let props = Object.assign({}, this.props);
    delete props["reportUrl"];

    return (
      <div>
        <a href="javascript:void(0);" {...props} onClick={this.openForm}>Report a Problem</a>
        { this.state.showForm &&
          <ReportProblemForm
            reportUrl={this.props.reportUrl}
            report={this.props.report}
            fetchTypes={this.props.fetchTypes}
            close={this.closeForm}
            types={this.props.types}
            />
        }
      </div>
    );
  }

  openForm() {
    this.setState({ showForm: true });
  }

  closeForm() {
    this.setState({ showForm: false });
  }
}