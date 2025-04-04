import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		WORDPRESS_API_URL: z.string().url(),
		WORDPRESS_USERNAME: z.string().min(1),
		WORDPRESS_APPLICATION_PASSWORD: z.string().min(1),
	},

	/**
	 * The prefix that client-side variables must have. This is enforced both at
	 * a type-level and at runtime.
	 */
	clientPrefix: "PUBLIC_",

	client: {},

	/**
	 * What object holds the environment variables at runtime. This is usually
	 * `process.env` or `import.meta.env`.
	 */
	runtimeEnv: {
		WORDPRESS_API_URL: process.env.WORDPRESS_API_URL,
		WORDPRESS_USERNAME: process.env.WORDPRESS_USERNAME,
		WORDPRESS_APPLICATION_PASSWORD: process.env.WORDPRESS_APPLICATION_PASSWORD,
	},
	/**
	 * By default, this library will feed the environment variables directly to
	 * the Zod validator.
	 *
	 * This means that if you have an empty string for a value that is supposed
	 * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
	 * it as a type mismatch violation. Additionally, if you have an empty string
	 * for a value that is supposed to be a string with a default value (e.g.
	 * `DOMAIN=` in an ".env" file), the default value will never be applied.
	 *
	 * In order to solve these issues, we recommend that all new projects
	 * explicitly specify this option as true.
	 */
	emptyStringAsUndefined: true,
});
