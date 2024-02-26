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
	return {
		plugins: [
			sveltekit(),
			Icons({
				compiler: 'svelte',
				autoInstall: true
			}),
			websocket()
		],
		server: {
			cors: {
				credentials: true,
				origin: 'http://localhost:5173/'
			}
		},
		test: {
			include: ['src/**/*.{test,spec}.{js,ts}']
		}
	}
})
