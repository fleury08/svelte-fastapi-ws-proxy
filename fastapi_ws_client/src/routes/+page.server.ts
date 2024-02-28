import {
	VITE_FRONTEND_API_PROXY_HOST,
	VITE_FRONTEND_API_PROXY_PATH,
	VITE_FRONTEND_API_PROXY_PROTOCOL,
	VITE_FRONTEND_WEBSOCKETS_HOST,
	VITE_FRONTEND_WEBSOCKETS_PATH,
	VITE_FRONTEND_WEBSOCKETS_PROTOCOL,
	VITE_FRONTEND_WEBSOCKETS_TIMEOUT
} from '$env/static/private'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
	return {
		api_proxy: {
			protocol: VITE_FRONTEND_API_PROXY_PROTOCOL || 'http',
			host: VITE_FRONTEND_API_PROXY_HOST || 'localhost',
			path: VITE_FRONTEND_API_PROXY_PATH || '/api'
		},
		ws: {
			protocol: VITE_FRONTEND_WEBSOCKETS_PROTOCOL || 'ws',
			host: VITE_FRONTEND_WEBSOCKETS_HOST || 'localhost',
			path: VITE_FRONTEND_WEBSOCKETS_PATH || '/ws',
			timeout: Number.parseInt(VITE_FRONTEND_WEBSOCKETS_TIMEOUT) || 30000
		}
	}
}
