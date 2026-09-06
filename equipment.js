(function() {
  const page = window.EQUIPMENT_PAGE || { code: 'BS.I', name: 'Block Station I', prefix: 'BSI' };
  const storageKey = 'tanjung_equip_' + page.code.toLowerCase().replace('.', '_');

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
      return data ? data : defaultDb();
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
    document.getElementById('pageTitle').textContent = page.name;
    document.getElementById('areaCode').textContent = page.code;

    const pumps = db.pumps || [];
    const vessels = db.vessels || [];

    document.getElementById('pumpCount').textContent = pumps.length;
    document.getElementById('vesselCount').textContent = vessels.length;

    let running = 0, standby = 0;
    [...pumps, ...vessels].forEach(item => {
      if(item.status === 'RUNNING') running++;
      if(item.status === 'STANDBY') standby++;
    });
    document.getElementById('runningCount').textContent = running;
    document.getElementById('standbyCount').textContent = standby;

    // Render Tabel Pompa (Catatan di SEBELAH KIRI Action)
    const pumpBody = document.getElementById('pumpBody');
    pumpBody.innerHTML = pumps.map((p, idx) => `
      <tr>
        <td><b>${p.tag}</b></td>
        <td>${p.type}</td>
        <td>${p.model}</td>
        <td>${p.design}</td>
        <td>${p.head}</td>
        <td>${p.power}</td>
        <td>${p.material}</td>
        <td><span class="status-chip status-${p.status.toLowerCase()}">${p.status}</span></td>
        <td><textarea class="value-input" placeholder="Tulis catatan teknis..." onchange="updateNote('pumps', ${idx}, this.value)" style="font-size:11px; padding:6px 10px; width:220px; min-height:45px; resize:vertical; background:#091626; border:1px solid #2b4567; color:#eaf2ff; border-radius:6px;">${p.note || ''}</textarea></td>
        <td>
          <button class="btn btn-secondary" style="padding:4px 8px; font-size:10px; margin-bottom:4px;" onclick="editItem('pumps', ${idx})">Edit</button><br>
          <button class="btn btn-secondary" style="padding:4px 8px; font-size:10px; background:#7f1d1d; border-color:#991b1b; color:#f87171;" onclick="deleteItem('pumps', ${idx})">Del</button>
        </td>
      </tr>
    `).join('');

    // Render Tabel Vessel (Catatan di SEBELAH KIRI Action)
    const vesselBody = document.getElementById('vesselBody');
    vesselBody.innerHTML = vessels.map((v, idx) => `
      <tr>
        <td><b>${v.tag}</b></td>
        <td>${v.type}</td>
        <td>${v.model}</td>
        <td>${v.design}</td>
        <td>${v.pressure}</td>
        <td>${v.limit}</td>
        <td>${v.level}</td>
        <td><span class="status-chip status-${v.status.toLowerCase()}">${v.status}</span></td>
        <td><textarea class="value-input" placeholder="Tulis catatan teknis..." onchange="updateNote('vessels', ${idx}, this.value)" style="font-size:11px; padding:6px 10px; width:220px; min-height:45px; resize:vertical; background:#091626; border:1px solid #2b4567; color:#eaf2ff; border-radius:6px;">${v.note || ''}</textarea></td>
        <td>
          <button class="btn btn-secondary" style="padding:4px 8px; font-size:10px; margin-bottom:4px;" onclick="editItem('vessels', ${idx})">Edit</button><br>
          <button class="btn btn-secondary" style="padding:4px 8px; font-size:10px; background:#7f1d1d; border-color:#991b1b; color:#f87171;" onclick="deleteItem('vessels', ${idx})">Del</button>
        </td>
      </tr>
    `).join('');
  }

  window.updateNote = function(type, index, val) {
    db[type][index].note = val;
    localStorage.setItem(storageKey, JSON.stringify(db));
  };

  let currentCategory = 'pumps';
  let editIndex = -1;

  window.openModal = function(category, idx = -1) {
    currentCategory = category;
    editIndex = idx;
    document.getElementById('crudModal').style.display = 'flex';
    document.getElementById('modalTitle').textContent = (idx >= 0 ? 'Edit ' : 'Add ') + (category === 'pumps' ? 'Pump' : 'Tank / Vessel');

    if (idx >= 0) {
      const item = db[category][idx];
      document.getElementById('f-tag').value = item.tag || '';
      document.getElementById('f-status').value = item.status || 'RUNNING';
      document.getElementById('f-type').value = item.type || '';
      document.getElementById('f-model').value = item.model || '';
      document.getElementById('f-design').value = item.design || '';
      document.getElementById('f-head').value = category === 'pumps' ? item.head : item.pressure;
      document.getElementById('f-power').value = category === 'pumps' ? item.power : item.limit;
      document.getElementById('f-material').value = category === 'pumps' ? item.material : item.level;
      document.getElementById('f-note').value = item.note || '';
    } else {
      document.getElementById('f-tag').value = '';
      document.getElementById('f-status').value = 'RUNNING';
      document.getElementById('f-type').value = '';
      document.getElementById('f-model').value = '';
      document.getElementById('f-design').value = '';
      document.getElementById('f-head').value = '';
      document.getElementById('f-power').value = '';
      document.getElementById('f-material').value = '';
      document.getElementById('f-note').value = '';
    }
  };

  window.closeModal = function() {
    document.getElementById('crudModal').style.display = 'none';
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
    const tag = document.getElementById('f-tag').value.trim();
    if(!tag) {
      alert('Tag ID wajib diisi!');
      return;
    }

    const item = {
      tag: tag,
      status: document.getElementById('f-status').value,
      type: document.getElementById('f-type').value,
      model: document.getElementById('f-model').value,
      design: document.getElementById('f-design').value,
      note: document.getElementById('f-note').value
    };

    if (currentCategory === 'pumps') {
      item.head = document.getElementById('f-head').value;
      item.power = document.getElementById('f-power'].value || document.getElementById('f-power').value;
      item.material = document.getElementById('f-material').value;
    } else {
      item.pressure = document.getElementById('f-head').value;
      item.limit = document.getElementById('f-power').value;
      item.level = document.getElementById('f-material').value;
    }

    if (editIndex >= 0) {
      db[currentCategory][editIndex] = item;
    } else {
      db[currentCategory].push(item);
    }

    saveDb();
    closeModal();
  };

  window.addEventListener('DOMContentLoaded', render);
})();