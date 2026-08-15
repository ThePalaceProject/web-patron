import * as React from "react";
import Modal from "../Modal";
import useComplaints from "../../hooks/useComplaints";
import { DialogDisclosure } from "@ariakit/react/dialog";
import { TextArea } from "../TextInput";
import { useForm } from "react-hook-form";
import Button from "../Button";
import { AnyBook, ComplaintData } from "../../interfaces";
import LoadingIndicator from "../LoadingIndicator";
import Select, { Label } from "../Select";
import { H1 } from "components/Text";
import { getReportUrl } from "utils/libraryLinks";
import { styleProps } from "../Button/styles";
import { useTranslation } from "next-i18next/pages";

const getDisplayType = (type: string) =>
  type
    .replace("http://librarysimplified.org/terms/problem/", "")
    .replace(/-/g, " ")
    .split(" ")
    .map(t => (t ? t[0].toUpperCase() + t.slice(1) : ""))
    .join(" ");

type ComplaintFormData = Required<ComplaintData>;

const ReportProblem: React.FC<{ book: AnyBook }> = ({ book }) => {
  const { t } = useTranslation();
  const { state, dialog, dispatch, postComplaint } = useComplaints(book);

  const hasReportUrl = Boolean(getReportUrl(book.raw));
  const handleClick = () => dispatch({ type: "REPORT_PROBLEM" });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ComplaintFormData>();
  const cancel = () => {
    reset();
    dialog.hide();
  };

  const onSubmit = handleSubmit(({ type, detail }) => {
    postComplaint({ type, detail });
  });

  if (!hasReportUrl) {
    return null;
  }

  return (
    <React.Fragment>
      <Modal
        dialog={dialog}
        label={t("reportProblem.reportProblem", "Report a problem")}
        hide={cancel}
        sx={{ maxWidth: "600px" }}
      >
        {state.success ? (
          <div sx={{ display: "flex", flexDirection: "column" }}>
            <H1 sx={{ fontSize: 3, textAlign: "center" }}>
              {t(
                "reportProblem.problemWasReportedConfirmation",
                "Your problem was reported. Thank you!"
              )}
            </H1>
            <Button sx={{ alignSelf: "flex-end" }} onClick={cancel}>
              {t("reportProblem.done", "Done")}
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
            <H1 sx={{ alignSelf: "center", fontSize: [3, 4] }}>
              {t("reportProblem.reportProblem", "Report a problem")}
            </H1>
            <Label htmlFor="complaint-type">
              {t("reportProblem.complainType", "Complaint Type")}
            </Label>
            <Select
              id="complaint-type"
              {...register("type", {
                required: t("reportProblem.chooseType", "Please choose a type")
              })}
              aria-describedby="complaint-type-error"
            >
              {state.types.map(type => (
                <option key={type} value={type}>
                  {getDisplayType(type)}
                </option>
              ))}
            </Select>
            {errors.type && (
              <span
                id="complaint-type-error"
                sx={{ color: "ui.error", fontStyle: "italic" }}
              >
                {t("reportProblem.errorMessage", "Error: {{message}}", {
                  message: errors.type.message
                })}
              </span>
            )}
            <label htmlFor="complaint-body">
              {t("reportProblem.details", "Details")}
            </label>
            <TextArea
              id="complaint-body"
              {...register("detail", {
                required: t(
                  "reportProblem.enterDetails",
                  "Please enter details about the problem."
                )
              })}
              sx={{ alignSelf: "stretch", maxWidth: "100%" }}
              aria-describedby="complaint-body-error"
            />
            {errors.detail && (
              <span
                id="complaint-body-error"
                sx={{ color: "ui.error", fontStyle: "italic" }}
              >
                {t("reportProblem.errorMessage", "Error: {{message}}", {
                  message: errors.detail.message
                })}
              </span>
            )}
            <div sx={{ mt: 3, "&>button": { ml: 2 }, alignSelf: "flex-end" }}>
              <Button variant="ghost" onClick={cancel}>
                {t("actions.cancel", "Cancel", { ns: "common" })}
              </Button>
              <Button type="submit">
                {t("reportProblem.submit", "Submit")}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <DialogDisclosure
        store={dialog}
        onClick={handleClick}
        data-testid="report-problem-link"
        sx={{
          alignSelf: "flex-start",
          my: 2,
          ...styleProps("ui.black", "md", "filled")
        }}
      >
        {t("reportProblem.reportProblem", "Report a problem")}
      </DialogDisclosure>
    </React.Fragment>
  );
};

export default ReportProblem;
