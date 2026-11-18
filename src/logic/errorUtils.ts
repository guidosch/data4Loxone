import { isAxiosError } from 'axios';

/**
 * One-line description of an (axios) error for logging.
 *
 * Never JSON.stringify an AxiosError: it contains the full request config,
 * incl. Authorization headers (Bearer tokens, basic auth) and secrets.
 */
export function describeError(error: unknown): string {
    if (isAxiosError(error)) {
        const method = error.config?.method?.toUpperCase() ?? '';
        const url = (error.config?.baseURL ?? '') + (error.config?.url ?? '');
        if (error.response) {
            const body = error.response.data;
            const detail = body && typeof body === 'object' ? ' ' + truncate(JSON.stringify(body)) : '';
            return `${method} ${url} -> ${error.response.status} ${error.response.statusText ?? ''}${detail}`.trim();
        }
        return `${method} ${url} -> ${error.code ?? 'no response'}: ${error.message}`.trim();
    }
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
}

function truncate(text: string, max = 200): string {
    return text.length > max ? text.substring(0, max) + '…' : text;
}
