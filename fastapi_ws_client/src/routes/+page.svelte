<script lang="ts">
  import { storeConnected, storeWsConnection, storeWsMessages } from '$lib/stores/websockets.store.js';
  import { closeWebSocketConnection, createWebSocketConnection } from '$lib/middleware/websocket.tools';
  import { P, Toolbar, ToolbarButton } from 'flowbite-svelte';
  import Disconnect from "~icons/mdi/lan-disconnect";
  import Connect from "~icons/mdi/lan-connect";
  function disconnect(){
    if($storeWsConnection)
      closeWebSocketConnection($storeWsConnection);
  }

  function connect(){
    if(!$storeWsConnection)
      storeWsConnection.set(createWebSocketConnection($storeWsConnection));
  }
</script>



<div class="text-4xl head">WebSockets test</div>

<Toolbar>
  <ToolbarButton class="flex gap-2" on:click={connect} variant="outline" color="red"><Connect /> Connect</ToolbarButton>
  <ToolbarButton class="flex gap-2" on:click={disconnect} variant="outline" color="red"><Disconnect /> Disconnect</ToolbarButton>
</Toolbar>

<P>
  Websocket connection status: {$storeConnected ? '🟢' : '🔴'}
</P>


<ul>
  {#each $storeWsMessages as message}
    <li><pre>{message}</pre></li>
  {/each}
</ul>

