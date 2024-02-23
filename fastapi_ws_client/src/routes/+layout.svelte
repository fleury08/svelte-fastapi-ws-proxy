<script lang="ts">
	import '../app.pcss';
	import { websocket } from '@ubermanu/sveltekit-websocket/stores';
	import { storeWsConnection } from '$lib/client/stores/websocket.store';
	import { createWebSocketConnection } from '$lib/client/tools/websocket/websocket.tools';

	storeWsConnection.set(createWebSocketConnection($websocket.url));
</script>

<div class="container mx-auto">
	<slot />
</div>
