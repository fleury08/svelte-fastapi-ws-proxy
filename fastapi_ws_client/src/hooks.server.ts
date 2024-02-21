/**
 * This file uses the `handle` method from `@sveltejs/kit`
 * to intercept requests to `/api-proxy` and handle them with `handleApiProxy`.
 */

import { type Handle } from '@sveltejs/kit';
import { VITE_API_PROXY_PATH } from '$env/static/private';
import { handleApiProxy } from '$lib/server/api-proxy.handle';


export const handle: Handle = async ({ event, resolve }) => {
	// intercept requests to `/api-proxy` and handle them with `handleApiProxy`
  if (event.url.pathname.startsWith(VITE_API_PROXY_PATH)) {
    return handleApiProxy({ event, resolve });
  }

	return resolve(event);
};