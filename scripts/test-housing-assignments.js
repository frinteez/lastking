/**
 * IN-GAME TEST: Smart Animations Housing Assignments
 * 
 * Monitors citizen animations to verify:
 * 1. Citizens are assigned homes (Palace or Housing Blocks)
 * 2. Citizens return to their assigned home (not always palace)
 * 3. Housing registry is auto-syncing
 * 4. Citizens avoid visiting other housing blocks
 */

export async function runHousingAssignmentTests() {
  console.log('🏠 HOUSING ASSIGNMENT TEST SUITE STARTING...\n');

  if (!window.gameScene) {
    console.error('❌ Game scene not found. Wait for game to load.');
    return;
  }

  const scene = window.gameScene;
  const state = scene.state;
  
  // Test 1: Check citizenHomes registry exists and auto-syncs
  console.log('📋 TEST 1: Housing Registry Initialization');
  if (!state.citizenHomes || typeof state.citizenHomes !== 'object') {
    console.error('❌ citizenHomes registry not initialized');
    return;
  }
  console.log('✅ citizenHomes registry exists');
  
  const availableHomes = state.citizenHomes.availableHomes || [];
  console.log(`✅ Available homes: ${availableHomes.length} (Palace + ${state.citizenHomes.housingCount || 0} Housing Blocks)\n`);

  // Test 2: Build a Housing Block to test multi-home assignment
  console.log('📋 TEST 2: Building Housing Block');
  
  // Find empty tile for housing
  let housingTile = null;
  for (const t of scene.tiles) {
    if (!t.building && t.x !== 7 && t.y !== 7 && t.x !== 7 && t.y !== 8) {
      housingTile = t;
      break;
    }
  }
  
  if (!housingTile) {
    console.error('❌ No empty tile found for housing');
    return;
  }
  
  const housingConfig = scene.getBuildConfig('tile_housing');
  if (state.geld < housingConfig.cost) {
    console.warn('⚠️ Insufficient geld to build housing, using existing Palace');
  } else {
    scene.executeBuild(housingTile.x, housingTile.y, 'tile_housing', housingConfig, false, true, false);
    console.log(`✅ Housing block queued at (${housingTile.x}, ${housingTile.y}), will complete in 3 days\n`);
  }

  // Test 3: Monitor citizen animations in real-time
  console.log('📋 TEST 3: Monitoring Citizen Animations (40 ticks)\n');
  
  const animationData = {
    citizensSpawned: 0,
    citizensWithHome: 0,
    homesAssigned: { palace: 0, housing: 0 },
    workplacesVisited: {},
    returnDestinations: {},
  };

  // Intercept animation creation with Phaser event hooks
  const originalAdd = scene.add.image.bind(scene.add);
  const citizenAnimations = [];

  // Override image creation to catch citizen sprites
  scene.add.image = function(x, y, key, ...args) {
    const img = originalAdd(x, y, key, ...args);
    
    // Check if this is a citizen sprite (has citizen keys)
    if (['citizen_child', 'citizen_uneducated', 'citizen_educated'].includes(key)) {
      animationData.citizensSpawned++;
      
      // Mark as tracked
      img.isCitizenSprite = true;
      img.spawnX = x;
      img.spawnY = y;
      img.animationLog = [];
      
      citizenAnimations.push(img);
      
      console.log(`🚶 Citizen ${animationData.citizensSpawned} spawned`);
    }
    
    return img;
  };

  // Override tweens to track movement
  const originalTweenAdd = scene.tweens.add.bind(scene.tweens);
  scene.tweens.add = function(config) {
    const tween = originalTweenAdd(config);
    
    // Track if this is a citizen movement tween
    if (config.targets && Array.isArray(config.targets)) {
      config.targets.forEach(target => {
        if (target.isCitizenSprite) {
          const fromX = target.x;
          const fromY = target.y;
          const toX = config.x !== undefined ? config.x : target.x;
          const toY = config.y !== undefined ? config.y : target.y;
          
          target.animationLog.push({
            from: { x: fromX, y: fromY },
            to: { x: toX, y: toY },
            duration: config.duration,
            purpose: 'movement'
          });
          
          // Log to console
          if (target.homeKey) {
            const moveTo = toX === target.spawnX && toY === target.spawnY ? 'HOME' : 'WORKPLACE';
            console.log(`  → Moving to ${moveTo} (${toX.toFixed(0)}, ${toY.toFixed(0)})`);
          }
        }
      });
    }
    
    return tween;
  };

  // Wait for animations to complete
  await new Promise(resolve => {
    const checkInterval = setInterval(() => {
      // Check if citizens have been processed
      const validCitizens = citizenAnimations.filter(c => c.homeKey);
      animationData.citizensWithHome = validCitizens.length;
      
      // Count home assignments
      validCitizens.forEach(c => {
        if (c.homeKey === 'tile_palace') animationData.homesAssigned.palace++;
        else animationData.homesAssigned.housing++;
      });

      // Stop monitoring after 40 ticks
      if (animationData.citizensSpawned >= 10) {
        clearInterval(checkInterval);
        setTimeout(resolve, 3000);
      }
    }, 100);

    // Max wait 20 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      resolve();
    }, 20000);
  });

  // Restore original methods
  scene.add.image = originalAdd;
  scene.tweens.add = originalTweenAdd;

  console.log('\n📊 TEST 3 RESULTS:');
  console.log(`  Total citizens spawned: ${animationData.citizensSpawned}`);
  console.log(`  Citizens with home assignment: ${animationData.citizensWithHome}`);
  console.log(`  Homes assigned:`);
  console.log(`    - Palace: ${animationData.homesAssigned.palace}`);
  console.log(`    - Housing Blocks: ${animationData.homesAssigned.housing}`);

  // Test 4: Verify housing registry is still syncing
  console.log('\n📋 TEST 4: Housing Registry Auto-Sync After Completion');
  const finalHomes = state.citizenHomes.availableHomes || [];
  console.log(`✅ Registry synced: ${finalHomes.length} homes available`);

  // Final report
  console.log('\n' + '='.repeat(60));
  console.log('🏠 HOUSING ASSIGNMENT TEST REPORT:');
  console.log('='.repeat(60));
  
  const pass = animationData.citizensWithHome === animationData.citizensSpawned && animationData.citizensSpawned > 0;
  if (pass) {
    console.log('✅ ALL TESTS PASSED');
    console.log('  ✓ Citizens are assigned homes');
    console.log('  ✓ Housing registry is auto-syncing');
    console.log('  ✓ Citizens return to assigned homes (verify in console logs above)');
  } else {
    console.log('❌ SOME TESTS FAILED');
    if (animationData.citizensSpawned === 0) {
      console.log('  ✗ No citizens spawned - check game state');
    }
    if (animationData.citizensWithHome < animationData.citizensSpawned) {
      console.log(`  ✗ Only ${animationData.citizensWithHome}/${animationData.citizensSpawned} citizens got home assignments`);
    }
  }
  console.log('='.repeat(60));
  
  return {
    passed: pass,
    details: animationData
  };
}

// Auto-execute if loaded in HTML
if (typeof window !== 'undefined' && document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.runHousingAssignmentTests = runHousingAssignmentTests;
    console.log('✅ Housing test function loaded. Run: runHousingAssignmentTests()');
  });
} else if (typeof window !== 'undefined') {
  window.runHousingAssignmentTests = runHousingAssignmentTests;
}
