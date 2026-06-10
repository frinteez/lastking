import { spawn } from 'child_process';
import { getEnrollmentCount, getTotalPopulation } from '../src/game/educationHelpers.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

async function waitForServer(url, timeoutMs = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (res.ok) return;
    } catch (err) {
      // ignore until server is available
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`Timed out waiting for server at ${url}`);
}

async function runTests() {
  console.log('Starting education self-tests...');

  const server = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '4173'], {
    cwd: process.cwd(),
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  server.stdout.on('data', (chunk) => process.stdout.write(chunk.toString()));
  server.stderr.on('data', (chunk) => process.stderr.write(chunk.toString()));

  try {
    await waitForServer('http://127.0.0.1:4173');
    console.log('Server is up on http://127.0.0.1:4173');

    // Logic tests
    const sampleState = {
      popChildren: 3,
      popWorkers: 2,
      popEngineers: 1,
      schoolEnrollments: [{ qty: 2, daysRemaining: 5 }],
      academyEnrollments: [{ qty: 1, daysRemaining: 7 }],
      popCap: 10,
    };

    assert(getEnrollmentCount(sampleState.schoolEnrollments) === 2, 'School enrollment count should include batch qty');
    assert(getEnrollmentCount(sampleState.academyEnrollments) === 1, 'Academy enrollment count should include batch qty');
    assert(getTotalPopulation(sampleState) === 6, 'Total population should not double-count queued trainees');

    const cappedState = {
      popChildren: 5,
      popWorkers: 3,
      popEngineers: 2,
      schoolEnrollments: [{ qty: 4, daysRemaining: 1 }],
      academyEnrollments: [],
      popCap: 14,
    };
    assert(getTotalPopulation(cappedState) === 10, 'Total population should remain actual people and not exceed cap because of queued trainees');

    const homepage = await fetch('http://127.0.0.1:4173').then((res) => res.text());
    assert(homepage.includes('id="education-school-section"'), 'Education modal should include school section ID');
    assert(homepage.includes('id="education-academy-section"'), 'Education modal should include academy section ID');
    assert(homepage.includes('id="education-header-title"'), 'Education modal should include header title ID');

    console.log('All education self-tests passed.');
  } finally {
    server.kill('SIGINT');
  }
}

runTests().catch((error) => {
  console.error(error);
  process.exit(1);
});
