export class ApiProxyTool {
	apiBaseUrl: string | URL
	options: RequestInit = {}

	constructor(apiBaseUrl: string | URL, options?: RequestInit) {
		this.apiBaseUrl = apiBaseUrl
		if (options) this.options = options
	}

	updateOptions(options: RequestInit) {
		if (!options) return
		this.options = { ...this.options, ...options }
	}

	async handle(path?: string, options?: RequestInit) {
		if (!path) return new Error('No path provided')
		return fetch(`${this.apiBaseUrl}${path}`, options ?? this.options)
	}
}

export default ApiProxyTool
