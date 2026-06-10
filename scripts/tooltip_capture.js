(async function(){
  const wait = ms => new Promise(r=>setTimeout(r,ms));
  await new Promise(r=>{ if(document.readyState==='complete') r(); else window.addEventListener('load', r); });
  const results = {build:[], tech:[], decrees:[], tax:null, trades:[]};
  const bc = document.querySelector('#ui-build-cost-tooltip');
  const tt = ()=>({title: document.getElementById('tt-title')?.textContent || null, lore: document.getElementById('tt-lore')?.textContent || null, costs: document.getElementById('tt-costs')?.textContent || null, effects: document.getElementById('tt-effects')?.textContent || null});

  const buildBtns = Array.from(document.querySelectorAll('.build-option'));
  for (const btn of buildBtns) {
    const key = btn.dataset.build || btn.textContent.trim();
    btn.dispatchEvent(new MouseEvent('mouseenter', {bubbles:true, cancelable:true, clientX: btn.getBoundingClientRect().left+5, clientY: btn.getBoundingClientRect().top+5}));
    btn.dispatchEvent(new MouseEvent('mousemove', {bubbles:true, cancelable:true, clientX: btn.getBoundingClientRect().left+6, clientY: btn.getBoundingClientRect().top+6}));
    await wait(80);
    const tooltip = bc ? (bc.innerText || bc.textContent) : (document.getElementById('tt-title') ? (document.getElementById('tt-title')?.textContent||'') : null);
    results.build.push({build: key, tooltip});
    btn.dispatchEvent(new MouseEvent('mouseleave', {bubbles:true}));
    await wait(10);
  }

  const techNodes = Array.from(document.querySelectorAll('.tech-node'));
  for (const node of techNodes) {
    const key = node.dataset.tech || node.textContent.trim();
    node.dispatchEvent(new MouseEvent('mousemove', {bubbles:true, cancelable:true, clientX: node.getBoundingClientRect().left+10, clientY: node.getBoundingClientRect().top+10}));
    await wait(80);
    results.tech.push(Object.assign({tech:key}, tt()));
    node.dispatchEvent(new MouseEvent('mouseleave', {bubbles:true}));
    await wait(10);
  }

  const decrees = Array.from(document.querySelectorAll('.decree-card'));
  for (const card of decrees) {
    const key = card.dataset.decree || card.textContent.trim();
    card.dispatchEvent(new MouseEvent('mouseenter', {bubbles:true, cancelable:true, clientX: card.getBoundingClientRect().left+8, clientY: card.getBoundingClientRect().top+8}));
    card.dispatchEvent(new MouseEvent('mousemove', {bubbles:true, cancelable:true, clientX: card.getBoundingClientRect().left+9, clientY: card.getBoundingClientRect().top+9}));
    await wait(80);
    results.decrees.push(Object.assign({decree:key}, tt()));
    card.dispatchEvent(new MouseEvent('mouseleave', {bubbles:true}));
    await wait(10);
  }

  const taxControls = document.querySelector('.tax-controls');
  if (taxControls) {
    taxControls.dispatchEvent(new MouseEvent('mouseenter', {bubbles:true, cancelable:true, clientX: taxControls.getBoundingClientRect().left+5, clientY: taxControls.getBoundingClientRect().top+5}));
    taxControls.dispatchEvent(new MouseEvent('mousemove', {bubbles:true, cancelable:true, clientX: taxControls.getBoundingClientRect().left+6, clientY: taxControls.getBoundingClientRect().top+6}));
    await wait(80);
    results.tax = tt();
    taxControls.dispatchEvent(new MouseEvent('mouseleave', {bubbles:true}));
  }

  const factions = ['rust','order','guild'];
  for (const f of factions) {
    const win = document.getElementById(`trade-${f}`);
    if (!win) continue;
    const modeBtns = Array.from(win.querySelectorAll('.trade-mode-btn'));
    const currencyBtns = Array.from(win.querySelectorAll('.trade-currency-btn'));
    const citizenBtns = Array.from(win.querySelectorAll('.trade-citizen-btn'));
    const qtyInput = document.getElementById(`trade-qty-${f}`);
    const offerInput = document.getElementById(`trade-offer-${f}`);
    const submitBtn = document.getElementById(`trade-submit-${f}`);
    const dialogue = document.getElementById(`dialogue-${f}`);

    const record = {faction:f, modeBefore:[], modeAfter:[], currencyBefore:[], currencyAfter:[], citizenBefore:[], citizenAfter:[], submitDialogueBefore: dialogue?.innerText || null, submitDialogueAfter: null};

    modeBtns.forEach(b=>record.modeBefore.push({text:b.textContent.trim(), classes:Array.from(b.classList)}));
    if (modeBtns[0]) { modeBtns[0].click(); }
    await wait(50);
    modeBtns.forEach(b=>record.modeAfter.push({text:b.textContent.trim(), classes:Array.from(b.classList)}));

    currencyBtns.forEach(b=>record.currencyBefore.push({text:b.textContent.trim(), classes:Array.from(b.classList)}));
    if (currencyBtns[0]) { currencyBtns[0].click(); }
    await wait(30);
    currencyBtns.forEach(b=>record.currencyAfter.push({text:b.textContent.trim(), classes:Array.from(b.classList)}));

    citizenBtns.forEach(b=>record.citizenBefore.push({text:b.textContent.trim(), classes:Array.from(b.classList)}));
    if (citizenBtns[0]) { citizenBtns[0].click(); }
    await wait(30);
    citizenBtns.forEach(b=>record.citizenAfter.push({text:b.textContent.trim(), classes:Array.from(b.classList)}));

    if (qtyInput) { qtyInput.value = 1; qtyInput.dispatchEvent(new Event('input',{bubbles:true})); }
    if (offerInput) { offerInput.value = 10; offerInput.dispatchEvent(new Event('input',{bubbles:true})); }
    if (submitBtn) { submitBtn.click(); await wait(200); record.submitDialogueAfter = dialogue?.innerText || null; }

    results.trades.push(record);
  }

  console.log('AUTOMATED_TOOLTIP_CAPTURE_START');
  console.log(JSON.stringify(results, null, 2));
  console.log('AUTOMATED_TOOLTIP_CAPTURE_END');
  return results;
})();