export class ApiProxyTool {
	apiBaseUrl: string | URL
	options: RequestInit | undefined

	constructor(apiBaseUrl: string | URL, options?: RequestInit) {
		this.apiBaseUrl = apiBaseUrl
		if (options) this.options = options
	}

	handle(path?: string) {
		if (!path) return Promise.reject('No path provided')
		return fetch(`${this.apiBaseUrl}${path}`, this.options).then((res) => res.json())
	}
}

export default {}
