/**
 * This file uses the `handle` method from `@sveltejs/kit`
 * to intercept requests to `/api-proxy` and handle them with `handleApiProxy`.
 */

import { type Handle } from '@sveltejs/kit'
import { logger } from '$lib/server/logger'

export const handle: Handle = async ({ event, resolve }) => {
	// intercept requests to `/api-proxy` and handle them with `handleApiProxy`
	// if (event.url.pathname.startsWith(VITE_API_PROXY_PATH)) {
	// 	return handleApiProxy({ event, resolve })
	// }

	const response = await resolve(event)
	logger.debug(event)
	logger.debug(response)
	return response
}
