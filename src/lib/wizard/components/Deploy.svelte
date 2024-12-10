<script lang="ts">
  import { API } from "$lib/api";
  import { deployContract, switchToNetwork } from "$lib/ethereum";
  import type { ApprovalProcess, CreateApprovalProcessRequest } from "$lib/models/approval-process";
  import type { Artifact, DeployContractRequest, DeploymentResult, UpdateDeploymentRequest } from "$lib/models/deploy";
  import { getNetworkLiteral, isProductionNetwork } from "$lib/models/network";
  import { buildCompilerInput, type ContractSources } from "$lib/models/solc";
  import type { APIResponse } from "$lib/models/ui";
  import { addAPToDropdown, findDeploymentEnvironment, globalState } from "$lib/state/state.svelte";
  import { attempt } from "$lib/utils/attempt";
  import { encodeConstructorArgs, getConstructorInputsWizard, getContractBytecode } from "$lib/utils/contracts";
  import { isMultisig, isUpgradeable } from "$lib/utils/helpers";
  import Button from "./shared/Button.svelte";
  import Input from "./shared/Input.svelte";
  import Message from "./shared/Message.svelte";

  let inputsWithValue = $state<Record<string, string | number | boolean>>({});
  let busy = $state(false);
  let successMessage = $state<string>("");
  let errorMessage = $state<string>("");
  let compilationError = $state<string>("");
  let compilationResult = $state<{ output: Artifact['output'] }>();
  let deploymentId = $state<string | undefined>(undefined);
  let deploymentResult = $state<DeploymentResult | undefined>(undefined);
  let isDeterministic = $state(false);
  let salt: string = $state("");

  let contractBytecode = $derived.by(() => {
    if (!globalState.contract?.target || !compilationResult) return;

    const name = globalState.contract.target;
    const sources = compilationResult.output.contracts;

    return getContractBytecode(name, name, sources);
  });

  let deploymentArtifact = $derived.by(() => {
    if (!compilationResult || !globalState.contract?.target || !globalState.contract.source?.sources) return;
   
    return {
      input: buildCompilerInput(globalState.contract.source?.sources as ContractSources),
      output: compilationResult.output
    }
  });

  let inputs = $derived.by(() => {
    if (!compilationResult) return [];
    return getConstructorInputsWizard(globalState.contract?.target, compilationResult.output.contracts);
  });

  let displayUpgradeableWarning = $derived.by(() => {
    return isUpgradeable(globalState.contract?.source?.sources as ContractSources);
  });

  let enforceDeterministic = $derived.by(() => {
    const selectedMultisig = globalState.form.approvalType === 'existing' && isMultisig(globalState.form.approvalProcessSelected?.viaType);
    const toCreateMultisig = globalState.form.approvalType === 'new' && isMultisig(globalState.form.approvalProcessToCreate?.viaType);
    return selectedMultisig || toCreateMultisig;
  });

  const deploymentUrl = $derived(
    deploymentId && globalState.form.network
      ? `https://defender.openzeppelin.com/#/deploy/environment/${
        isProductionNetwork(globalState.form.network) ? 'production' : 'test'
      }?deploymentId=${deploymentId}`
    : undefined
  );

  $effect(() => {
    if (globalState.contract?.source?.sources) {
      compile();
    }
  });

  function handleInputChange(event: Event) {
    const target = event.target as HTMLInputElement;
    inputsWithValue[target.name] = target.value;
  }

  async function compile() {
    const sources = globalState.contract?.source?.sources;
    if (!sources) {
      return;
    }

    const [res, error] = await attempt(async () => API.compile(buildCompilerInput(
      globalState.contract!.source!.sources as ContractSources
    )));

    if (error) {
      compilationError = `Compilation failed: ${error.msg}`;
      return;
    }
    compilationResult = res.data;
  }

  function displayMessage(message: string, type: "success" | "error") {
    successMessage = "";
    errorMessage = "";
    if (type === "success") {
      successMessage = message;
    } else {
      errorMessage = message;
    }
  }

  function handleSaltChanged(event: Event) {
    const target = event.target as HTMLInputElement;
    salt = target.value;
  }

  export async function handleInjectedProviderDeployment(bytecode: string) {
    // Switch network if needed
    const [, networkError] = await attempt(async () => switchToNetwork(globalState.form.network!));
    if (networkError) {
      throw new Error(`Error switching network: ${networkError.msg}`);
    }

    const [result, error] = await attempt(async () => deployContract(bytecode));
    if (error) {
      throw new Error(`Error deploying contract: ${error.msg}`);
    }

    if (!result) {
      throw new Error("Deployment result not found");
    }

    displayMessage(`Contract deployed successfully, hash: ${result?.hash}`, "success");
    
    return {
      address: result.address,
      hash: result.hash,
      sender: result.sender
    };
  }

  async function getOrCreateApprovalProcess(): Promise<ApprovalProcess | undefined> {
    const ap = globalState.form.approvalProcessToCreate;
    if (!ap || !ap.via || !ap.viaType) {
      displayMessage("Must select an approval process to create", "error");
      return;
    }

    if (!globalState.form.network) {
      displayMessage("Must select a network", "error");
      return;
    }

    const existing = findDeploymentEnvironment(ap.via, ap.network);
    if (existing) {
      return existing;
    }

    const apRequest: CreateApprovalProcessRequest = {
      name: `Deploy From Remix - ${ap.viaType}`,
      via: ap.via,
      viaType: ap.viaType,
      network: getNetworkLiteral(globalState.form.network),
      relayerId: ap.relayerId,
      component: ["deploy"],
    };
    const result: APIResponse<{ approvalProcess: ApprovalProcess }> =
      await API.createApprovalProcess(apRequest);

    if (!result.success) {
      displayMessage(`Approval process creation failed, error: ${JSON.stringify(result.error)}`, "error");
      return;
    }

    displayMessage("Deployment Environment successfully created", "success");
    if (!result.data) return;

    addAPToDropdown(result.data.approvalProcess)
    return result.data.approvalProcess;
  }

  export async function createDefenderDeployment(request: DeployContractRequest) {
    const result: APIResponse<{ deployment: { deploymentId: string } }> =
      await API.createDeployment(request);

    if (!result.success || !result.data) {
      throw new Error(`Contract deployment creation failed: ${JSON.stringify(result.error)}`);
    }

    return result.data.deployment.deploymentId;
  }

  export async function updateDeploymentStatus(
    deploymentId: string,
    address: string,
    hash: string
  ) {
    const updateRequest: UpdateDeploymentRequest = {
      deploymentId,
      hash,
      address,
    };
    
    const result = await API.updateDeployment(updateRequest);
    if (!result.success) {
      throw new Error(`Failed to update deployment status: ${JSON.stringify(result.error)}`);
    }
  }

  async function deploy() {
    if (!globalState.form.network) {
      displayMessage("No network selected", "error");
      return;
    }

    if (!globalState.contract?.target || !globalState.contract.source?.sources) {
      displayMessage("No contract selected", "error");
      return;
    }

    if (!deploymentArtifact || !contractBytecode) {
      displayMessage("No artifact found", "error");
      return;
    }

    if ((isDeterministic || enforceDeterministic) && !salt) {
      displayMessage("Salt is required", "error");
      return;
    }

    errorMessage = "";
    successMessage = "";

    const [constructorBytecode, constructorError] = await encodeConstructorArgs(inputs, inputsWithValue);
    if (constructorError) {
      displayMessage(`Error encoding constructor arguments: ${constructorError.msg}`, "error");
      return;
    }

    // contract deployment requires contract bytecode
    // and constructor bytecode to be concatenated.
    const bytecode = contractBytecode + constructorBytecode?.slice(2);

    const shouldUseInjectedProvider = globalState.form.approvalType === "injected";
    if (shouldUseInjectedProvider) {
      const [result, error] = await attempt(async () =>
        handleInjectedProviderDeployment(bytecode),
      );
      if (error) {
        displayMessage(`Error deploying contract: ${error.msg}`, "error");
        return;
      }

      deploymentResult = result;

      // loads global state with EOA approval process to create
      globalState.form.approvalProcessToCreate = {
        viaType: "EOA",
        via: deploymentResult?.sender,
        network: getNetworkLiteral(globalState.form.network),
      };
      globalState.form.approvalProcessSelected = undefined;
    }

    const approvalProcess = globalState.form.approvalProcessSelected ?? await getOrCreateApprovalProcess();
    if (!approvalProcess) {
      displayMessage("No Approval Process selected", "error");
      return;
    };

    const deployRequest: DeployContractRequest = {
      network: getNetworkLiteral(globalState.form.network),
      approvalProcessId: approvalProcess.approvalProcessId,
      contractName: globalState.contract!.target,
      contractPath:  globalState.contract!.target,
      verifySourceCode: true,
      licenseType: 'MIT',
      artifactPayload: JSON.stringify(deploymentArtifact),
      constructorBytecode,
      salt,
    }

    const [newDeploymentId, deployError] = await attempt(async () => createDefenderDeployment(deployRequest));
    if (deployError || !newDeploymentId) {
      displayMessage(`Deployment failed to create: ${deployError?.msg}`, "error");
      return;
    }

    if (shouldUseInjectedProvider && deploymentResult) {
      const [, updateError] = await attempt(async () => updateDeploymentStatus(
        newDeploymentId,
        deploymentResult!.address,
        deploymentResult!.hash
      ));
      if (updateError) {
        displayMessage(`Error updating deployment status: ${updateError.msg}`, "error");
        return;
      }
    } else {
      // If we're not using an injected provider
      // we need to listen for the deployment to be finished.
      // listenForDeployment(newDeploymentId);
    }

    deploymentId = newDeploymentId;
    displayMessage("Deployment successfuly created in Defender", "success");
  };

  async function triggerDeploy() {
    busy = true;
    await deploy();
    busy = false;
  }

