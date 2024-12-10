<script lang="ts">
  type Props = {
    loading?: boolean;
    onClick: () => void;
    label: string;
    disabled?: boolean;
    type?: 'primary' | 'secondary';
  };
  const { loading, onClick, label, disabled, type }: Props = $props();

  let buttonClass = $derived.by(() => {
    if (loading) {
      return 'bg-gray-400 text-white text-sm rounded-md p-2 mt-2';
    }
    if (type === 'secondary') {
      return 'bg-transparent text-gray-800 text-sm border border-gray-800 rounded-md p-2 mt-2';
    }
    return 'bg-blue-600 text-white text-sm rounded-md p-2 mt-2';
  });
</script>

<button onclick={onClick} disabled={disabled || loading} class={buttonClass}>
  {#if loading}
    <i class="fa fa-spinner fa-spin"></i>
  {/if}
  {#if !loading}
    {label}
  {/if}
</button>