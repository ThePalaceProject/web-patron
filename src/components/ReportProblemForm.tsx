import * as React from "react";
import { popupStyle } from "opds-web-client/lib/components/styles";

export interface  ReportProblemFormProps {
  reportUrl: string;
  report: (url: string) => Promise<any>;
  fetchTypes: (url: string) => Promise<string[]>;
  close: () => void;
}

export default class ReportProblemForm extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      types: [],
      submitted: false,
      error: null
    };
    this.submit = this.submit.bind(this);
  }

  render() {
    let title = this.state.submitted ? "Problem Reported" : "Report a Problem";

    return (
      <div style={popupStyle(400)}>
        <h3 style={{ marginTop: "0px" }}>{title}</h3>

        { this.state.error &&
          <div style={{ color: "red", marginTop: "1em" }}>{this.state.error}</div>
        }

        { !this.state.submitted && this.state.types.length > 0 &&
          <div style={{ textAlign: "center", marginTop: "1em" }}>
            <select
              className="form-control"
              style={{ width: "200px" }}
              ref="type">
              <option value="">choose a type</option>
              { this.state.types.map(type =>
                <option key={type} value={type}>{this.displayType(type)}</option>
              ) }
            </select>
            <br />
            <textarea
              className="form-control"
              placeholder="details"
              ref="detail">
            </textarea>
            <br />
            <button className="btn btn-default" onClick={this.submit}>Submit</button>
            &nbsp;
            <button className="btn btn-default" onClick={this.props.close}>Cancel</button>
          </div>
        }

        { this.state.submitted &&
          <div style={{ marginTop: "1em" }}>
            <button className="btn btn-default" onClick={this.props.close}>Close</button>
          </div>
        }
      </div>
    );
  }

  componentWillMount() {
    this.props.fetchTypes(this.props.reportUrl).then(types => {
      this.setState({ types });
    });
  }

  displayType(type) {
    return type.replace("http://librarysimplified.org/terms/problem/", "");
  }

  submit() {
    if (this.typeSelected()) {
      let data = {
        type: (this.refs as any).type.value,
        detail: (this.refs as any).detail.value
      };
      this.props.report(this.props.reportUrl, data).then(() => {
        this.setState({ submitted: true, error: null });
      }).catch(err => {
        this.setState({ error: "There was an error posting this problem." });
      });
    } else {
      this.setState({ error: "You must select a type" });
    }
  }

  typeSelected() {
    return !!(this.refs as any).type.value;
  }
}