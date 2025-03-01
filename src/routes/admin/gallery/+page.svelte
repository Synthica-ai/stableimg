<script lang="ts">
	import { page } from '$app/stores';
	import BatchEditBar from '$components/BatchEditBar.svelte';
	import GenerationFullScreen from '$components/generationFullScreen/GenerationFullScreen.svelte';
	import GenerationGridInfinite from '$components/grids/GenerationGridInfinite.svelte';
	import IconAnimatedSpinner from '$components/icons/IconAnimatedSpinner.svelte';
	import IconFunnel from '$components/icons/IconFunnel.svelte';
	import IconSadFace from '$components/icons/IconSadFace.svelte';
	import IconTick from '$components/icons/IconTick.svelte';
	import MetaTag from '$components/MetaTag.svelte';
	import SignInCard from '$components/SignInCard.svelte';
	import TabLikeDropdown from '$components/tabBars/TabLikeDropdown.svelte';
	import LL from '$i18n/i18n-svelte';
	import { canonicalUrl } from '$ts/constants/main';
	import { isSuperAdmin } from '$ts/helpers/admin/roles';
	import {
		getAllUserGenerationFullOutputs,
		type TUserGenerationFullOutputsPage
	} from '$ts/queries/userGenerations';
	import {
		adminGalleryCurrentFilter,
		isAdminGalleryEditActive,
		lastFetchedAdminGalleryFilter
	} from '$ts/stores/admin/gallery';
	import { userSummary } from '$ts/stores/user/summary';
	import { activeGeneration } from '$userStores/generation';
	import { createInfiniteQuery, type CreateInfiniteQueryResult } from '@tanstack/svelte-query';

	let totalOutputs: number;

	let allUserGenerationFullOutputsQuery:
		| CreateInfiniteQueryResult<TUserGenerationFullOutputsPage, unknown>
		| undefined;

	$: allUserGenerationFullOutputsQueryKey = [
		'admin_user_generation_full_outputs',
		$adminGalleryCurrentFilter
	];
	$: allUserGenerationFullOutputsQuery = $page.data.session?.user.id
		? createInfiniteQuery({
				queryKey: allUserGenerationFullOutputsQueryKey,
				queryFn: (lastPage) => {
					return getAllUserGenerationFullOutputs({
						access_token: $page.data.session?.access_token || '',
						cursor: lastPage?.pageParam,
						gallery_status: $adminGalleryCurrentFilter,
						order_by:
							$adminGalleryCurrentFilter === 'approved' || $adminGalleryCurrentFilter === 'rejected'
								? 'updated_at'
								: 'created_at'
					});
				},
				onSuccess: () => {
					lastFetchedAdminGalleryFilter.set($adminGalleryCurrentFilter);
				},
				getNextPageParam: (lastPage: TUserGenerationFullOutputsPage) => {
					if (!lastPage.next) return undefined;
					return lastPage.next;
				}
		  })
		: undefined;

	$: $allUserGenerationFullOutputsQuery?.data?.pages, onPagesChanged();
	$: gridRerenderKey = `admin_user_generation_full_outputs_${$adminGalleryCurrentFilter}_${
		$allUserGenerationFullOutputsQuery?.isInitialLoading
	}_${$allUserGenerationFullOutputsQuery?.isStale}_${
		$allUserGenerationFullOutputsQuery?.data?.pages?.[0]?.outputs &&
		$allUserGenerationFullOutputsQuery.data.pages[0].outputs.length > 0
			? $allUserGenerationFullOutputsQuery.data.pages[0].outputs[0].id
			: false
	}`;

	const onPagesChanged = () => {
		if (!$page.data.session?.user.id || !$allUserGenerationFullOutputsQuery) return;
		if (!$allUserGenerationFullOutputsQuery.data?.pages) return;
		for (let i = 0; i < $allUserGenerationFullOutputsQuery.data.pages.length; i++) {
			let page = $allUserGenerationFullOutputsQuery.data.pages[i];
			if (page.total_count !== undefined) {
				totalOutputs = page.total_count;
			}
		}
	};

	function onKeyDown({ key }: KeyboardEvent) {
		if (key === 'e') {
			isAdminGalleryEditActive.set(!$isAdminGalleryEditActive);
			return;
		}
		if (!$activeGeneration) return;
		if (key === 'Escape') {
			activeGeneration.set(undefined);
			return;
		}
		if (key === 'ArrowLeft' || key === 'ArrowRight') {
			const outputs = $allUserGenerationFullOutputsQuery?.data?.pages.flatMap(
				(page) => page.outputs
			);
			if (!outputs) return;
			const index = outputs.findIndex((g) => g.id === $activeGeneration?.selected_output.id);
			if (index === -1) return;
			const addition = key === 'ArrowLeft' ? -1 : 1;
			const newIndex = (index + addition + outputs.length) % outputs.length;
			activeGeneration.set({
				...outputs[newIndex].generation,
				selected_output: outputs[newIndex]
			});
		}
	}
