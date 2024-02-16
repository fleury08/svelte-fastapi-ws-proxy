<script lang="ts">
 import { storeConnected, storeWsMessages } from '$lib/stores/websockets.store.js';

</script>

<div class="text-4xl head">WebSockets test</div>

<p>
  Websocket connection status: {$storeConnected ? '🟢' : '🔴'}
</p>
<ul>
  {#each $storeWsMessages as message}
    <li><pre>{message}</pre></li>
  {/each}
</ul>

