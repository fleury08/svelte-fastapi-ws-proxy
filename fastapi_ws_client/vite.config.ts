import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vitest/config'
import { websocket } from '@ubermanu/sveltekit-websocket/vite'
import Icons from 'unplugin-icons/vite'
import { loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
	/* IMPORTANT: Load env variables from .env file
	 * Plugins do not work without this, in this case Websocket plugin
	 * won't load any svelte env variables from .env file
	 */
	process.env = { ...process.env, ...loadEnv(mode, process.cwd()) }
	const apiProxyConfig = {}
	apiProxyConfig[process.env.VITE_API_PROXY_PATH] = {
		target: process.env.VITE_BACKEND_API_URL,
		changeOrigin: true,
		secure: true,
		rewrite: (path) => path.replace(process.env.VITE_API_PROXY_PATH, '')
	}
	const define = {
		plugins: [
			sveltekit(),
			Icons({
				compiler: 'svelte',
				autoInstall: true
			}),
			websocket()
		],
		server: {
			proxy: apiProxyConfig
		},
		test: {
			include: ['src/**/*.{test,spec}.{js,ts}']
		}
	}
	console.log(define)
	return define
})
