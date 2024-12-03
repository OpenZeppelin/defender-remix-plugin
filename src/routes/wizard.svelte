<script lang="ts">
  import { initWizardPlugin } from "$lib/wizard";
  import { onMount } from "svelte";
  import Configure from "$lib/wizard/components/Configure.svelte";

  onMount(initWizardPlugin);
</script>

<Configure />
