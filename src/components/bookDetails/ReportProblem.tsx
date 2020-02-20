/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import * as React from "react";
import Modal from "../Modal";
import useComplaints from "../../hooks/useComplaints";
import { DialogDisclosure } from "reakit";
import { BookData } from "opds-web-client/lib/interfaces";
import { TextArea } from "../TextInput";
import { useForm } from "react-hook-form";
import Button from "../Button";
import { ComplaintData } from "../../interfaces";
import LoadingIndicator from "../LoadingIndicator";

const getDisplayType = (type: string) =>
  type
    .replace("http://librarysimplified.org/terms/problem/", "")
    .replace(/-/g, " ")
    .split(" ")
    .map(t => t[0].toUpperCase() + t.slice(1))
    .join(" ");

type ComplaintFormData = Required<ComplaintData>;

const ReportProblem: React.FC<{ book: BookData }> = ({ book }) => {
  const { state, dialog, dispatch, postComplaint } = useComplaints(book);
  const handleClick = () => dispatch({ type: "REPORT_PROBLEM" });

  const { register, handleSubmit, errors, reset } = useForm<
    ComplaintFormData
  >();
  const cancel = () => {
    reset();
    dispatch({ type: "REPORT_PROBLEM_CANCEL" });
  };

  const onSubmit = handleSubmit(async ({ type, detail }) => {
    postComplaint({ type, detail });
  });

  return (
    <React.Fragment>
      <Modal
        isVisible={state.showForm}
        dialog={dialog}
        label="Report a problem"
        hide={cancel}
        sx={{ width: "100%", maxWidth: 600 }}
      >
        {state.success ? (
          <div sx={{ display: "flex", flexDirection: "column" }}>
            <Styled.h1 sx={{ fontSize: 3, textAlign: "center" }}>
              Your problem was reported. Thank you!
            </Styled.h1>
            <Button sx={{ alignSelf: "flex-end" }} onClick={cancel}>
              Done
            </Button>
          </div>
        ) : state.isPosting ? (
          <div sx={{ display: "flex", justifyContent: "center" }}>
            <LoadingIndicator />
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              "&>label": {
                mt: 2,
                mb: 1
              }
            }}
          >
            <Styled.h1 sx={{ alignSelf: "center", fontSize: [3, 4] }}>
              Report a problem
            </Styled.h1>
            <label htmlFor="complaint-type">Complaint Type</label>
            <select
              id="complaint-type"
              name="type"
              ref={register({ required: "Please choose a type" })}
            >
              {state.types.map(type => (
                <option key={type} value={type}>
                  {getDisplayType(type)}
                </option>
              ))}
            </select>
            {errors.type && (
              <span sx={{ color: "warn", fontStyle: "italic" }}>
                {errors.type.message}
              </span>
            )}
            <label htmlFor="complaint-body">Details</label>
            <TextArea
              id="complaint-body"
              name="detail"
              ref={register({
                required: "Please enter details about the problem."
              })}
              sx={{ alignSelf: "stretch", maxWidth: "100%" }}
            />
            {errors.detail && (
              <span sx={{ color: "warn", fontStyle: "italic" }}>
                {errors.detail.message}
              </span>
            )}
            <div sx={{ mt: 3, "&>button": { ml: 2 }, alignSelf: "flex-end" }}>
              <Button variant="flat" onClick={cancel}>
                Cancel
              </Button>
              <Button type="submit">Submit</Button>
            </div>
          </form>
        )}
      </Modal>
      <DialogDisclosure
        {...dialog}
        onClick={handleClick}
        as={Styled.a}
        sx={{ fontStyle: "italic", mt: 2, display: "inline-block" }}
      >
        Report a problem
      </DialogDisclosure>
    </React.Fragment>
  );
};

export default ReportProblem;
