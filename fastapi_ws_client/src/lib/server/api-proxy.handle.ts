import { error, type Handle } from '@sveltejs/kit';
import { VITE_API_PROXY_PATH, VITE_BACKEND_API_URL } from '$env/static/private';

export const handleApiProxy: Handle = async ({ event }) => {

  const origin = event.request.headers.get("Origin");

  console.log(event.request.headers );
  // reject requests that don't come from the webapp, to avoid your proxy being abused.
  // TODO: SECURITY RISK MUST BE SOLVED
  if (!origin || new URL(origin).origin !== event.url.origin) {
    throw error(403, "Request Forbidden.");
  }

  // strip `/api-proxy` from the request path
  const strippedPath = event.url.pathname.substring(VITE_API_PROXY_PATH.length);

  // build the new URL path with your API base URL, the stripped path and the query string
  const urlPath = `${VITE_BACKEND_API_URL}${strippedPath}${event.url.search}`;
  const proxiedUrl = new URL(urlPath);

  // Strip off header added by SvelteKit yet forbidden by underlying HTTP request
  // library `undici`.
  // https://github.com/nodejs/undici/issues/1470
  event.request.headers.delete("connection");

  return fetch(proxiedUrl.toString(), {
    // propagate the request method and body
    body: event.request.body,
    method: event.request.method,
    headers: event.request.headers,
  }).catch((err) => {
    console.log("Could not proxy API request: ", err);
    throw err;
  });
};