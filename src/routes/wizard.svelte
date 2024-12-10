<script lang="ts">
	import "../wizard-app.css";
  import { initWizardPlugin } from "$lib/wizard";
  import { onMount } from "svelte";
  import Configuration from "$lib/wizard/components/Configuration.svelte";
  import Network from "$lib/wizard/components/Network.svelte";
  import { globalState } from "$lib/state/state.svelte";
  import ApprovalProcess from "$lib/wizard/components/ApprovalProcess.svelte";
  import Deploy from "$lib/wizard/components/Deploy.svelte";

  let currentStep = $state(0);
  function toggleStep(step: number) {
    currentStep = step;
  }

  onMount(initWizardPlugin);
</script>


<div class="h-[calc(100vh-2rem)] flex flex-col pt-2">
  <div class="flex-1 overflow-y-auto">
    <button onclick={() => toggleStep(0)} class="flex items-center justify-between w-full p-4 text-sm font-medium rtl:text-right text-gray-800 rounded-t-xl gap-3" >
      <span>Configuration</span>
      <i class={`pr-2 ${currentStep === 0 ? "fa fa-angle-down" : "fa fa-angle-right"}`}></i>
    </button>
    <div class:hidden={!(currentStep === 0)}>
      <div class="pl-4 pr-4"> 
        <Configuration />
      </div>
    </div>
    <button 
      disabled={!globalState.authenticated} 
      onclick={() => toggleStep(1)} 
      class="flex items-center justify-between w-full p-4 text-sm font-medium rtl:text-right text-gray-800 rounded-t-xl gap-3" 
      class:cursor-not-allowed={!globalState.authenticated}
      class:text-gray-300={!globalState.authenticated}
    >
      <span>Network</span>
      <i class={`pr-2 ${currentStep === 1 ? "fa fa-angle-down" : "fa fa-angle-right"}`}></i>
    </button>
    <div class:hidden={!(currentStep === 1)} >
      <div class="pl-4 pr-4"> 
        <Network onSelected={() => {}} />
      </div>
    </div>
    <button
      disabled={!globalState.authenticated} 
      onclick={() => toggleStep(2)} 
      class="flex items-center justify-between w-full p-4 text-sm font-medium rtl:text-right text-gray-800 rounded-t-xl gap-3"
      class:cursor-not-allowed={!globalState.authenticated}
      class:text-gray-300={!globalState.authenticated}
    >
      <span>Approval Process</span>
      <i class={`pr-2 ${currentStep === 2 ? "fa fa-angle-down" : "fa fa-angle-right"}`}></i>
    </button>
    <div class:hidden={!(currentStep === 2)}>
      <div class="pl-4 pr-4"> 
        <ApprovalProcess  />
      </div>
    </div>
    <button
      disabled={!globalState.authenticated} 
      onclick={() => toggleStep(3)} 
      class="flex items-center justify-between w-full p-4 text-sm font-medium rtl:text-right text-gray-800 gap-3"
      class:cursor-not-allowed={!globalState.authenticated}
      class:text-gray-300={!globalState.authenticated}
    >
    <span>Deploy</span>
      <i class={`pr-2 ${currentStep === 3 ? "fa fa-angle-down" : "fa fa-angle-right"}`}></i>
    </button>
    <div class:hidden={!(currentStep === 3)}>
      <div class="pl-4 pr-4"> 
        <Deploy />
      </div>
    </div>
  </div>
</div>
