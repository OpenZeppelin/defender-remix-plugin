<script lang="ts">
  import { onMount } from "svelte";
  import { initRemixPlugin } from "$lib/remix";
  import { globalState } from "$lib/remix/state/state.svelte";
  import Setup from "$lib/remix/components/Setup.svelte";
  import Network from "$lib/remix/components/Network.svelte";
  import ApprovalProcess from "$lib/remix/components/ApprovalProcess.svelte";
  import Deploy from "$lib/remix/components/Deploy.svelte";
  import { getAddress } from "ethers";
  import { attempt } from "$lib/utils/attempt";
  import { wait } from "$lib/utils/helpers";
  import { slide } from "svelte/transition";

	// Accordeon logic
	let currentTab = $state(0);
	const toggle = (tab: number) => (currentTab = tab);


	let isValidApprovalProcessStep = $derived.by(async () => {
		if (globalState.form.approvalType === "injected") {
			return true;
		}

		if (globalState.form.approvalType === 'existing' && globalState.form.approvalProcessSelected) {
			return true;
		}

		if (
			globalState.form.approvalType === 'new' &&
			globalState.form.approvalProcessToCreate?.viaType === "Relayer" &&
			globalState.form.approvalProcessToCreate?.relayerId
		) {
			return true;
		}

		if (
			globalState.form.approvalType === 'new' &&
			globalState.form.approvalProcessToCreate?.viaType !== "Relayer" &&
			globalState.form.approvalProcessToCreate?.via
		) {
			// check if address is valid
			const [checksumed, err] = await attempt(async () =>
				getAddress(globalState.form.approvalProcessToCreate!.via!),
			);
			if (err) {
				return false;
			}
			return true;
		}

		return false;
	});

  onMount(initRemixPlugin);
</script>

<p>
  <small
    >To get started with <strong>Deploy With Defender</strong>, you need to
    have an
    <a href="https://defender.openzeppelin.com/" target="_blank"
      >OpenZeppelin Defender Account</a
    >
    (It's free) and setup an
    <a
      href="https://defender.openzeppelin.com/#/settings/api-keys"
      target="_blank"
    >
      API Key and Secret</a
    >.</small
  >
</p>

{#if globalState.error}
  <div class="alert alert-danger">
    <p><small>{globalState.error ?? ""}</small></p>
  </div>
{/if}

<div id="accordion">
  {#each [0, 1, 2, 3] as index}
    <div class="card">
      <button
        class="card-header btn"
        onclick={() => toggle(index)}
        disabled={!globalState.authenticated && index > 0}
      >
        <h6 class="mb-0 accordeon-tab">
          <i
            class={`pr-2 ${currentTab === index ? "fa fa-angle-down" : "fa fa-angle-right"}`}
          ></i>
          {#if index === 0}SETUP{/if}
          {#if index === 1}NETWORK{/if}
          {#if index === 2}APPROVAL PROCESS{/if}
          {#if index === 3}DEPLOY{/if}
        </h6>

        {#if globalState.authenticated && index === 0}
          <i class="fa fa-check-circle-o text-success"></i>
        {/if}
        {#if globalState.form.network && index === 1}
          <i class="fa fa-check-circle-o text-success"></i>
        {/if}
        {#await isValidApprovalProcessStep then isValid}
          {#if isValid && index === 2}
            <i class="fa fa-check-circle-o text-success"></i>
          {/if}
        {/await}
        {#if globalState.form.completed && index === 3}
          <i class="fa fa-check-circle-o text-success"></i>
        {/if}
      </button>

      {#if currentTab === index}
        <div transition:slide class="collapse show">
          <div class="card-body">
            {#if index === 0}<Setup onSuccess={() => wait(1000).then(() => toggle(1))}/>{/if}
            {#if index === 1}<Network onSelected={() => wait(1000).then(() => toggle(2))}/>{/if}
            {#if index === 2}<ApprovalProcess />{/if}
            {#if index === 3}<Deploy />{/if}
          </div>
        </div>
      {/if}
    </div>
  {/each}
</div>

<style>
  a {
		cursor: pointer;
	}

	p {
		line-height: 1.2;
	}

	.accordeon-tab {
		color: #a2a3bd;
		display: flex;
		font-size: smaller;
	}

	.card-header {
		display: flex;
		justify-content: space-between;
	}
</style>
