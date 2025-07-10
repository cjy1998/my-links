import { request } from '@umijs/max';

export async function get_github(params: any, options?: Record<string, any>) {
    return request('/api/system/user/me', {
        method: 'GET',
        params: {
            ...params,
        },
        headers: {
            isToken: false,
        },
        ...(options || {}),
    });
}