import * as React from "react";
import Stack from "components/Stack";
import { Text } from "components/Text";

type FulfillmentStackErrorCtx = { setError: (msg: string | null) => void };
const NOOP: FulfillmentStackErrorCtx = { setError: () => undefined };
const Ctx = React.createContext<FulfillmentStackErrorCtx>(NOOP);

export const useFulfillmentStackError = () => React.useContext(Ctx);

const FulfillmentStack: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className, children }) => {
  const [error, setError] = React.useState<string | null>(null);
  return (
    <Ctx.Provider value={{ setError }}>
      <Stack
        direction="column"
        sx={{ alignItems: "flex-start" }}
        className={className}
      >
        <Stack>{children}</Stack>
        {error && <Text sx={{ color: "ui.error" }}>{error}</Text>}
      </Stack>
    </Ctx.Provider>
  );
};

export default FulfillmentStack;
