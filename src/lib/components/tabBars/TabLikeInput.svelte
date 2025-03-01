<script lang="ts">
	import ClearButton from '$components/buttons/ClearButton.svelte';
	import TabBarWrapper from '$components/tabBars/TabBarWrapper.svelte';
	import { isTouchscreen } from '$ts/stores/isTouchscreen';

	export let value: number | string | undefined | null;
	export let placeholder: string | undefined = undefined;
	export { classes as class };
	export let type: 'text' | 'number' = 'number';
	export let max: undefined | number = undefined;
	export let formElement: HTMLFormElement | undefined = undefined;
	export let disabled = false;
	let classes = '';

	let inputElement: HTMLInputElement;

	let clearInput = () => {
		value = null;
		inputElement.focus();
	};

	$: showClearInputButton = value !== undefined && value !== '' && value !== null;

	const handleKeypress = (e: KeyboardEvent) => {
		if (e.key === 'Enter' && e.shiftKey === false) {
			e.preventDefault();
			e.stopPropagation();
			const inputsOrTextareas = formElement?.querySelectorAll(
				'input[type=text], input[type=number], textarea'
			);
			if (inputsOrTextareas) {
				for (let i = 0; i < inputsOrTextareas.length; i++) {
					if (inputsOrTextareas[i] === e.target) {
						if (i < inputsOrTextareas.length - 1) {
							(inputsOrTextareas[i + 1] as HTMLInputElement | HTMLTextAreaElement).focus();
						} else {
							(inputsOrTextareas[0] as HTMLInputElement | HTMLTextAreaElement).focus();
						}
						break;
					}
				}
			}
		}
	};
</script>

<TabBarWrapper class={classes}>
	{#if type === 'text'}
		<div class="self-stretch flex text-c-on-bg/50">
			<slot name="title" />
		</div>
		<div class="w-2px mr-px -ml-px self-stretch">
			<div class="w-full h-full bg-c-bg-secondary" />
		</div>
		<div class="flex-1 min-w-0 flex relative rounded-r-xl group">
			<input
				{disabled}
				bind:this={inputElement}
				bind:value
				on:keypress={(e) => handleKeypress(e)}
				on:input={() => {
					if (
						max !== undefined &&
						value !== null &&
						value !== undefined &&
						value.toString().length > max
					) {
						value = value.toString().slice(0, max);
					}
				}}
				{placeholder}
				type="text"
				class="text-base w-full text-c-on-bg/75 self-stretch overflow-ellipsis ring-0 transition ring-c-primary/15 focus:ring-c-primary/25 focus:ring-2 
						pl-4 py-3.25 md:py-3.5 rounded-r-xl bg-transparent placeholder:text-c-on-bg/40 {!$isTouchscreen
					? 'hover:ring-2 group-hover:ring-2'
					: ''} {showClearInputButton ? 'pr-10 md:pr-12' : 'pr-4'}"
			/>
			<ClearButton {disabled} show={showClearInputButton} onClick={clearInput} type="sm" />
		</div>
	{:else}
		<div class="self-stretch flex text-c-on-bg/50">
			<slot name="title" />
		</div>
		<div class="w-2px mr-px -ml-px self-stretch">
			<div class="w-full h-full bg-c-bg-secondary" />
		</div>
		<div class="flex-1 min-w-0 flex relative rounded-r-xl group">
			<input
				{disabled}
				bind:this={inputElement}
				bind:value
				on:keypress={(e) => handleKeypress(e)}
				on:input={() => {
					if (max !== undefined && value !== null && value !== undefined) {
						if (value.toString().length > max.toString().length) {
							value = parseInt(value.toString().slice(0, max.toString().length));
						}
						if (value > max) {
							value = parseInt(value.toString().slice(0, -1));
						}
					}
				}}
				{placeholder}
				type="number"
				inputmode="numeric"
				pattern="[0-9]*"
				class="text-base w-full text-c-on-bg self-stretch overflow-ellipsis ring-0 transition ring-c-primary/15 focus:ring-c-primary/25 focus:ring-2 
					pl-4 py-3.25 md:py-3.5 rounded-r-xl bg-transparent placeholder:text-c-on-bg/40 {!$isTouchscreen
					? 'hover:ring-2 group-hover:ring-2'
					: ''} {showClearInputButton ? 'pr-10 md:pr-12' : 'pr-4'}"
			/>
			<ClearButton {disabled} show={showClearInputButton} onClick={clearInput} type="sm" />
		</div>
	{/if}
</TabBarWrapper>
