const STORAGE_KEY='tanjung.integration.v3';
const defaults={
  ws:{station:'BS.WS',parameter:'Gross Inlet',value:4500,unit:'BFPD',source:'Manual'},
  v:{station:'BS.V',parameter:'Gross Inlet',value:6200,unit:'BFPD',source:'Manual'},
  iv:{station:'BS.IV',parameter:'Gross Inlet',value:3100,unit:'BFPD',source:'Manual'},
  iii:{station:'BS.III',parameter:'Gross Inlet',value:5800,unit:'BFPD',source:'Manual'},
  vi:{station:'BS.VI',parameter:'Gross Inlet',value:4100,unit:'BFPD',source:'Manual'},
  ii:{station:'BS.II',parameter:'Gross Inlet',value:3900,unit:'BFPD',source:'Manual'},
  i:{station:'BS.I',parameter:'Gross Inlet',value:2400,unit:'BFPD',source:'Manual'},
  wtp:{station:'WTP',parameter:'Water Production',value:15000,unit:'BWPD',source:'Manual'},
  wtip:{station:'WTIP',parameter:'Water Treatment Injection',value:14500,unit:'BWPD',source:'Manual'},
  wip:{station:'WIP',parameter:'Water Injection Plant',value:14400,unit:'BWPD',source:'Manual'},
  spu_mngl:{station:'SPU MNGL',parameter:'SPU Operation',value:5000,unit:'BFPD',source:'Manual'},
  wc:{station:'SPU MNGL',parameter:'Water Cut',value:88,unit:'%',source:'Manual'},
  injEff:{station:'WIP',parameter:'Injection Efficiency',value:99,unit:'%',source:'Calculated'}
};

const equipmentPages=[
  ['BS.WS','Warukin Selatan','detail_bs_ws.html','bs_ws'],
  ['BS.V','Block Station V','detail_bs_v.html','bs_v'],
  ['BS.IV','Block Station IV','detail_bs_iv.html','bs_iv'],
  ['BS.III','Block Station III','detail_bs_iii.html','bs_iii'],
  ['BS.VI','Block Station VI','detail_bs_vi.html','bs_vi'],
  ['BS.II','Block Station II','detail_bs_ii.html','bs_ii'],
  ['BS.I','Block Station I','detail_bs_i.html','bs_i'],
  ['SPU','SPU MNGL','detail_spu.html','spu'],
  ['WTIP','Water Treatment Injection Plant','detail_wtip.html','wtip'],
  ['WIP','Water Injection Plant','detail_wip.html','wip'],
  ['WTP','Water Treatment Plant','detail_wtp.html','wtp']
];

let integration=loadIntegration();
let docLinks=loadDocLinks();
let isSystemOn=false;

function loadIntegration(){try{const x=JSON.parse(localStorage.getItem(STORAGE_KEY));return x?mergeDefaults(x):structuredClone(defaults)}catch(e){return structuredClone(defaults)}}
function mergeDefaults(saved){const out=structuredClone(defaults);Object.keys(out).forEach(k=>{if(saved[k])out[k]={...out[k],...saved[k]}});return out}
function loadDocLinks(){try{return JSON.parse(localStorage.getItem('tanjung.doclinks.v1'))||{}}catch(e){return {}}}

function nowLabel(){return new Intl.DateTimeFormat('id-ID',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'short'}).format(new Date())}

