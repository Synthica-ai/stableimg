import { env } from '$env/dynamic/public';
import { writable as writableLocal } from 'svelte-local-storage-store';

export const serverUrl = writableLocal<string | undefined>(
	'serverUrl',
	env.PUBLIC_DEFAULT_SERVER_URL ?? undefined
);
