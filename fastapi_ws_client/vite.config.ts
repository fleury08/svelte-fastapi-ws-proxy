import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vitest/config'
import Icons from 'unplugin-icons/vite'
import { loadEnv, type ProxyOptions } from 'vite'

export default defineConfig(({ mode }) => {
	/* IMPORTANT: Load env variables from .env file
	 * Plugins do not work without this, in this case Websocket plugin
	 * won't load any svelte env variables from .env file
	 */
	const env = loadEnv(mode, process.cwd(), '')
	const proxyServerConfig: Record<string, string | ProxyOptions> = {}

	const wsFrontendPath = env.VITE_FRONTEND_WEBSOCKETS_PATH ?? '/ws'

	const wsTargetProtocol = env.VITE_BACKEND_WEBSOCKETS_PROTOCOL ?? 'http'
	const wsTargetHost = env.VITE_BACKEND_WEBSOCKETS_HOST ?? 'localhost:8000'
	const wsTargetPath = env.VITE_BACKEND_WEBSOCKETS_PATH ?? '/ws'
	const wsTargetUrl = `${wsTargetProtocol}://${wsTargetHost}${wsTargetPath}`

	const apiProxyFrontendPath = env.VITE_FRONTEND_API_PROXY_PATH ?? '/api'

	const apiProxyTargetProtocol = env.VITE_BACKEND_API_PROTOCOL ?? 'http'
	const apiProxyTargetHost = env.VITE_BACKEND_API_HOST ?? 'localhost:8000'
	const apiProxyTargetPath = env.VITE_BACKEND_API_PATH ?? '/api'
	const apiProxyTargetUrl = `${apiProxyTargetProtocol}://${apiProxyTargetHost}${apiProxyTargetPath}`
	//const wsUrl = env.VITE_BACKEND_WEBSOCKETS_URL ?? 'ws://localhost:8000'

	proxyServerConfig[apiProxyFrontendPath] = {
		target: apiProxyTargetUrl,
		changeOrigin: true,
		secure: true,
		rewrite: (path: string) => path.replace(apiProxyFrontendPath, '')
	}

	proxyServerConfig[wsFrontendPath] = {
		target: wsTargetUrl,
		ws: true,
		changeOrigin: true,
		secure: true,
		rewrite: (path: string) => path.replace(/^\/ws/, '')
	}

	console.log(proxyServerConfig)
	return {
		plugins: [
			sveltekit(),
			Icons({
				compiler: 'svelte',
				autoInstall: true
			})
			// websocket()
		],
		server: {
			proxy: proxyServerConfig
		},
		test: {
			include: ['src/**/*.{test,spec}.{js,ts}']
		}
	}
})
