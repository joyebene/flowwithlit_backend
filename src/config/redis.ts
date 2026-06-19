import { createClient } from 'redis';

// This file is temporarily modified to disable Redis and fix a TypeScript error.
// To re-enable Redis, revert this file to its original state
// and ensure your REDIS_URL is set in the .env file.

const redis: ReturnType<typeof createClient> | null = null;

export default redis;