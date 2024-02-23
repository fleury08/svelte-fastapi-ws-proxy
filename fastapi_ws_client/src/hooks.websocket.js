/**
 * This hook file is used by plugin `@ubermanu/sveltekit-tools`
 * Creates tools connection with browser/client
 * Connection then
 * Client connection is  wrapped in `WebSocketMiddleman`
 *
 */

import { v4 as uuidv4 } from 'uuid'
import { WebSocketMiddleman } from './lib/client/tools/websocket/websockets-middleman.js'
import cookie from 'cookie'

/** @type {import('@ubermanu/sveltekit-websocket').Handle} */
export const handle = async ({ socket, request }) => {
	const backendWebsocketsURL = process.env.VITE_BACKEND_WEBSOCKETS_URL
	const cookieObject = cookie.parse(request.headers.cookie || '')
	const authToken = authTokenHandle(JSON.stringify(cookieObject)) //todo: aktivni token soucasti dotazu na server;

	if (authToken && backendWebsocketsURL) {
		const sessionId = uuidv4()
		const backendConnection = new WebSocketMiddleman(socket, backendWebsocketsURL, sessionId)

		backendConnection.connectToWs()

		socket.on('close', () => {
			console.log(`Closed Frontend WS connection ${sessionId}`)
			backendConnection.terminate()
		})

		socket.on('error', (e) => {
			console.log(e)
			backendConnection.terminate()
		})
		return
	}

	console.log('Websockets needs token!')
	socket.close()
}

/**
 *
 * @param token {string}
 * @returns {boolean}
 */
function authTokenHandle(token) {
	return !!token
}
