import { writable } from 'svelte/store'

export const storeAuthToken = writable<SecurityToken>(undefined)

export type SecurityToken = {
	token: string
}
