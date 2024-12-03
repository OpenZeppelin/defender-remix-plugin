
import type { Contract } from "./models/contract";

export const wizardState = $state<{ contract: Contract | undefined }>({
  contract: undefined,
});
