(function() {
  const page = window.EQUIPMENT_PAGE || { code: 'BS.I', name: 'Block Station I', prefix: 'BSI' };
  const storageKey = 'tanjung_equip_' + page.code.toLowerCase().replace('.', '_').replace('-', '_');

  let db = loadDb();

  function defaultDb() {
    return {
      pumps: [
        { tag: page.prefix + '-101A', type: 'Centrifugal', model: 'Process Duty', design: '10,000 BPD', head: '145 m', power: '110 kW', material: 'CS / SS316', status: 'RUNNING', note: 'Primary duty pump' },
        { tag: page.prefix + '-101B', type: 'Centrifugal', model: 'Standby Duty', design: '10,000 BPD', head: '145 m', power: '110 kW', material: 'CS / SS316', status: 'STANDBY', note: 'Standby ready' }
      ],
      vessels: [
        { tag: 'V-' + page.prefix + '-01', type: 'Separator / Vessel', model: 'Horizontal 3-Phase', design: '2,000 BBL', pressure: '150 psig', limit: '75%', level: '65%', status: 'RUNNING', note: 'Main separator' },
        { tag: 'T-' + page.prefix + '-01', type: 'Storage Tank', model: 'Atmospheric', design: '10,000 BBL', pressure: 'ATM', limit: '80%', level: '45%', status: 'RUNNING', note: 'Buffer tank' }
      ]
    };
  }

  function loadDb() {
    try {
      const data = JSON.parse(localStorage.getItem(storageKey));
      return (data && data.pumps && data.vessels) ? data : defaultDb();
    } catch(e) {
      return defaultDb();
    }
  }

  function saveDb() {
    localStorage.setItem(storageKey, JSON.stringify(db));
    render();
  }

  window.resetDb = function() {
    if(confirm('Kembalikan data spesifikasi ke awal?')) {
      db = defaultDb();
      saveDb();
    }
  };

  function render() {
    const titleEl = document.getElementById('pageTitle');
    const areaEl = document.getElementById('areaCode');
    if(titleEl) titleEl.textContent = page.name;
    if(areaEl) areaEl.textContent = page.code;

    const pumps = db.pumps || [];
    const vessels = db.vessels || [];

    const pCount = document.getElementById('pumpCount');
    const vCount = document.getElementById('vesselCount');
    if(pCount) pCount.textContent = pumps.length;
    if(vCount) vCount.textContent = vessels.length;

    let running = 0, standby = 0;
    [...pumps, ...vessels].forEach(item => {
      if(item.status === 'RUNNING') running++;
      if(item.status === 'STANDBY') standby++;
    });
    
    const rCount = document.getElementById('runningCount');
    const sCount = document.getElementById('standbyCount');
    if(rCount) rCount.textContent = running;
    if(sCount) sCount.textContent = standby;

    // Render Tabel Pompa: Kolom ke-9 = Catatan (Kiri), Kolom ke-10 = Action (Kanan)
    const pumpBody = document.getElementById('pumpBody');
    if(pumpBody) {
      pumpBody.innerHTML = pumps.map((p, idx) => `
        <tr>
          <td><b>${p.tag}</b></td>
          <td>${p.type}</td>
          <td>${p.model}</td>
          <td>${p.design}</td>
          <td>${p.head}</td>
          <td>${p.power}</td>
          <td>${p.material}</td>
          <td><span class="status-chip status-${(p.status || 'RUNNING').toLowerCase()}">${p.status}</span></td>
          <td><textarea class="value-input" placeholder="Tulis catatan teknis..." onchange="updateNote('pumps', ${idx}, this.value)" style="font-size:11px; padding:6px 10px; width:220px; min-height:45px; resize:vertical; background:#091626; border:1px solid #2b4567; color:#eaf2ff; border-radius:6px;">${p.note || ''}</textarea></td>
          <td>
            <button class="btn btn-secondary" style="padding:4px 8px; font-size:10px; margin-bottom:4px; display:inline-block;" onclick="editItem('pumps', ${idx})">Edit</button><br>
            <button class="btn btn-secondary" style="padding:4px 8px; font-size:10px; background:#7f1d1d; border-color:#991b1b; color:#f87171; display:inline-block;" onclick="deleteItem('pumps', ${idx})">Del</button>
          </td>
        </tr>
      `).join('');
    }

    // Render Tabel Vessel: Kolom ke-9 = Catatan (Kiri), Kolom ke-10 = Action (Kanan)
    const vesselBody = document.getElementById('vesselBody');
    if(vesselBody) {
      vesselBody.innerHTML = vessels.map((v, idx) => `
        <tr>
          <td><b>${v.tag}</b></td>
          <td>${v.type}</td>
          <td>${v.model}</td>
          <td>${v.design}</td>
          <td>${v.pressure}</td>
          <td>${v.limit}</td>
          <td>${v.level}</td>
          <td><span class="status-chip status-${(v.status || 'RUNNING').toLowerCase()}">${v.status}</span></td>
          <td><textarea class="value-input" placeholder="Tulis catatan teknis..." onchange="updateNote('vessels', ${idx}, this.value)" style="font-size:11px; padding:6px 10px; width:220px; min-height:45px; resize:vertical; background:#091626; border:1px solid #2b4567; color:#eaf2ff; border-radius:6px;">${v.note || ''}</textarea></td>
          <td>
            <button class="btn btn-secondary" style="padding:4px 8px; font-size:10px; margin-bottom:4px; display:inline-block;" onclick="editItem('vessels', ${idx})">Edit</button><br>
            <button class="btn btn-secondary" style="padding:4px 8px; font-size:10px; background:#7f1d1d; border-color:#991b1b; color:#f87171; display:inline-block;" onclick="deleteItem('vessels', ${idx})">Del</button>
          </td>
        </tr>
      `).join('');
    }
  }

  window.updateNote = function(type, index, val) {
    if(db[type] && db[type][index]) {
      db[type][index].note = val;
      localStorage.setItem(storageKey, JSON.stringify(db));
    }
  };

  let currentCategory = 'pumps';
  let editIndex = -1;

  window.openModal = function(category, idx = -1) {
    currentCategory = category;
    editIndex = idx;
    const modal = document.getElementById('crudModal');
    if(modal) modal.style.display = 'flex';
    
    const titleEl = document.getElementById('modalTitle');
    if(titleEl) titleEl.textContent = (idx >= 0 ? 'Edit ' : 'Add ') + (category === 'pumps' ? 'Pump' : 'Tank / Vessel');

    const fTag = document.getElementById('f-tag');
    const fStatus = document.getElementById('f-status');
    const fType = document.getElementById('f-type');
    const fModel = document.getElementById('f-model');
    const fDesign = document.getElementById('f-design');
    const fHead = document.getElementById('f-head');
    const fPower = document.getElementById('f-power');
    const fMaterial = document.getElementById('f-material');
    const fNote = document.getElementById('f-note');

    if (idx >= 0 && db[category][idx]) {
      const item = db[category][idx];
      if(fTag) fTag.value = item.tag || '';
      if(fStatus) fStatus.value = item.status || 'RUNNING';
      if(fType) fType.value = item.type || '';
      if(fModel) fModel.value = item.model || '';
      if(fDesign) fDesign.value = item.design || '';
      if(fHead) fHead.value = category === 'pumps' ? (item.head || '') : (item.pressure || '');
      if(fPower) fPower.value = category === 'pumps' ? (item.power || '') : (item.limit || '');
      if(fMaterial) fMaterial.value = category === 'pumps' ? (item.material || '') : (item.level || '');
      if(fNote) fNote.value = item.note || '';
    } else {
      if(fTag) fTag.value = '';
      if(fStatus) fStatus.value = 'RUNNING';
      if(fType) fType.value = '';
      if(fModel) fModel.value = '';
      if(fDesign) fDesign.value = '';
      if(fHead) fHead.value = '';
      if(fPower) fPower.value = '';
      if(fMaterial) fMaterial.value = '';
      if(fNote) fNote.value = '';
    }
  };

  window.closeModal = function() {
    const modal = document.getElementById('crudModal');
    if(modal) modal.style.display = 'none';
  };

  window.editItem = function(category, idx) {
    openModal(category, idx);
  };

  window.deleteItem = function(category, idx) {
    if(confirm('Hapus item equipment ini?')) {
      db[category].splice(idx, 1);
      saveDb();
    }
  };

  window.submitForm = function() {
    const fTag = document.getElementById('f-tag');
    const tag = fTag ? fTag.value.trim() : '';
    if(!tag) {
      alert('Tag ID wajib diisi!');
      return;
    }

    const item = {
      tag: tag,
      status: document.getElementById('f-status') ? document.getElementById('f-status').value : 'RUNNING',
      type: document.getElementById('f-type') ? document.getElementById('f-type').value : '',
      model: document.getElementById('f-model') ? document.getElementById('f-model').value : '',
      design: document.getElementById('f-design') ? document.getElementById('f-design').value : '',
      note: document.getElementById('f-note') ? document.getElementById('f-note').value : ''
    };

    const hVal = document.getElementById('f-head') ? document.getElementById('f-head').value : '';
    const pVal = document.getElementById('f-power') ? document.getElementById('f-power').value : '';
    const mVal = document.getElementById('f-material') ? document.getElementById('f-material').value : '';

    if (currentCategory === 'pumps') {
      item.head = hVal;
      item.power = pVal;
      item.material = mVal;
    } else {
      item.pressure = hVal;
      item.limit = pVal;
      item.level = mVal;
    }

    if (editIndex >= 0) {
      db[currentCategory][editIndex] = item;
    } else {
      if(!db[currentCategory]) db[currentCategory] = [];
      db[currentCategory].push(item);
    }

    saveDb();
    closeModal();
  };

  window.addEventListener('DOMContentLoaded', render);
})();