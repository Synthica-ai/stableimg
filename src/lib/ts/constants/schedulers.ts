import LL from '$i18n/i18n-svelte';
import type { TTab } from '$ts/types/main';
import { derived, type Readable } from 'svelte/store';

export const schedulerIdToSchedulerNameCog = {
	'55027f8b-f046-4e71-bc51-53d5448661e0': 'K_LMS',
	'6fb13b76-9900-4fa4-abf8-8f843e034a7f': 'K_EULER',
	'af2679a4-dbbb-4950-8c06-c3bb15416ef6': 'K_EULER_ANCESTRAL',
	'9d175114-9a26-4371-861c-729ba9ecb4da': 'DPM++_2M',
	'7e98751f-e135-4206-b855-48b141e7b98f': 'DPM++_2S'
} as const;

export const schedulerIdDefault: TAvailableSchedulerId = '6fb13b76-9900-4fa4-abf8-8f843e034a7f';

export const availableSchedulerIds = Object.keys(
	schedulerIdToSchedulerNameCog
) as TAvailableSchedulerId[];

export const schedulerIdToDisplayName = derived<
	[Readable<TranslationFunctions>],
	Record<TAvailableSchedulerId, string>
>([LL], ([$LL]) => {
	// @ts-ignore
	let obj: Record<TAvailableSchedulerId, string> = {};
	for (const schedulerId in schedulerIdToSchedulerNameCog) {
		obj[schedulerId as TAvailableSchedulerId] =
			$LL.Shared.SchedulerOptions[schedulerId as TAvailableSchedulerId].realName();
	}
	return obj;
});

export const availableSchedulerIdDropdownItems = derived(
	[schedulerIdToDisplayName],
	([$schedulerIdToDisplayName]) => {
		const items: TTab<TAvailableSchedulerId>[] = [
			{
				label: $schedulerIdToDisplayName['55027f8b-f046-4e71-bc51-53d5448661e0'],
				value: '55027f8b-f046-4e71-bc51-53d5448661e0'
			},
			{
				label: $schedulerIdToDisplayName['6fb13b76-9900-4fa4-abf8-8f843e034a7f'],
				value: '6fb13b76-9900-4fa4-abf8-8f843e034a7f'
			},
			{
				label: $schedulerIdToDisplayName['af2679a4-dbbb-4950-8c06-c3bb15416ef6'],
				value: 'af2679a4-dbbb-4950-8c06-c3bb15416ef6'
			},
			{
				label: $schedulerIdToDisplayName['9d175114-9a26-4371-861c-729ba9ecb4da'],
				value: '9d175114-9a26-4371-861c-729ba9ecb4da'
			},
			{
				label: $schedulerIdToDisplayName['7e98751f-e135-4206-b855-48b141e7b98f'],
				value: '7e98751f-e135-4206-b855-48b141e7b98f'
			}
		];
		return items;
	}
);

export type TAvailableSchedulerId = keyof typeof schedulerIdToSchedulerNameCog;
export type TSchedulerNameCog = typeof schedulerIdToSchedulerNameCog[TAvailableSchedulerId];
