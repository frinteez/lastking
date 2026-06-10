/**
 * DIRECT CITIZEN MONITOR
 * Real-time observation of citizen spawning and home assignments
 * Run this to see where citizens go as they spawn
 */

export function startCitizenMonitor() {
  console.log('👀 CITIZEN MONITOR STARTED - Real-time observation');
  console.log('Watch console as citizens spawn to see home assignments\n');

  if (!window.gameScene) {
    console.error('❌ Game scene not found');
    return;
  }

  const scene = window.gameScene;
  const state = scene.state;
  
  // Store all citizen sprites we've seen
  window.observedCitizens = window.observedCitizens || [];

  // Create a monitoring interval
  const monitorInterval = setInterval(() => {
    // Find all citizen sprites in the scene
    const allGameObjects = scene.children.list || [];
    const citizens = allGameObjects.filter(obj => 
      obj.texture && ['citizen_child', 'citizen_uneducated', 'citizen_educated'].includes(obj.texture.key)
    );

    // Check for new citizens
    citizens.forEach(citizen => {
      if (!window.observedCitizens.includes(citizen)) {
        window.observedCitizens.push(citizen);
        
        // Get citizen home info
        const homeKey = citizen.homeKey || 'unknown';
        const homeTile = citizen.homeTile || scene.palaceTile;
        const citizenType = citizen.texture.key;
        
        const homeType = homeKey === 'tile_palace' ? '👑 PALACE' : '🏘️ HOUSING';
        const citizenTypeStr = 
          citizenType === 'citizen_child' ? '👶 Child' :
          citizenType === 'citizen_educated' ? '🎓 Engineer' :
          '👷 Worker';
        
        console.log(`\n🚶 NEW CITIZEN DETECTED`);
        console.log(`   Type: ${citizenTypeStr}`);
        console.log(`   Home Assignment: ${homeType}`);
        console.log(`   Home Location: (${homeTile.x}, ${homeTile.y})`);
        console.log(`   Current Pos: (${Math.round(citizen.x)}, ${Math.round(citizen.y)})`);
      }
    });

    // Update state logging
    const housingSummary = state.citizenHomes;
    const homes = housingSummary.availableHomes || [];
    const housingBlocks = (housingSummary.housingCount || 0);
    
  }, 500);

  // Store interval ID for cleanup
  window.citizenMonitorInterval = monitorInterval;

  console.log('\n📝 Monitor running. To stop: stopCitizenMonitor()');
  console.log(`📊 Current state:\n   Palace + ${state.citizenHomes?.housingCount || 0} Housing blocks available as homes\n`);

  return {
    stop: () => {
      clearInterval(monitorInterval);
      window.observedCitizens = [];
      console.log('⏹️ Monitor stopped');
    }
  };
}

export function stopCitizenMonitor() {
  if (window.citizenMonitorInterval) {
    clearInterval(window.citizenMonitorInterval);
    window.citizenMonitorInterval = null;
  }
  console.log('⏹️ Citizen monitor stopped');
}

// Export global functions
window.startCitizenMonitor = startCitizenMonitor;
window.stopCitizenMonitor = stopCitizenMonitor;
