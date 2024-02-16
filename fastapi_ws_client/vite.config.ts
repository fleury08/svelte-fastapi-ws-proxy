import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { websocket } from '@ubermanu/sveltekit-websocket/vite';
import Icons from 'unplugin-icons/vite';
export default defineConfig({
	plugins: [
		sveltekit(),
		websocket(),
		Icons({
			compiler: 'svelte'
		})
	]
});
