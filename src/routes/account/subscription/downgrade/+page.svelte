<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Button from '$components/buttons/Button.svelte';
	import NoBgButton from '$components/buttons/NoBgButton.svelte';
	import IconArrowRight from '$components/icons/IconArrowRight.svelte';
	import IconBack from '$components/icons/IconBack.svelte';
	import MetaTag from '$components/MetaTag.svelte';
	import PageWrapper from '$components/PageWrapper.svelte';
	import LL from '$i18n/i18n-svelte';
	import { apiUrl, canonicalUrl } from '$ts/constants/main';
	import {
		STRIPE_CURRENCY_TO_SYMBOL,
		STRIPE_PRODUCT_ID_OBJECTS_SUBSCRIPTIONS_MO
	} from '$ts/constants/stripePublic';
	import { getTitleFromProductId } from '$ts/helpers/stripe/plan';
	import { getUserSummary } from '$ts/helpers/user/user';
	import { isTouchscreen } from '$ts/stores/isTouchscreen';
	import { userSummary } from '$ts/stores/user/summary';
	import type { PageServerData } from './$types';

	export let data: PageServerData;

	const currentPriceId = data.current_price_id;
	const targetPriceId = data.target_price_id;
	const currentProductId = data.current_product_id;
	const targetProductId = data.target_product_id;
	const currency = data.currency;

	let changePlanStatus: 'idle' | 'loading' | 'success' = 'idle';

	$: currentPlan = {
		title: getTitleFromProductId($LL, currentProductId),
		amount:
			currency === 'eur'
				? STRIPE_PRODUCT_ID_OBJECTS_SUBSCRIPTIONS_MO[currentProductId].prices[currentPriceId]
						.currencies.eur.amount
				: STRIPE_PRODUCT_ID_OBJECTS_SUBSCRIPTIONS_MO[currentProductId].prices[currentPriceId]
						.currencies.usd.amount
	};

	$: targetPlan = {
		title: getTitleFromProductId($LL, targetProductId),
		amount:
			currency === 'eur'
				? STRIPE_PRODUCT_ID_OBJECTS_SUBSCRIPTIONS_MO[targetProductId].prices[targetPriceId]
						.currencies.eur.amount
				: STRIPE_PRODUCT_ID_OBJECTS_SUBSCRIPTIONS_MO[targetProductId].prices[targetPriceId]
						.currencies.usd.amount
	};

	async function changePlan() {
		changePlanStatus = 'loading';
		try {
			const res = await fetch(`${apiUrl.origin}/v1/user/subscription/downgrade`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${$page.data.session?.access_token}`
				},
				body: JSON.stringify({
					target_price_id: targetPriceId
				})
			});
			const data = await res.json();
			if (data.success) {
				const summary = await getUserSummary($page.data.session?.access_token);
				if (summary) {
					userSummary.set(summary);
				}
				await goto('/account/subscription/downgrade/succeeded');
				changePlanStatus = 'success';
			} else {
				changePlanStatus = 'idle';
			}
		} catch (error) {
			changePlanStatus = 'idle';
			console.log(error);
		}
	}
</script>

<MetaTag
	title="Change Plan | Stablecog"
	description="Change your Stablecog subscription plan."
	imageUrl="{canonicalUrl}/previews{$page.url.pathname}.png"
	canonical="{canonicalUrl}{$page.url.pathname}"
/>

<PageWrapper>
	<div class="w-full flex flex-col items-center justify-start my-auto">
		<section class="w-full flex flex-col items-center justify-start">
			<h1 class="text-center font-bold text-4xl">
				{$LL.Account.Subscription.ChangePlanTitle()}
			</h1>
			<div
				class="w-full max-w-sm flex flex-col items-center p-4 rounded-3xl bg-c-bg ring-2 ring-c-bg-secondary mt-6 
        shadow-xl shadow-c-shadow/[var(--o-shadow-normal)]"
			>
				<div class="w-full flex flex-col items-start px-1 md:px-2 gap-5">
					<div class="w-full flex flex-col">
						<p class="text-sm text-c-on-bg/60 font-medium">
							{$LL.Account.Subscription.CurrentPlanTitle()}
						</p>
						<p class="text-left font-bold text-2xl mt-1 text-c-on-bg">
							{currentPlan.title}<span
								class="text-base bg-c-primary/15 font-medium text-c-primary px-1.5 py-0.75 rounded-md ml-2"
								>{STRIPE_CURRENCY_TO_SYMBOL[
									currency
								]}{currentPlan.amount}{$LL.Pricing.SlashMonth()}</span
							>
						</p>
					</div>
					<div class="transform rotate-90 -mt-2">
						<IconArrowRight class="w-8 h-8 text-c-on-bg/40 flex-shrink-0" />
					</div>
					<div class="w-full flex flex-col">
						<p class="text-sm text-c-on-bg/60 font-medium">
							{$LL.Account.Subscription.Downgrade.DowngradingToTitle()}
						</p>
						<p class="text-left font-bold text-2xl mt-1 text-c-on-bg">
							{targetPlan.title}<span
								class="text-base bg-c-primary/15 font-medium text-c-primary px-1.5 py-0.75 rounded-md ml-2"
								>{STRIPE_CURRENCY_TO_SYMBOL[
									currency
								]}{targetPlan.amount}{$LL.Pricing.SlashMonth()}</span
							>
						</p>
					</div>
				</div>
				<p class="w-full rounded-lg px-3 md:px-4 py-3 bg-c-on-bg/5 text-c-on-bg/60 text-sm mt-6">
					{$LL.Account.Subscription.Downgrade.Explanation()}
				</p>
				<Button
					class="mt-4 w-full"
					loading={changePlanStatus === 'loading'}
					withSpinner
					onClick={changePlan}>{$LL.Shared.ConfirmButton()}</Button
				>
			</div>
			<div class="mt-4">
				<NoBgButton href="/pricing">
					<div class="flex items-center justify-center gap-2.5 px-2 py-1">
						<IconBack
							class="w-6 h-6 transform transition text-c-on-bg/50 group-hover:-translate-x-1
							{!$isTouchscreen ? 'group-hover:text-c-primary' : ''}"
						/>
						<p class="font-bold">{$LL.Shared.GoBackButton()}</p>
					</div>
				</NoBgButton>
			</div>
		</section>
	</div>
</PageWrapper>
