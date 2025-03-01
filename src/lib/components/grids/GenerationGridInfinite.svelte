<script lang="ts">
	import Button from '$components/buttons/Button.svelte';
	import GenerationImage from '$components/generationImage/GenerationImage.svelte';
	import type { TGenerationImageCardType } from '$components/generationImage/types';
	import ImagePlaceholder from '$components/ImagePlaceholder.svelte';
	import LL from '$i18n/i18n-svelte';
	import {
		generationsPerPage,
		type TUserGenerationFullOutputsPage
	} from '$ts/queries/userGenerations';
	import type { CreateInfiniteQueryResult } from '@tanstack/svelte-query';
	import { MasonryInfiniteGrid } from '@egjs/svelte-infinitegrid';
	import {
		adminGalleryActionableItems,
		adminGalleryCurrentFilter,
		isAdminGalleryEditActive
	} from '$ts/stores/admin/gallery';
	import IconAnimatedSpinner from '$components/icons/IconAnimatedSpinner.svelte';
	import {
		isUserGalleryEditActive,
		userGalleryActionableItems,
		userGalleryCurrentView
	} from '$ts/stores/user/gallery';
	import { isTouchscreen } from '$ts/stores/isTouchscreen';
	import type { TGenerationFullOutput } from '$ts/stores/user/generation';
	import { fade } from 'svelte/transition';
	import { quadIn } from 'svelte/easing';

	export let generationsQuery: CreateInfiniteQueryResult<TUserGenerationFullOutputsPage, unknown>;
	export let pinnedFullOutputs: TGenerationFullOutput[] | undefined = undefined;
	export let rerenderKey: string;
	export let cardType: TGenerationImageCardType;
	export let gridClasses = 'w-full flex-1';
	export let cardWidthClasses = 'w-1/2 sm:w-1/3 lg:w-1/4 xl:w-1/5 2xl:w-1/6 3xl:w-1/7';
	export let gridScrollContainer: HTMLElement;

	let lastRerenderKey = rerenderKey;

	$: outputs = $generationsQuery.data?.pages
		? [
				...(pinnedFullOutputs ?? []),
				...$generationsQuery.data?.pages.flatMap((page) => page.outputs)
		  ]
		: undefined;
	$: items = outputs?.map((output, index) => ({
		key: index,
		id: output.id,
		groupKey: Math.floor(index / generationsPerPage)
	}));

	$: selectedItems =
		cardType === 'history' && $isUserGalleryEditActive
			? $userGalleryActionableItems
					.filter((i) => i.view === $userGalleryCurrentView)
					.map((i) => i.output_id)
			: cardType === 'admin-gallery' && $isAdminGalleryEditActive
			? $adminGalleryActionableItems
					.filter((i) => i.filter === $adminGalleryCurrentFilter)
					.map((i) => i.output_id)
			: [];
	$: isHoverAllowed =
		(cardType === 'history' && $isUserGalleryEditActive) ||
		(cardType === 'admin-gallery' && $isAdminGalleryEditActive);

	let ig: MasonryInfiniteGrid;

	$: rerenderKey, rerenderGrid();
	function rerenderGrid() {
		if (!ig) return;
		if (lastRerenderKey !== rerenderKey) {
			ig.updateItems();
			lastRerenderKey = rerenderKey;
		}
	}
</script>

{#if $generationsQuery.isInitialLoading}
	<div
		class="w-full flex flex-col text-c-on-bg/60 flex-1 py-6 px-4 justify-center items-center text-center"
	>
		<IconAnimatedSpinner class="w-12 h-12" />
		<p class="mt-2 opacity-0">{$LL.Gallery.SearchingTitle()}</p>
		<div class="h-[2vh]" />
	</div>
{:else if $generationsQuery.isSuccess && $generationsQuery.data.pages.length > 0 && outputs !== undefined && items !== undefined}
	<div class={gridClasses} bind:this={gridScrollContainer}>
		<MasonryInfiniteGrid
			scrollContainer={gridScrollContainer}
			bind:this={ig}
			{items}
			let:visibleItems
			align="center"
			threshold={3000}
			on:requestAppend={({ detail: e }) => {
				console.log('requestAppend');
				if ($generationsQuery.isFetchingNextPage) return;
				if (!$generationsQuery.hasNextPage) return;
				e.wait();
				$generationsQuery.fetchNextPage().finally(() => e.ready());
			}}
		>
			{#each visibleItems as item (item.key)}
				{@const isOutputSelected = selectedItems.includes(outputs[item.key].id)}
				{@const isOutputHoverable =
					isHoverAllowed &&
					!isOutputSelected &&
					!$isTouchscreen &&
					!(
						cardType === 'history' &&
						$isUserGalleryEditActive &&
						$userGalleryCurrentView === 'favorites' &&
						!outputs[item.key].is_favorited
					) &&
					!outputs[item.key].is_deleted}
				{@const status = outputs[item.key].status}
				<div
					style="position: absolute;left: -9999px;top: -9999px;"
					class="{cardWidthClasses} p-0.5"
				>
					<div class="w-full relative group">
						<ImagePlaceholder
							width={outputs[item.key].generation.width}
							height={outputs[item.key].generation.height}
						/>
						<div
							class="absolute left-0 top-0 w-full h-full rounded-xl bg-c-bg-secondary transition border-4 {isOutputSelected
								? 'border-c-primary'
								: 'border-c-bg-secondary'} {isOutputHoverable ? 'hover:border-c-primary/75' : ''}
										 z-0 overflow-hidden shadow-lg shadow-c-shadow/[var(--o-shadow-normal)]"
						>
							{#if outputs[item.key].generation.outputs !== undefined}
								{#if status !== 'failed' && status !== 'failed-nsfw'}
									{#if status !== undefined && status !== 'succeeded'}
										<div
											out:fade|local={{ duration: 3000, easing: quadIn }}
											class="w-full h-full absolute left-0 top-0 flex items-center justify-center"
										>
											<IconAnimatedSpinner class="w-10 h-10 text-c-on-bg/35" />
										</div>
									{/if}
									{#if status === undefined || status === 'succeeded'}
										<GenerationImage
											{cardType}
											useUpscaledImage={false}
											generation={{
												...outputs[item.key].generation,
												selected_output: outputs[item.key]
											}}
										/>
									{/if}
								{:else}
									<div class="w-full h-full flex items-center justify-center">
										<p class="text-sm text-c-on-bg/50 px-5 py-3 text-center leading-relaxed">
											{status === 'failed-nsfw'
												? $LL.Error.ImageWasNSFW()
												: $LL.Error.SomethingWentWrong()}
										</p>
									</div>
								{/if}
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</MasonryInfiniteGrid>
	</div>
	{#if $generationsQuery.hasNextPage}
		<div class="w-full flex flex-row items-center justify-center mt-6">
			<Button
				withSpinner
				size="sm"
				loading={$generationsQuery.isFetchingNextPage}
				onClick={() => $generationsQuery.fetchNextPage()}
			>
				{$LL.Shared.LoadMoreButton()}
			</Button>
		</div>
	{/if}
{/if}
