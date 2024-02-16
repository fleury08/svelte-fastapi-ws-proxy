import { writable } from 'svelte/store';

export const storeConnected = writable<boolean>(false);
export const storeWsMessages = writable<string[]>([]);

export const storeWsConnection = writable<WebSocket | null>(null);
