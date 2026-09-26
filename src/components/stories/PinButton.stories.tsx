import React from "react";
import { StoryFn, Meta } from "@storybook/react";
import { useDialogStore } from "@ariakit/react/dialog";
import PinButton, { PinnableLibrary } from "components/PinButton";
import PublicComputerWarning from "components/PublicComputerWarning";
import UnpinConfirmationDialog from "components/UnpinConfirmationDialog";

export default {
  title: "Components/PinButton",
  component: PinButton
} as Meta;

const library: PinnableLibrary = {
  id: "urn:uuid:example",
  slug: "example",
  title: "Example Public Library"
};

const Template: StoryFn<{ library: PinnableLibrary }> = args => (
  <PinButton {...args} />
);

export const Default = Template.bind({});
Default.args = { library };

const WarningTemplate: StoryFn = () => {
  const dialog = useDialogStore({ defaultOpen: true });
  return (
    <PublicComputerWarning dialog={dialog} onConfirm={() => dialog.hide()} />
  );
};
export const PublicComputerWarningOpen = WarningTemplate.bind({});

const UnpinTemplate: StoryFn = () => {
  const dialog = useDialogStore({ defaultOpen: true });
  return (
    <UnpinConfirmationDialog
      dialog={dialog}
      libraryTitle={library.title}
      onConfirm={() => dialog.hide()}
    />
  );
};
export const UnpinConfirmationOpen = UnpinTemplate.bind({});
