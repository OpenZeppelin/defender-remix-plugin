import type { DefenderDeployMessage } from "./models/contract";
import { globalState } from "./state.svelte";

export const initWizardPlugin = () => {
  // when users configure a contract, the plugin gets the results.
  listenToContracts();
}

function listenToContracts() {
  window.addEventListener('message', function (e: MessageEvent<DefenderDeployMessage>) {
    if (e.data.kind === 'oz-wizard-defender-deploy') {
      globalState.contract = e.data.contract;
    }
  });
}
