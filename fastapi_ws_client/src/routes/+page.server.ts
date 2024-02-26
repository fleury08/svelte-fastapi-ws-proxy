import { VITE_API_PROXY_PATH, VITE_FRONTEND_WEBSOCKETS_TIMEOUT } from '$env/static/private'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
	return {
		api_proxy: VITE_API_PROXY_PATH || '/api-proxy',
		ws_timeout: Number.parseInt(VITE_FRONTEND_WEBSOCKETS_TIMEOUT) || 30000
	}
}
