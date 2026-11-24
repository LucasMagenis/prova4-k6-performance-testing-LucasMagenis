import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/latest/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import http from 'k6/http';
import { check } from 'k6';
import { Trend, Rate } from 'k6/metrics';

export const getContactsDuration = new Trend('get_contacts', true);
export const RateContentOK = new Rate('content_OK');

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.25'],
    get_contacts: ['p(90)<6800']
  },
  vus: 7,
  stages: [
    { duration: '30s', target: 7 },
    { duration: '60s', target: 46 },
    { duration: '60s', target: 92 },
    { duration: '60s', target: 92 }
  ]
};

export function handleSummary(data) {
  return {
    './src/output/index.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true })
  };
}

export default function () {
  const baseUrl = 'https://dummyjson.com/products';

  const params = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const OK = 200;

  const res = http.get(baseUrl, params);

  if (__ITER === 0) {
    console.log(`Status: ${res.status}`);
    console.log(`Erro: ${res.error}`);
    console.log(`Código do erro: ${res.error_code}`);
    console.log(`Resposta: ${String(res.body).slice(0, 300)}`);
  }

  getContactsDuration.add(res.timings.duration);

  RateContentOK.add(res.status === OK);

  check(res, {
    'GET Contacts - Status 200': () => res.status === OK
  });
}
