<script lang="ts">
	import {
		PUBLIC_STRIPE_PRODUCT_ID_STARTER_SUBSCRIPTION,
		PUBLIC_STRIPE_PRODUCT_ID_PRO_SUBSCRIPTION,
		PUBLIC_STRIPE_PRODUCT_ID_ULTIMATE_SUBSCRIPTION
	} from '$env/static/public';
	import LL from '$i18n/i18n-svelte';
	import type { TStripeSupportedProductIdSubscriptions } from '$ts/constants/stripePublic';
	import { isTouchscreen } from '$ts/stores/isTouchscreen';

	export let productId: TStripeSupportedProductIdSubscriptions | undefined;
	export let size: 'sm' | 'md' | 'lg' = 'md';
	export { classes as class };
	export let planText: string | undefined = undefined;
	export let href: string | undefined = undefined;
	let classes = '';

	let _planText: string;
	$: [$LL, planText], setPlanText();

	function setPlanText() {
		if (planText !== undefined) {
			_planText = planText;
		} else if (productId === PUBLIC_STRIPE_PRODUCT_ID_STARTER_SUBSCRIPTION) {
			_planText = $LL.Pricing.Plans.StarterTitle();
		} else if (productId === PUBLIC_STRIPE_PRODUCT_ID_PRO_SUBSCRIPTION) {
			_planText = $LL.Pricing.Plans.ProTitle();
		} else if (productId === PUBLIC_STRIPE_PRODUCT_ID_ULTIMATE_SUBSCRIPTION) {
			_planText = $LL.Pricing.Plans.UltimateTitle();
		} else {
			_planText = $LL.Pricing.Plans.FreeTitle();
		}
	}
</script>

{#if href}
	<a
		{href}
		data-sveltekit-preload-data="hover"
		class="bg-c-bg border-2 overflow-hidden z-10 shadow-lg flex-shrink-0
  	shadow-c-shadow/[var(--o-shadow-normal)] group relative {productId !== undefined &&
		productId !== 'free'
			? 'border-c-primary/30'
			: 'border-c-on-bg/25'} {size === 'sm'
			? 'rounded-lg'
			: size === 'md'
			? 'rounded-lg2'
			: 'rounded-lg2'} {classes}"
	>
		<div
			class="w-[200%] h-full absolute left-0 top-0 flex items-center justify-center {$isTouchscreen
				? 'hidden'
				: 'flex'}"
		>
			<div
				class="w-full aspect-square origin-left rounded-full transition transform -translate-x-full 
					bg-c-primary/15 {!$isTouchscreen ? 'group-hover:translate-x-[-45%]' : ''}"
			/>
		</div>
		<div
			class="flex items-center justify-center z-10 {productId !== undefined && productId !== 'free'
				? 'text-c-primary bg-c-primary/15'
				: 'text-c-on-bg bg-c-on-bg/15'}
    	{size === 'sm'
				? 'gap-1.5 px-2.5 py-1'
				: size === 'md'
				? 'gap-1.5 px-3 py-1.25'
				: 'gap-1.5 px-4 py-1.5'}"
		>
			<p
				class={size === 'sm'
					? 'text-sm font-bold'
					: size === 'md'
					? 'text-base font-bold'
					: 'text-lg font-bold'}
			>
				{_planText}
			</p>
		</div>
	</a>
{:else}
	<div
		class="bg-c-bg border-2 overflow-hidden z-10 shadow-lg flex-shrink-0
  	shadow-c-shadow/[var(--o-shadow-normal)] {productId !== undefined && productId !== 'free'
			? 'border-c-primary/30'
			: 'border-c-on-bg/25'} {size === 'sm'
			? 'rounded-lg'
			: size === 'md'
			? 'rounded-lg2'
			: 'rounded-lg2'} {classes}"
	>
		<div
			class="flex items-center justify-center z-10 {productId !== undefined && productId !== 'free'
				? 'text-c-primary bg-c-primary/15'
				: 'text-c-on-bg bg-c-on-bg/15'}
    {size === 'sm'
				? 'gap-1.5 px-2.5 py-1'
				: size === 'md'
				? 'gap-1.5 px-3 py-1.25'
				: 'gap-1.5 px-4 py-1.5'}"
		>
			<p
				class={size === 'sm'
					? 'text-sm font-bold'
					: size === 'md'
					? 'text-base font-bold'
					: 'text-lg font-bold'}
			>
				{_planText}
			</p>
		</div>
	</div>
{/if}
