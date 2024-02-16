import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { websocket } from '@ubermanu/sveltekit-websocket/vite';
export default defineConfig({
	plugins: [sveltekit(), websocket()]
});
