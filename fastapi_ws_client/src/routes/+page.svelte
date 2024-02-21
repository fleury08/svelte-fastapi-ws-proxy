<script lang="ts">
  import { storeConnected, storeWsConnection, storeWsMessages } from '$lib/stores/websocket.store.js';
  import { closeWebSocketConnection, createWebSocketConnection } from '$lib/middleware/websocket.tools';
  import { P, Toolbar, ToolbarButton } from 'flowbite-svelte';
  import Disconnect from "~icons/mdi/lan-disconnect";
 	import { websocket } from '@ubermanu/sveltekit-websocket/stores';
  import Connect from "~icons/mdi/lan-connect";
  import Random from "~icons/mdi/shuffle";
  import Broadcast from "~icons/mdi/broadcast";
  import type {PageData} from './$types';

  export let data: PageData;

  function disconnect(){
    if($storeWsConnection) closeWebSocketConnection($storeWsConnection);
  }

  function connect(){
    if(!$storeWsConnection) storeWsConnection.set(createWebSocketConnection($websocket.url, data.ws_timeout));
  }

  function broadcast(){
    const url = `${data.api_proxy}/message`
    fetch(url,{
      mode: 'cors'
    })
  }

  function setRandomToken(){
    const url = `${data.api_proxy}/set-token`
    fetch(url)
  }
</script>



<div class="text-4xl head">WebSockets test</div>

<Toolbar>
  <ToolbarButton class="flex gap-2" on:click={setRandomToken} variant="outline" color="red"><Random /> Set Random Token</ToolbarButton>
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

