import type { ApprovalProcess } from "$lib/models/approval-process";
import type { GlobalState } from "$lib/models/ui";
import { isDeploymentEnvironment, isSameNetwork } from "$lib/utils/helpers";

/**
 * Global application state
 * 
 * For simplicity, we just have a single global state to make the app reactive everywhere
 * if gets complex, we can split this into multiple states, or even stores.
 */
export const globalState = $state<GlobalState>({
  // indicates if user is authenticated.
  authenticated: false,

  // indicates if there was some network error.
  error: undefined,

  // Indicates if there is some success message.
  successMessage: undefined,

  // User credentials.
  credentials: {
    apiKey: '',
    apiSecret: '',
  },

  // API Key capabilites.
  permissions: [],

  // Networks supported by Defender + tenant networks.
  networks: [],

  // Approval processes corresponding to current user
  approvalProcesses: [],

  // Relayers list for approval process creation
  relayers: [],

  contract: {
    // path of the contract
    target: undefined,

    // compilation file sources.
    source: undefined,

    // solidity version
    version: undefined,

    // compilation result
    data: undefined,
  },

  // Current deployment form state.
  form: {
    // Network selected to deploy
    network: undefined,

    // User selected approval process
    approvalProcessSelected: undefined,

    // Approval process to be created and used for deployment.
    approvalProcessToCreate: undefined,

    // Indicates if user is using existing approval process, creating one or injected provider
    approvalType: 'existing',

    // Indicates if deployment is completed.
    completed: false,
  },
});

export const clearErrorBanner = () => {
  globalState.error = undefined;
};

export const setErrorBanner = (error?: string) => {
  globalState.error = error;
};

export const addAPToDropdown = (approvalProcess: ApprovalProcess) => {
  globalState.approvalProcesses.push(approvalProcess);
}

export function setDeploymentCompleted(completed: boolean) {
  globalState.form.completed = completed;
}

export function findDeploymentEnvironment(via?: string, network?: string) {
  if (!via || !network) return undefined;
  return globalState.approvalProcesses.find((ap) => 
    ap.network &&
    isDeploymentEnvironment(ap) &&
    isSameNetwork(ap.network, network) &&
    ap.via?.toLocaleLowerCase() === via.toLocaleLowerCase()
  );
}