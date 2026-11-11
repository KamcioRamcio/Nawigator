/** Message for a failed fetch: the API's {error} / first validation error, else the HTTP status. */
export async function apiError(response) {
    const body = await response.json().catch(() => ({}));
    return body.error || body.errors?.[0]?.msg || `Błąd serwera (${response.status})`;
}
