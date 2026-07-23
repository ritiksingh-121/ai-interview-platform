import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,          // 10 virtual users
  duration: '30s',  // Run for 30 seconds

  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% requests < 500ms
    http_req_failed: ['rate<0.01'],   // Error rate < 1%
  },
};

export default function () {
  const res = http.get('http://localhost:5000');

  check(res, {
    'Status is 200': (r) => r.status === 200,
  });

  sleep(1);
}