</script>

<MetaTag
	title="History | Stablecog"
	description="See your generation history on Stablecog (free and multi-lingual AI image generator)."
	imageUrl="{canonicalUrl}/previews{$page.url.pathname}.png"
	canonical="{canonicalUrl}{$page.url.pathname}"
/>

<svelte:window on:keydown={onKeyDown} />

<div class="w-full flex-1 flex flex-col items-center px-1 pt-2 md:py-6 relative">
	{#if !$page.data.session?.user.id}
		<div class="w-full flex-1 max-w-7xl flex justify-center px-2 py-4 md:py-2">
			<div class="my-auto flex flex-col">
				<SignInCard redirectTo="/history" />
				<div class="w-full h-[1vh]" />
			</div>
		</div>
	{:else}
		<div class="w-full max-w-7xl flex flex-col md:flex-row md:justify-between md:items-center px-1">
			<div class="flex flex-wrap gap-2 items-center px-3">
				<p class="font-bold text-1.5xl md:text-2xl">
					{$LL.History.GenerationsTitle()}
				</p>
				<p class="text-sm md:text-base text-c-on-bg/50 font-semibold mt-0.5 md:mt-1">
					({totalOutputs !== undefined ? totalOutputs : '...'})
				</p>
			</div>
			<div class="w-full md:w-64 flex z-40 mt-4 md:mt-0">
				<TabLikeDropdown
					class="w-full"
					name="Filter"
					items={[
						{ label: $LL.Admin.Gallery.StatusDropdown.Submitted(), value: 'submitted' },
						{
							label: $LL.Admin.Gallery.StatusDropdown.ManuallySubmitted(),
							value: 'manually_submitted'
						},
						{ label: $LL.Admin.Gallery.StatusDropdown.Approved(), value: 'approved' },
						{ label: $LL.Admin.Gallery.StatusDropdown.Rejected(), value: 'rejected' },
						...(isSuperAdmin($userSummary?.roles || [])
							? [
									{
										label: $LL.Admin.Gallery.StatusDropdown.Private(),
										value: 'not_submitted'
									}
							  ]
							: [])
					]}
					bind:value={$adminGalleryCurrentFilter}
				>
					<div slot="title" class="p-3.5 flex items-center justify-center">
						<IconFunnel class="w-6 h-6 text-c-on-bg/35" />
					</div>
				</TabLikeDropdown>
			</div>
		</div>
		<!-- Edit bar -->
		<div
			class="w-full top-1 max-w-7xl px-1 transition-all sticky z-30 {$isAdminGalleryEditActive
				? 'mt-3'
				: 'mt-0'}"
		>
			{#if $isAdminGalleryEditActive}
				<BatchEditBar type="admin-gallery" />
			{/if}
		</div>
		<div class="w-full flex-1 flex flex-col mt-2">
			{#if allUserGenerationFullOutputsQuery === undefined || $allUserGenerationFullOutputsQuery === undefined || $allUserGenerationFullOutputsQuery.isInitialLoading}
				<div
					class="w-full flex flex-col text-c-on-bg/60 flex-1 py-6 px-4 justify-center items-center text-center"
				>
					<IconAnimatedSpinner class="w-12 h-12" />
					<p class="mt-2 opacity-0">{$LL.Gallery.SearchingTitle()}</p>
					<div class="h-[2vh]" />
				</div>
			{:else if $allUserGenerationFullOutputsQuery?.data?.pages?.length === 1 && $allUserGenerationFullOutputsQuery.data.pages[0].outputs.length === 0}
				<div class="w-full flex-1 flex flex-col items-center py-8 px-5">
					<div class="flex flex-col my-auto items-center gap-2 text-c-on-bg/50 text-center">
						<IconTick class="w-16 h-16" />
						<p>{$LL.Admin.Gallery.NoGenerationsToReview()}</p>
						<div class="h-[1vh]" />
					</div>
				</div>
			{:else if $allUserGenerationFullOutputsQuery.isError}
				<div class="w-full flex-1 flex flex-col items-center py-8 px-5">
					<div class="flex flex-col my-auto items-center gap-2">
						<IconSadFace class="w-16 h-16 text-c-on-bg/50" />
						<p class="text-c-on-bg/50">{$LL.Error.SomethingWentWrong()}</p>
					</div>
				</div>
			{:else}
				<GenerationGridInfinite
					generationsQuery={allUserGenerationFullOutputsQuery}
					rerenderKey={gridRerenderKey}
					cardType="admin-gallery"
				/>
			{/if}
		</div>
	{/if}
</div>

{#if $activeGeneration}
	<GenerationFullScreen generation={$activeGeneration} modalType="admin-gallery" />
{/if}
