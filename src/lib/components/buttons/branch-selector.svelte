<script lang="ts">
	import { Tabs } from 'bits-ui';
	import { Button } from '$lib/components/ui/button';
	import { Crosshair } from '@lucide/svelte';
	import { registry } from '$lib/registry/mod-registry';
	import { cn } from '$lib/utils';

	let {
		value,
		onchange
	}: {
		value: string;
		onchange: (branchId: string) => void;
	} = $props();

	// 从注册表动态获取所有军种（按注册顺序排列）
	const branches = $derived([...registry.branches.values()]);
</script>

<div class="flex items-center gap-1.5">
	<Tabs.Root {value} onValueChange={(v) => onchange(v)} class="flex-1">
		<Tabs.List class="flex h-8 w-full rounded-lg bg-muted p-1" aria-label="军种选择">
			{#each branches as branch (branch.id)}
				<Tabs.Trigger
					value={branch.id}
					class={cn(
						'flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors',
						'text-muted-foreground hover:text-foreground',
						'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm'
					)}
				>
					{registry.getLabel('branch.' + branch.id, branch.id)}
				</Tabs.Trigger>
			{/each}
		</Tabs.List>
	</Tabs.Root>
</div>
