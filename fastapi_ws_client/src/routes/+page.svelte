<script lang="ts">
	import { storeConnected, storeWsConnection, storeWsMessages } from '$lib/client/stores/websocket.store.js'
	import { closeWebSocketConnection, createWebSocketConnection } from '$lib/client/tools/websocket/websocket.tools'
	import { Activity, ActivityItem, type ActivityType, P, Toolbar, ToolbarButton } from 'flowbite-svelte'
	import Disconnect from '~icons/mdi/lan-disconnect'
	import { websocket } from '@ubermanu/sveltekit-websocket/stores'
	import Connect from '~icons/mdi/lan-connect'
	import Random from '~icons/mdi/shuffle'
	import Broadcast from '~icons/mdi/broadcast'
	import type { PageData } from './$types'
	import moment from 'moment'
	import { onMount } from 'svelte'
	import { ApiProxyTool } from '$lib/client/tools/api-proxy/api-proxy.tools'
	import { type SecurityToken, storeAuthToken } from '$lib/client/stores/security.store'


	export let data: PageData
	// let wsEndpoints: string[] = []
	let apiProxyTool: ApiProxyTool

	let apiActivities: ActivityType[] = []

	onMount(async () => {
		apiProxyTool = new ApiProxyTool(data.api_proxy,{
			credentials: "same-origin",
			mode: 'same-origin',
			cache: 'no-cache'
		})
		// wsEndpoints = await fetch(`${data.api_proxy}/endpoints`).then(res => res.json()) || []
	})

	function disconnect() {
		if ($storeWsConnection) closeWebSocketConnection()
	}

	function connect() {
		if (!$storeWsConnection) storeWsConnection.set(createWebSocketConnection($websocket.url, data.ws_timeout))
	}

	async function apiProxyAction(event: Event, callback?: CallableFunction) {
		const target: HTMLElement = event?.currentTarget as HTMLElement
		const action = target?.getAttribute('data-action') || undefined
		const apiResponse = await apiProxyTool.handle(action).catch(e=>e).then(r=>r.json())
		if(callback) callback(apiResponse)
		apiActivities = [{
			title: action || 'No action',
			date: new Date(),
			text: JSON.stringify(apiResponse, null, 2),
			src: '',
			alt: ''
		}, ...apiActivities]
	}

  function setSecurityToken(securityToken: SecurityToken) {
		if (!securityToken || !securityToken.token) return
		//TODO: typecheck before update
		storeAuthToken.set(securityToken)
		apiProxyTool.updateOptions({headers: {Authorization: `Bearer ${securityToken.token}`}})
		}

	$: wsActivities = $storeWsMessages.map((msg): ActivityType => {
		return {
			title: msg.message,
			date: moment(msg.timestamp).format("LLL"),
			text: msg?.raw ? JSON.stringify(JSON.parse(msg.raw), null, 2) : "",
			src: '',
			alt: ''
		}
	})

</script>


<div class="flex flex-col gap-3">
	<Toolbar class="flex w-100 sticky top-0 shadow z-10">
		<P>
			Websocket connection status: {$storeConnected ? '🟢' : '🔴'}
		</P>

		<ToolbarButton class="flex gap-2" on:click={(event)=>apiProxyAction(event, setSecurityToken)} data-action="/random-token" variant="outline"
									 color="red">

			<Random />
			Get Random Token
		</ToolbarButton>
		<ToolbarButton class="flex gap-2" on:click={connect} variant="outline" color="red">
			<Connect />
			Connect
		</ToolbarButton>
		<ToolbarButton class="flex gap-2" on:click={disconnect} variant="outline" color="red">
			<Disconnect />
			Disconnect
		</ToolbarButton>
		<ToolbarButton class="flex gap-2" on:click={apiProxyAction} data-action="/message" variant="outline" color="red">
			<Broadcast />
			Test Broadcast
		</ToolbarButton>
	</Toolbar>

	<!--	<pre>{JSON.stringify(wsEndpoints, null, 2)}</pre>-->
	<div class="grid grid-cols-2 gap-3 w-100 ">
		<div class="flex flex-col gap-3">
			<div class="h1">WS Activity</div>
			<Activity class="p-4 w-100">
				<ActivityItem activities={wsActivities} />
			</Activity>
		</div>
		<div class="flex flex-col gap-3">
			<div class="h1">API Activity</div>
			<Activity class="p-4 w-100">
				<ActivityItem activities={apiActivities} />
			</Activity>
		</div>
	</div>
</div>