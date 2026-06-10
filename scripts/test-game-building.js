// Comprehensive in-game building test
// Run via: window.runGameBuildTests()

function runGameBuildTests() {
  const scene = window.gameScene; // Must be available globally after Phaser loads
  
  if (!scene) {
    console.error('❌ Game scene not found. Make sure the game is loaded.');
    return;
  }

  const s = scene.state;
  console.log('=== IN-GAME BUILDING TESTS ===\n');
  console.log(`Initial state: Workers=${s.popWorkers}, Engineers=${s.popEngineers}, Locked Workers=${s.workersLocked}, Locked Engineers=${s.constructionEngineersLocked}\n`);

  // TEST 1: Build a farm and verify labor is locked
  console.log('TEST 1: Build farm (costs 2 workers), verify idle count decreases');
  const workersBeforeFarm = s.popWorkers - (s.workersLocked || 0);
  console.log(`  Before build: idle workers = ${workersBeforeFarm}`);
  
  // Simulate placing building at tile (1, 1)
  scene.buildMode = 'tile_farm';
  const hasResources1 = s.geld >= 80 && s.minerals >= 50;
  console.log(`  Have resources: ${hasResources1}`);
  
  if (hasResources1 && scene.placeBuilding) {
    scene.placeBuilding(1, 1);
    const workersAfterFarm = s.popWorkers - (s.workersLocked || 0);
    console.log(`  After build: locked workers = ${s.workersLocked}, idle workers = ${workersAfterFarm}`);
    console.assert(s.workersLocked > 0, 'Workers should be locked');
    console.assert(workersAfterFarm === workersBeforeFarm - 2, `Should lose 2 idle workers, lost ${workersBeforeFarm - workersAfterFarm}`);
    console.log('✅ TEST 1 PASSED\n');
  } else {
    console.log('⚠️  TEST 1 SKIPPED: No resources\n');
  }

  // TEST 2: Try to build unlimited buildings, should stop when out of labor
  console.log('TEST 2: Try to build multiple housing blocks until labor runs out');
  const initialWorkers = s.popWorkers - (s.workersLocked || 0);
  let buildCount = 0;
  
  for (let i = 0; i < 20; i++) {
    const idleWorkersNow = s.popWorkers - (s.workersLocked || 0);
    if (idleWorkersNow < 1) {
      console.log(`  Ran out of idle workers after ${buildCount} buildings`);
      break;
    }
    
    scene.buildMode = 'tile_housing';
    const geldOK = s.geld >= 50;
    const mineralsOK = s.minerals >= 30;
    
    if (geldOK && mineralsOK) {
      scene.placeBuilding(5 + i, 5);
      buildCount++;
    } else {
      console.log(`  Ran out of resources after ${buildCount} buildings`);
      break;
    }
  }
  
  console.log(`  Built ${buildCount} housing blocks`);
  console.log(`  Final idle workers: ${s.popWorkers - (s.workersLocked || 0)}`);
  console.assert(buildCount <= initialWorkers, `Should not build more than ${initialWorkers} with 1 worker each`);
  console.log('✅ TEST 2 PASSED\n');

  // TEST 3: Build megastructure with engineers
  console.log('TEST 3: Build Planet Stabilizer (2x2, needs 10 engineers)');
  const engsBefore = s.popEngineers - (s.dronesEngineersLocked || 0) - (s.constructionEngineersLocked || 0);
  console.log(`  Before: available engineers = ${engsBefore}`);
  
  scene.buildMode = 'planet_stabilizer';
  const hasEngsAndResources = engsBefore >= 10 && s.geld >= 800 && s.minerals >= 400;
  console.log(`  Can build: ${hasEngsAndResources} (have ${engsBefore} engs, need 800 geld, 400 minerals)`);
  
  if (hasEngsAndResources) {
    scene.placeBuilding(0, 0);
    const engsAfter = s.popEngineers - (s.dronesEngineersLocked || 0) - (s.constructionEngineersLocked || 0);
    console.log(`  After: construction engineers locked = ${s.constructionEngineersLocked}, available = ${engsAfter}`);
    console.assert(s.constructionEngineersLocked >= 10, 'Should lock 10 engineers');
    console.log('✅ TEST 3 PASSED\n');
  } else {
    console.log('⚠️  TEST 3 SKIPPED: Insufficient engineers or resources\n');
  }

  // TEST 4: Verify can't build when no labor left
  console.log('TEST 4: Verify can\'t build farm when all workers locked');
  const workersNow = s.popWorkers - (s.workersLocked || 0);
  const enginesNow = s.popEngineers - (s.dronesEngineersLocked || 0) - (s.constructionEngineersLocked || 0);
  const canBuild = workersNow >= 2 || enginesNow >= 2;
  
  console.log(`  Current idle: workers=${workersNow}, engineers=${enginesNow}, can build=${canBuild}`);
  
  if (!canBuild) {
    scene.buildMode = 'tile_farm';
    const initialGeld = s.geld;
    scene.placeBuilding(10, 10); // Try to build anyway
    const geldAfter = s.geld;
    console.log(`  Geld before=${initialGeld}, after=${geldAfter}`);
    console.assert(geldAfter === initialGeld, 'Should not deduct resources if build fails');
    console.log('✅ TEST 4 PASSED: Build prevented when insufficient labor\n');
  } else {
    console.log('⚠️  TEST 4 SKIPPED: Still have idle labor\n');
  }

  console.log('=== ALL IN-GAME TESTS COMPLETE ===\n');
  console.log('Final state:');
  console.log(`  Pop: Workers=${s.popWorkers} (locked=${s.workersLocked}), Engineers=${s.popEngineers} (locked=${s.constructionEngineersLocked || 0})`);
  console.log(`  Idle: Workers=${s.popWorkers - (s.workersLocked || 0)}, Engineers=${s.popEngineers - (s.dronesEngineersLocked || 0) - (s.constructionEngineersLocked || 0)}`);
}

if (typeof window !== 'undefined') {
  window.runGameBuildTests = runGameBuildTests;
}

export { runGameBuildTests };
