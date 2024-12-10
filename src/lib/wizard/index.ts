import type { ContractSources } from "../models/solc";
import { globalState } from "$lib/state/state.svelte";

export interface DefenderDeployMessage {
  kind: 'oz-wizard-defender-deploy';
  sources: ContractSources;
}

export const initWizardPlugin = () => {
  // when users configure a contract, the plugin gets the results.
  listenToContracts();
}

function listenToContracts() {
  window.addEventListener('message', function (e: MessageEvent<DefenderDeployMessage>) {
    if (e.data.kind === 'oz-wizard-defender-deploy') {
      globalState.contract = {
        source: {
          sources: e.data.sources,
        },
        target: getMainContractName(e.data.sources) 
      };
    }
  });
}

function getMainContractName(sources?: ContractSources) {
  if (!sources) return '';
  // The first name that is not a dependency
  return Object.keys(sources).find(name => !name.startsWith('@'));
}
