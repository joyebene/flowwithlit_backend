import http from 'k6/http';
import { check, sleep } from 'k6';

// This is the configuration for your test.
export const options = {
  stages: [
    // Ramp-up from 1 to 500 users over 30 seconds
    { duration: '30s', target: 500 },
    // Stay at 500 users for 1 minute
    { duration: '1m', target: 500 },
    // Ramp-down to 0 users over 10 seconds
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    // We want 95% of requests to be under 800ms
    http_req_duration: ['p(95)<800'],
    // We want less than 1% of requests to fail
    http_req_failed: ['rate<0.01'],
  },
};

// This is the main function that defines the behavior of a virtual user.
export default function () {
  // IMPORTANT: Replace this URL with the actual endpoint you want to test.
  const res = http.get('http://localhost:3000/api/health');

  // Check if the request was successful (status code 200)
  check(res, { 'status was 200': (r) => r.status == 200 });

  // Wait for 1 second before the next request.
  sleep(1);
}