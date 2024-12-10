<script lang="ts">
  import { globalState } from "$lib/state/state.svelte";
  import Dropdown from "./shared/Dropdown.svelte";
  import { abbreviateAddress } from "$lib/utils/helpers";
  import { approvalProcessTypes, type ApprovalProcess, type ApprovalProcessType } from "$lib/models/approval-process";
  import type { DropdownItem, GlobalState } from "$lib/models/ui";
  import type { Relayer } from "$lib/models/relayer";
  import { getNetworkLiteral } from "$lib/models/network";
  import Input from "./shared/Input.svelte";
  import Message from "./shared/Message.svelte";

  let address = $state<string>(globalState.form.approvalProcessToCreate?.via || "");

  function approvalProcessByNetworkAndComponent(ap: ApprovalProcess) {
    const networkName = typeof globalState.form.network === 'string' 
      ? globalState.form.network 
      : globalState.form.network?.name;
      
    return ap.network === networkName && ap.component?.includes("deploy");
  }

  // Approval processes load logic
  const toDisplayName = (ap: ApprovalProcess) => `${ap.name} (${ap.viaType})`;
  const approvalProcessToDropdownItem = (ap: ApprovalProcess) => ({
    label: toDisplayName(ap),
    value: ap,
  });

  // Approval process selection logic
  const onSelectApprovalProcess = (ap: DropdownItem) => {
    globalState.form.approvalProcessSelected = ap.value as ApprovalProcess;
  };

  // Approval process creation logic
  const approvalProcessTypeToDropdownItem = (type: ApprovalProcessType) => ({
    label: type,
    value: type,
  });

  let approvalProcessType = $state<ApprovalProcessType>("EOA");
  const onSelectApprovalProcessType = (type: DropdownItem) => {
    if (type.value) {
      approvalProcessType = type.value;

      // Save the type to create the approval process.
      globalState.form.approvalProcessToCreate = {
        ...globalState.form.approvalProcessToCreate,
        viaType: approvalProcessType as "EOA" | "Safe" | "Relayer",
      };
    }
  };

  // Relayer selection logic
  const relayerByNetwork = (relayer: Relayer) =>
    relayer.network === globalState.form.network;
  const relayerToDropdownItem = (relayer: Relayer) => ({
    label: `${relayer.name} (${abbreviateAddress(relayer.address)})`,
    value: relayer,
  });
  const onSelectRelayer = (relayer: DropdownItem) => {
    if (relayer.value) {
      globalState.form.approvalProcessToCreate = {
        viaType: "Relayer",
        via: relayer.value.address,
        relayerId: relayer.value.relayerId,
        network: globalState.form.network && getNetworkLiteral(globalState.form.network),
      };
    }
  };

  const onAddressChange = (e: Event) => {
    const element = e.target as HTMLInputElement;

    // Save the type to create the approval process.
    globalState.form.approvalProcessToCreate = {
      viaType: approvalProcessType as "EOA" | "Safe" | "Relayer",
      via: element.value,
      network: globalState.form.network && getNetworkLiteral(globalState.form.network),
    };
  };

  // Radio logic
  let radioSelected = $state<GlobalState["form"]["approvalType"]>("existing");
  const onRadioChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.checked) {
      radioSelected = target.id as GlobalState["form"]["approvalType"];

      globalState.form.approvalType = radioSelected;
    }
  };

  let disableCreation = $derived.by(() =>
    globalState.approvalProcesses.some(approvalProcessByNetworkAndComponent),
  );

  let disableRelayers = $derived.by(() => 
    !globalState.permissions?.includes("manage-relayers")
  );
</script>

<div class="form-check">
  <input
    class="form-check-input"
    type="radio"
    name="flexRadioDefault"
    id="existing"
    onclick={(e) => onRadioChange(e)}
    checked
  />
  <label class="text-sm" for="flexRadioDefault1">
    Use existing Approval Process
  </label>

  {#key globalState.form.approvalProcessSelected}
    <Dropdown
      items={globalState.approvalProcesses
        .filter(approvalProcessByNetworkAndComponent)
        .map(approvalProcessToDropdownItem)}
      placeholder="Select Approval Process"
      on:select={(e) => onSelectApprovalProcess(e.detail)}
      disabled={radioSelected !== "existing"}
      defaultItem={globalState.form.approvalProcessSelected
        ? {
            label: toDisplayName(globalState.form.approvalProcessSelected),
            value: globalState.form.approvalProcessSelected,
          }
        : undefined}
      emptyLabel="No Approval Processes Available"
    />
  {/key}
</div>
<div
  class="form-check mt-3"
  title={disableCreation ? "Deploy Environment already exists" : undefined}
>
  <input
    class="text-xs"
    type="radio"
    name="flexRadioDefault"
    id="new"
    onclick={(e) => onRadioChange(e)}
    disabled={disableCreation}
    title={disableCreation ? "Deploy Environment already exists" : undefined}
  />
  <label
    class={`text-sm ${disableCreation ? 'text-gray-500' : ''}`}
    for="flexRadioDefault2"
    title={disableCreation ? "Deploy Environment already exists" : undefined}
  >
    Create new Approval Process
  </label>

  <Dropdown
    items={approvalProcessTypes.map(approvalProcessTypeToDropdownItem)}
    placeholder="Approval Process Type"
    on:select={(e) => onSelectApprovalProcessType(e.detail)}
    disabled={radioSelected !== "new" || disableCreation}
    defaultItem={{
      label: approvalProcessType,
      value: approvalProcessType,
    }}
  />

  {#if approvalProcessType === "EOA" || approvalProcessType === "Safe"}
    <div class="mt-2">
      <Input value={address} placeholder="* Address" type="text" onchange={onAddressChange} />
    </div>
  {:else if approvalProcessType === "Relayer"}
    {#if disableRelayers}
      <div class="mt-2">
        <Message message="API Key not allowed to manage Relayers" type="warn" />
      </div>
    {:else}
      <Dropdown
        name="relayer"
        items={globalState.relayers
          .filter(relayerByNetwork)
          .map(relayerToDropdownItem)}
        placeholder="* Select Relayer"
        on:select={(e) => onSelectRelayer(e.detail)}
        disabled={radioSelected !== "new" || disableCreation}
      />
    {/if}
  {/if}
</div>
<div class="form-check mt-3">
  <input
    class="form-check-input"
    type="radio"
    name="flexRadioDefault"
    id="injected"
    onclick={(e) => onRadioChange(e)}
    title={disableCreation ? "Deploy Environment already exists" : undefined}
    disabled={disableCreation}
  />
  <label
    class={`text-sm ${disableCreation ? 'text-gray-500' : ''}`}
    for="flexRadioDefault2"
    title={disableCreation ? "Deploy Environment already exists" : undefined}
  >
    Approve using injected provider
  </label>
</div>
