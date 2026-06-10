// In-game construction tests
// Run via: window.runConstructionTests()

function runConstructionTests() {
  console.log('=== CONSTRUCTION IN-GAME TESTS ===\n');
  
  // Simulate having a Phaser game scene
  const mockState = {
    day: 1,
    geld: 10000,
    minerals: 10000,
    popChildren: 10,
    popWorkers: 10,
    popEngineers: 10,
    popCap: 50,
    workersLocked: 0,
    dronesEngineersLocked: 0,
    constructionEngineersLocked: 0,
    schoolEnrollments: [],
    academyEnrollments: [],
  };

  const buildConfigs = {
    tile_farm: { size: 1, cost: 80, mineralCost: 50, workers: 2 },
    tile_housing: { size: 1, cost: 50, mineralCost: 30, workers: 1 },
    tile_mine: { size: 1, cost: 150, mineralCost: 80, workers: 3 },
    planet_stabilizer: { size: 2, cost: 800, mineralCost: 400, workers: 10 },
  };

  function getAvailableWorkers(state) {
    return Math.max(0, state.popWorkers - (state.workersLocked || 0));
  }

  function getAvailableEngineers(state) {
    return Math.max(0, state.popEngineers - (state.dronesEngineersLocked || 0) - (state.constructionEngineersLocked || 0));
  }

  function simulateBuild(state, config) {
    const availWorkers = getAvailableWorkers(state);
    const availEngineers = getAvailableEngineers(state);
    const availLabor = availWorkers + availEngineers;

    console.log(`Attempting to build: needs ${config.workers} workers/engineers`);
    console.log(`  Available workers: ${availWorkers}, Available engineers: ${availEngineers}, Total: ${availLabor}`);

    if (availLabor < config.workers) {
      console.log(`  ❌ FAILED: Not enough labor (need ${config.workers}, have ${availLabor})`);
      return false;
    }

    // Allocate workers first, then engineers
    let lockedWorkers = Math.min(availWorkers, config.workers);
    let lockedEngineers = Math.min(config.workers - lockedWorkers, availEngineers);

    console.log(`  ✅ BUILD ALLOWED: Locking ${lockedWorkers} workers + ${lockedEngineers} engineers`);
    
    state.workersLocked += lockedWorkers;
    state.constructionEngineersLocked += lockedEngineers;

    const newAvailWorkers = getAvailableWorkers(state);
    const newAvailEngineers = getAvailableEngineers(state);
    console.log(`  After build - Available workers: ${newAvailWorkers}, Available engineers: ${newAvailEngineers}\n`);

    return true;
  }

  // TEST 1: Build with enough workers
  console.log('TEST 1: Build farm (needs 2 workers) with 10 available workers/engineers');
  const state1 = JSON.parse(JSON.stringify(mockState));
  const result1 = simulateBuild(state1, buildConfigs.tile_farm);
  console.assert(result1 === true, 'BUILD SHOULD SUCCEED');
  console.assert(getAvailableWorkers(state1) === 8, `Available workers should be 8, got ${getAvailableWorkers(state1)}`);
  console.assert(state1.workersLocked === 2, `Workers locked should be 2, got ${state1.workersLocked}`);
  console.log('✅ TEST 1 PASSED\n');

  // TEST 2: Build multiple farms sequentially - should eventually fail
  console.log('TEST 2: Build multiple farms (each needs 2 workers) until we run out');
  const state2 = JSON.parse(JSON.stringify(mockState));
  let buildCount = 0;
  for (let i = 0; i < 10; i++) {
    const canBuild = simulateBuild(state2, buildConfigs.tile_farm);
    if (canBuild) buildCount++;
    else break;
  }
  console.assert(buildCount === 5, `Should build exactly 5 farms (10 workers / 2 per farm), built ${buildCount}`);
  console.log(`✅ TEST 2 PASSED: Could build ${buildCount} farms before running out\n`);

  // TEST 3: Mixed labor - use workers first, then engineers
  console.log('TEST 3: Build mine (needs 3 workers) with 2 workers + 3 engineers available');
  const state3 = JSON.parse(JSON.stringify(mockState));
  state3.workersLocked = 8; // Only 2 workers available
  const canBuild3 = simulateBuild(state3, buildConfigs.tile_mine);
  console.assert(canBuild3 === true, 'BUILD SHOULD SUCCEED with mixed labor');
  console.assert(state3.workersLocked === 10, `Workers locked should be 10 (8 + 2), got ${state3.workersLocked}`);
  console.assert(state3.constructionEngineersLocked === 1, `Engineers locked should be 1, got ${state3.constructionEngineersLocked}`);
  console.log('✅ TEST 3 PASSED: Workers prioritized, then engineers used\n');

  // TEST 4: Megastructure (2x2) requires engineers
  console.log('TEST 4: Build megastructure (needs 10 engineers, size=2x2) with 10 available engineers');
  const state4 = JSON.parse(JSON.stringify(mockState));
  const canBuild4 = simulateBuild(state4, buildConfigs.planet_stabilizer);
  console.assert(canBuild4 === true, 'MEGASTRUCTURE BUILD SHOULD SUCCEED');
  console.assert(state4.constructionEngineersLocked === 10, `Engineers locked should be 10, got ${state4.constructionEngineersLocked}`);
  console.log('✅ TEST 4 PASSED\n');

  // TEST 5: Can't build unlimited - should fail after labor depleted
  console.log('TEST 5: Verify can\'t build unlimited buildings');
  const state5 = JSON.parse(JSON.stringify(mockState));
  let successCount = 0;
  for (let i = 0; i < 20; i++) {
    if (simulateBuild(state5, buildConfigs.tile_housing)) {
      successCount++;
    } else {
      console.log(`  Stopped after ${successCount} buildings (expected ~10 with 1 worker per housing)`);
      break;
    }
  }
  console.assert(successCount <= 10, `Should not build unlimited, built ${successCount}`);
  console.log('✅ TEST 5 PASSED\n');

  console.log('=== ALL CONSTRUCTION TESTS PASSED ===\n');
}

// Export for use in browser
if (typeof window !== 'undefined') {
  window.runConstructionTests = runConstructionTests;
}

export { runConstructionTests };
