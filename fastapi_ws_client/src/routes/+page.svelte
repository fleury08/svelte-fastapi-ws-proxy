<script lang="ts">
  import { storeConnected, storeWsConnection, storeWsMessages } from '$lib/stores/websockets.store.js';
  import { closeWebSocketConnection, createWebSocketConnection } from '$lib/middleware/websocket.tools';
  import { P, Toolbar, ToolbarButton } from 'flowbite-svelte';
  import Disconnect from "~icons/mdi/lan-disconnect";
 	import { websocket } from '@ubermanu/sveltekit-websocket/stores';
  import Connect from "~icons/mdi/lan-connect";
  import Broadcast from "~icons/mdi/broadcast";
  function disconnect(){
    if($storeWsConnection) closeWebSocketConnection($storeWsConnection);
  }

  function connect(){
    if(!$storeWsConnection) storeWsConnection.set(createWebSocketConnection($websocket.url));
  }

  function broadcast(){
    fetch(`http://localhost:8000/test`)
  }
</script>



<div class="text-4xl head">WebSockets test</div>

<Toolbar>
  <ToolbarButton class="flex gap-2" on:click={connect} variant="outline" color="red"><Connect /> Connect</ToolbarButton>
  <ToolbarButton class="flex gap-2" on:click={disconnect} variant="outline" color="red"><Disconnect /> Disconnect</ToolbarButton>
  <ToolbarButton class="flex gap-2" on:click={broadcast} variant="outline" color="red"><Broadcast /> Test Broadcast</ToolbarButton>
</Toolbar>

<P>
  Websocket connection status: {$storeConnected ? '🟢' : '🔴'}
</P>


<ul>
  {#each $storeWsMessages as message}
    <li><pre>{message}</pre></li>
  {/each}
</ul>