</script>

<div class="px-4 flex flex-col gap-2">

  {#if displayUpgradeableWarning}
    <Message type="warn" message="Upgradable contracts are not yet fully supported. This action will only deploy the implementation contract without initializing. <br />We recommend using <u><a href='https://github.com/OpenZeppelin/openzeppelin-upgrades' target='_blank'>openzeppelin-upgrades</a></u> package instead." />
  {/if}

  <div class="pt-2 relative">
    <input 
      type="checkbox"
      id="isDeterministic" 
      checked={isDeterministic || enforceDeterministic} 
      onchange={() => (isDeterministic = !isDeterministic)}
      disabled={enforceDeterministic}
    >
    <label class="text-xs absolute bottom-1 left-4" for="isDeterministic">
      Deterministic
    </label>
  </div>

  {#if isDeterministic || enforceDeterministic}
    <Input
      name="salt"
      type="text"
      placeholder={"Salt"}
      value={salt}
      onchange={handleSaltChanged}
    />
  {/if}

  {#if compilationError}
    <Message message={compilationError} type="error" />
  {/if}

  {#if inputs.length > 0}
    <h6 class="text-sm">Constructor Arguments</h6>
    {#each inputs as input}
      <Input name={input.name} placeholder={`${input.name} (${input.type})`} onchange={handleInputChange} value={''} type="text"/>
    {/each}
  {:else}
    <Message type="info" message="No constructor arguments found" />
  {/if}

  <Button disabled={!globalState.authenticated || busy} loading={busy} label="Deploy" onClick={triggerDeploy} />

  {#if successMessage || errorMessage} 
    <Message message={successMessage || errorMessage} type={successMessage ? "success" : "error"} />

    {#if deploymentUrl}
      <Button label={"View Deployment"} onClick={() => window.open(deploymentUrl, "_blank")} type="secondary" />
    {/if}
  {/if}
</div>