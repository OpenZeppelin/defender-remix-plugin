<script lang="ts">
  import type { ChangeEventHandler } from "svelte/elements";

  type Props = {
    label?: string;
    value: string;
    placeholder: string;
    type: 'text' | 'password';
    disabled?: boolean;
    onchange?: ChangeEventHandler<HTMLInputElement>;
  };
  let { label, value = $bindable(), placeholder, type, disabled, onchange }: Props = $props();
    
</script>

{#if label}
  <label class="text-xs" for="apiSecret">{label}</label>
{/if}
<input
  name="apiSecret"
  type={type}
  bind:value={value}
  placeholder={placeholder}
  disabled={disabled}
  onchange={onchange}
  class="border text-xs border-gray-300 disabled:opacity-50 rounded-md p-2 w-full"
/>