function renderIntegrationRows(){
  const body=document.getElementById('integrationRows');body.innerHTML='';
  Object.entries(integration).forEach(([key,row])=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td class="station-cell">${row.station}</td><td class="param-cell">${row.parameter}</td><td><input class="value-input" type="number" step="0.1" data-key="${key}" value="${row.value}"></td><td><span class="unit-chip">${row.unit}</span></td><td><select class="select-source" data-source-key="${key}"><option>Manual</option><option>SCADA</option><option>Historian</option><option>Calculated</option></select></td><td class="updated-cell">${row.updated||'—'}</td>`;
    body.appendChild(tr);tr.querySelector('select').value=row.source||'Manual';
  })
}

function renderEquipmentLinks(){
  const container=document.getElementById('equipmentLinks');
  container.innerHTML=equipmentPages.map(([code,name,url,key])=>{
    const savedLink=docLinks[key]||'';
    return `<div class="equipment-item-card" style="background:#0b1929;border:1px solid #1d314a;border-radius:11px;padding:10px 12px;margin-bottom:9px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
        <a class="equipment-link" href="${url}" target="_blank" style="text-decoration:none;color:#dce8f8;flex:1;"><span><b>${code}</b><small>${name}</small></span><span class="arrow">›</span></a>
      </div>
      <div style="display:flex;gap:6px;align-items:center;margin-top:6px;border-top:1px solid #162942;padding-top:6px;">
        <input type="url" class="value-input doc-input" data-dockey="${key}" placeholder="Paste Link GDrive / P&ID..." value="${savedLink}" style="font-size:11px;padding:5px 8px;">
        <button class="btn btn-primary" onclick="saveDocLink('${key}')" style="padding:5px 10px;font-size:10px;">Simpan</button>
        ${savedLink ? `<a href="${savedLink}" target="_blank" class="btn btn-success" style="padding:5px 8px;font-size:10px;text-decoration:none;">Buka</a>`:''}
      </div>
    </div>`;
  }).join('');
}

function saveDocLink(key){
  const input=document.querySelector(`[data-dockey="${key}"]`);
  if(input){
    docLinks[key]=input.value.trim();
    localStorage.setItem('tanjung.doclinks.v1',JSON.stringify(docLinks));
    renderEquipmentLinks();
    toast(`Link referensi ${key.toUpperCase()} berhasil disimpan!`);
  }
}

function collectInputs(){
  document.querySelectorAll('[data-key]').forEach(el=>{const k=el.dataset.key;const n=Number(el.value);if(Number.isFinite(n))integration[k].value=n});
  document.querySelectorAll('[data-source-key]').forEach(el=>integration[el.dataset.sourceKey].source=el.value);
  Object.values(integration).forEach(r=>r.updated=nowLabel());
  localStorage.setItem(STORAGE_KEY,JSON.stringify(integration));renderIntegrationRows();updateDashboard();toast('Data integrasi berhasil diterapkan.');
}

function resetIntegration(){
  integration=structuredClone(defaults);localStorage.setItem(STORAGE_KEY,JSON.stringify(integration));
  renderIntegrationRows();updateDashboard();toast('Data integrasi dikembalikan ke default.');
}

function fmt(v){return Math.round(v).toLocaleString('id-ID')}

function setTextWithPulse(id, val){
  const el = document.getElementById(id);
  if(!el) return;
  const oldVal = el.textContent;
  if(oldVal !== val){
    el.textContent = val;
    el.classList.add('value-changed');
    setTimeout(() => el.classList.remove('value-changed'), 800);
  }
}

function updateDashboard(){
  const keys=['ws','v','iv','iii','vi','ii','i'];
  const total=keys.reduce((s,k)=>s+Number(integration[k].value||0),0);
  const wc=Math.max(0,Math.min(100,Number(integration.wc.value||0)));
  const oil=Math.round(total*(1-wc/100));
  const producedWater=Math.round(total*(wc/100));
  const wtip=producedWater;
  const wip=Math.round(wtip*.997);
  const inj=Math.round(wip*(Number(integration.injEff.value||0)/100));
  
  setTextWithPulse('val-bfpd',isSystemOn?fmt(total):'0');
  setTextWithPulse('val-bopd',isSystemOn?fmt(oil):'0');
  setTextWithPulse('val-inj',isSystemOn?fmt(inj):'0');
  setTextWithPulse('val-wc-top',isSystemOn?wc.toFixed(1):'0');
  
  keys.forEach(k=>setTextWithPulse(`v-${k}-input`,fmt(integration[k].value)));
  setTextWithPulse('v-wtp',isSystemOn?fmt(integration.wtp.value):'0');
  setTextWithPulse('v-wc',isSystemOn?wc.toFixed(1):'0');
  setTextWithPulse('v-wtip',isSystemOn?fmt(wtip):'0');
  setTextWithPulse('v-wip',isSystemOn?fmt(wip):'0');
  setTextWithPipe('v-well-inj',isSystemOn?fmt(inj):'0');
}

function setTextWithPipe(id, val){ setTextWithPulse(id, val); }

function toggleSystem(){
  isSystemOn=!isSystemOn;
  document.body.classList.toggle('system-on',isSystemOn);
  document.querySelector('.pfd-board').classList.toggle('system-active',isSystemOn);
  const btn=document.getElementById('toggleBtn');
  btn.textContent=isSystemOn?'System Active':'Power On System';
  document.getElementById('systemStatusText').textContent=isSystemOn?'System Active':'System Standby';
  updateDashboard();
  toast(isSystemOn?'Dashboard live dengan data integrasi aktif.':'Dashboard kembali ke mode standby.');
}

function toast(msg){
  const el=document.getElementById('toast');
  el.textContent=msg;
  el.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer=setTimeout(()=>el.classList.remove('show'),2400);
}

setInterval(()=>{
  if(!isSystemOn) return;
  ['ws','v','iv','iii','vi','ii','i'].forEach(k=>{
    const delta = (Math.random() - 0.47) * 3;
    integration[k].value = Number(Math.max(0, integration[k].value + delta).toFixed(1));
  });
  updateDashboard();
}, 4000);

document.getElementById('toggleBtn').addEventListener('click',toggleSystem);
document.getElementById('applyIntegrationBtn').addEventListener('click',collectInputs);
document.getElementById('resetIntegrationBtn').addEventListener('click',resetIntegration);
renderIntegrationRows();
renderEquipmentLinks();
updateDashboard();