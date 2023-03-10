import { eurCountryCodes } from '$ts/constants/main';
import {
	getProductIdFromPriceId,
	STRIPE_PRODUCT_IDS_SUBSCRIPTIONS,
	type TStripeSupportedCurrency
} from '$ts/constants/stripePublic';
import { getUserSummary } from '$ts/helpers/user/user';
import { getServerSession } from '@supabase/auth-helpers-sveltekit';
import { redirect, type ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async (event) => {
	const session = await getServerSession(event);
	const priceId = event.url.searchParams.get('price_id');
	const from = event.url.searchParams.get('from');
	if (!from) {
		throw redirect(302, '/pricing');
	}
	if (!session?.user.id || !priceId) {
		throw redirect(302, from);
	}
	try {
		const res = await getUserSummary(session.access_token);
		if (!res?.product_id || !res?.price_id) {
			throw redirect(302, from);
		}
		const productIdOfTargetPriceId = getProductIdFromPriceId(priceId);
		if (!productIdOfTargetPriceId) {
			throw redirect(302, from);
		}
		const indexOfCurrentProductId = STRIPE_PRODUCT_IDS_SUBSCRIPTIONS.indexOf(res.product_id);
		const indexOfTargetProductId =
			STRIPE_PRODUCT_IDS_SUBSCRIPTIONS.indexOf(productIdOfTargetPriceId);
		if (indexOfTargetProductId >= indexOfCurrentProductId) {
			throw redirect(302, from);
		}
		const countryCode = event.locals.countryCode;
		const currency: TStripeSupportedCurrency =
			countryCode && eurCountryCodes.includes(countryCode) ? 'eur' : 'usd';
		return {
			current_price_id: res.price_id,
			target_price_id: priceId,
			current_product_id: res.product_id,
			target_product_id: productIdOfTargetPriceId,
			currency
		};
	} catch (error) {
		console.log(error);
	}
	throw redirect(302, from);
};
