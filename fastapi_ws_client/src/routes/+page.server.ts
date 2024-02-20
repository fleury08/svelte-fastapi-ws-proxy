import { BACKEND_API_URL } from '$env/static/private';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		backend_api: BACKEND_API_URL || 'http://127.0.0.1:8001'
	};
};