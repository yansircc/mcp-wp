interface FetchOptions extends RequestInit {
	needsAuth?: boolean;
	params?: Record<string, string | number | string[]>;
}

/**
 * Fetches data from the WordPress REST API.
 * Handles URL construction, authentication, and basic response validation.
 *
 * @param endpoint The API endpoint path (e.g., '/wp/v2/users').
 * @param options Fetch options, including custom ones like 'needsAuth'.
 * @returns The JSON response data.
 * @throws {Error} If the fetch request fails or the response is not OK.
 */
export async function fetchWpApi<T>(
	endpoint: string,
	options: FetchOptions = {},
): Promise<T> {
	const { needsAuth = false, params, ...fetchOptions } = options;

	const url = new URL(`${process.env.WORDPRESS_API_URL}/wp-json${endpoint}`);

	// Append query parameters if provided
	if (params) {
		for (const [key, value] of Object.entries(params)) {
			if (Array.isArray(value)) {
				// Handle array parameters (e.g., roles)
				url.searchParams.append(key, value.join(","));
			} else if (value !== undefined && value !== null) {
				url.searchParams.set(key, String(value));
			}
		}
	}

	const headers = new Headers(fetchOptions.headers);

	if (needsAuth) {
		headers.set(
			"Authorization",
			`Basic ${btoa(
				`${process.env.WORDPRESS_USERNAME}:${process.env.WORDPRESS_APPLICATION_PASSWORD}`,
			)}`,
		);
	}

	if (fetchOptions.body && !headers.has("Content-Type")) {
		headers.set("Content-Type", "application/json");
	}

	const response = await fetch(url.toString(), {
		...fetchOptions,
		headers,
	});

	if (!response.ok) {
		// Attempt to get more specific error info from response body
		let errorBody = "";
		try {
			errorBody = await response.text();
		} catch (e) {
			// Ignore error reading body
		}
		throw new Error(
			`WP API Error: ${response.status} ${response.statusText} for ${url.pathname}. ${errorBody}`,
		);
	}

	// Handle cases where the response might be empty (e.g., 204 No Content)
	if (response.status === 204) {
		return null as T; // Or handle as appropriate for your use case
	}

	return response.json() as Promise<T>;
}
