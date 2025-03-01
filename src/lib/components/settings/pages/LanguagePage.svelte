<script lang="ts">
	import DropdownItem from '$components/DropdownItem.svelte';
	import IconLocale from '$components/icons/IconLocale.svelte';
	import ScrollAreaWithChevron from '$components/ScrollAreaWithChevron.svelte';
	import { locale, setLocale } from '$i18n/i18n-svelte';
	import { isLocale, locales } from '$i18n/i18n-util';
	import { loadLocaleAsync } from '$i18n/i18n-util.async';
	import { modalCloseDelay } from '$ts/constants/main';
	import { languageName } from '$ts/helpers/language';
	import { isTouchscreen } from '$ts/stores/isTouchscreen';
	import { localeLS } from '$ts/stores/localeLS';
	import type { TCurrentSettingsPage } from '$ts/types/main';

	export let closeSettings: () => void;
	export let height: number | undefined;
	export let currentPage: TCurrentSettingsPage;

	const switchToLocale = async (loc: Locales) => {
		if (!isLocale(loc) || (loc === $locale && loc === $localeLS)) return;
		await loadLocaleAsync(loc);
		setLocale(loc);
		localeLS.set(loc);
		document.querySelector('html')?.setAttribute('lang', loc);
	};
</script>

<ScrollAreaWithChevron
	bind:clientHeight={height}
	class="w-full flex flex-col justify-start max-h-[50vh] 
	shadow-settings-page shadow-c-shadow/[var(--o-shadow-stronger)] rounded-b-xl"
>
	<div class="w-full bg-c-bg-secondary flex flex-col justify-start">
		{#each locales as locale}
			<DropdownItem
				padding="lg"
				disabled={currentPage === 'settings'}
				onClick={async () => {
					await switchToLocale(locale);
					setTimeout(() => {
						closeSettings();
					}, modalCloseDelay);
				}}
			>
				<div class="flex-1 min-w-0 flex items-center overflow-hidden gap-3">
					<div class="w-5 h-5 rounded-sm overflow-hidden">
						<IconLocale {locale} class="w-full h-full" />
					</div>
					<p
						class="flex-1 min-w-0 overflow-hidden overflow-ellipsis whitespace-nowrap text-left
           transition text-c-on-bg {!$isTouchscreen ? 'group-hover:text-c-primary' : ''}"
					>
						{languageName(locale).of(locale)}
					</p>
				</div>
			</DropdownItem>
		{/each}
	</div>
</ScrollAreaWithChevron>
