const STORAGE_KEY = 'stock_ledger_v1';
let records = [];
let avgCost = {};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) records = JSON.parse(raw);
  } catch (e) { records = []; }
  rebuildAvg();
  render();
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
}

function addRecord() {
  const name  = document.getElementById('f-name').value.trim();
  const type  = document.getElementById('f-type').value;
  const price = parseFloat(document.getElementById('f-price').value);
  const qty   = parseInt(document.getElementById('f-qty').value);
  if (!name || !price || !qty || price <= 0 || qty <= 0) {
    alert('모든 항목을 올바르게 입력해주세요.');
    return;
  }
  let pnl = null;
  if (type === 'buy') {
    if (!avgCost[name]) avgCost[name] = { avg: price, qty };
    else {
      const p = avgCost[name], tq = p.qty + qty;
      avgCost[name] = { avg: (p.avg * p.qty + price * qty) / tq, qty: tq };
    }
  } else {
    pnl = avgCost[name] ? (price - avgCost[name].avg) * qty : 0;
    if (avgCost[name]) {
      avgCost[name].qty -= qty;
      if (avgCost[name].qty <= 0) delete avgCost[name];
    }
  }
  records.unshift({ date: today(), name, type, price, qty, amount: price * qty, pnl });
  document.getElementById('f-name').value = '';
  document.getElementById('f-price').value = '';
  document.getElementById('f-qty').value = '';
  save();
  render();
}

function deleteRecord(i) {
  if (!confirm(`"${records[i].name}" 거래를 삭제할까요?`)) return;
  records.splice(i, 1);
  rebuildAvg();
  save();
  render();
}

function clearAll() {
  if (!confirm('전체 거래 내역을 삭제할까요?')) return;
  records = [];
  avgCost = {};
  save();
  render();
}

function rebuildAvg() {
  avgCost = {};
  [...records].reverse().forEach(r => {
    if (r.type === 'buy') {
      if (!avgCost[r.name]) avgCost[r.name] = { avg: r.price, qty: r.qty };
      else {
        const p = avgCost[r.name], tq = p.qty + r.qty;
        avgCost[r.name] = { avg: (p.avg * p.qty + r.price * r.qty) / tq, qty: tq };
      }
    }
  });
}

function w(n) { return Math.round(n).toLocaleString('ko-KR') + '원'; }

/* ── CSV 내보내기 (모바일 호환) ── */
function exportCSV() {
  if (records.length === 0) { alert('내보낼 데이터가 없습니다.'); return; }
  const header = '날짜,종목,구분,단가,수량,금액,손익\n';
  const rows = records.map(r =>
    `${r.date},${r.name},${r.type === 'buy' ? '매수' : '매도'},${r.price},${r.qty},${Math.round(r.amount)},${r.pnl !== null ? Math.round(r.pnl) : ''}`
  ).join('\n');
  const csvContent = '\uFEFF' + header + rows;

  try {
    /* 방법 1: 일반 다운로드 */
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '주식가계부_' + today().replace(/\./g, '') + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (e) {
    /* 방법 2: 모바일 폴백 — 텍스트로 직접 보여주기 */
    showCSVText(csvContent);
  }
}

/* 모바일에서 다운로드 안 될 때: 텍스트 복사 모달 */
function showCSVText(csvContent) {
  document.getElementById('csvTextArea').value = csvContent;
  document.getElementById('csvModal').style.display = 'flex';
}

function closeCSVModal() {
  document.getElementById('csvModal').style.display = 'none';
}

function copyCSV() {
  const ta = document.getElementById('csvTextArea');
  ta.select();
  ta.setSelectionRange(0, 99999);
  try {
    navigator.clipboard.writeText(ta.value).then(() => {
      alert('복사되었습니다!\n\n구글시트 또는 엑셀에 붙여넣기 하세요.');
    });
  } catch (e) {
    document.execCommand('copy');
    alert('복사되었습니다!\n\n구글시트 또는 엑셀에 붙여넣기 하세요.');
  }
}

/* ── CSV 가져오기 (다른 기기에서 불러오기) ── */
function importCSV() {
  document.getElementById('csvImportInput').click();
}

function handleImport(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    try {
      let text = ev.target.result;
      /* BOM 제거 */
      if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
      const lines = text.trim().split('\n');
      /* 헤더 제거 */
      const dataLines = lines.slice(1).filter(l => l.trim());
      if (dataLines.length === 0) { alert('데이터가 없습니다.'); return; }

      const imported = [];
      for (const line of dataLines) {
        const cols = line.split(',');
        if (cols.length < 6) continue;
        const [date, name, typeStr, priceStr, qtyStr, amountStr, pnlStr] = cols;
        const type   = typeStr.trim() === '매수' ? 'buy' : 'sell';
        const price  = parseFloat(priceStr);
        const qty    = parseInt(qtyStr);
        const amount = parseFloat(amountStr);
        const pnl    = pnlStr && pnlStr.trim() !== '' ? parseFloat(pnlStr) : null;
        if (!name || isNaN(price) || isNaN(qty)) continue;
        imported.push({ date: date.trim(), name: name.trim(), type, price, qty, amount, pnl });
      }

      if (imported.length === 0) { alert('불러올 수 있는 데이터가 없습니다.'); return; }

      const mode = confirm(
        `${imported.length}건을 불러옵니다.\n\n확인 → 기존 데이터에 추가\n취소 → 기존 데이터 삭제 후 교체`
      );
      if (mode) {
        /* 추가 */
        records = [...records, ...imported];
      } else {
        /* 교체 */
        records = imported;
      }
      rebuildAvg();
      save();
      render();
      alert(`${imported.length}건 불러오기 완료!`);
    } catch (err) {
      alert('파일을 읽는 중 오류가 발생했습니다.');
    }
  };
  reader.readAsText(file, 'UTF-8');
  /* 같은 파일 재선택 가능하도록 초기화 */
  e.target.value = '';
}

/* ── 롱프레스 삭제 ── */
let longPressTimer = null;

function onRowTouchStart(e, i) {
  longPressTimer = setTimeout(() => {
    longPressTimer = null;
    if (navigator.vibrate) navigator.vibrate(50);
    deleteRecord(i);
  }, 600);
}

function onRowTouchEnd() {
  if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
}

function onRowTouchMove() {
  if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
}

/* ── 렌더 ── */
function render() {
  const tbody = document.getElementById('tbody');
  document.getElementById('record-count').textContent = records.length + '건';

  if (records.length === 0) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="8">거래 내역이 없습니다</td></tr>';
  } else {
    tbody.innerHTML = records.map((r, i) => {
      const badge = r.type === 'buy'
        ? '<span class="badge badge-buy">매수</span>'
        : '<span class="badge badge-sell">매도</span>';
      let pnlCell;
      if (r.type === 'sell' && r.pnl !== null) {
        const cls = r.pnl >= 0 ? 'pnl-pos' : 'pnl-neg';
        pnlCell = `<span class="${cls}">${r.pnl >= 0 ? '+' : ''}${Math.round(r.pnl).toLocaleString('ko-KR')}원</span>`;
      } else {
        pnlCell = '<span class="pnl-none">—</span>';
      }
      return `<tr
        ontouchstart="onRowTouchStart(event,${i})"
        ontouchend="onRowTouchEnd()"
        ontouchmove="onRowTouchMove()"
        class="data-row">
        <td style="color:var(--text3);font-size:12px;font-family:var(--mono)">${r.date}</td>
        <td style="font-weight:500">${r.name}</td>
        <td>${badge}</td>
        <td class="num">${r.price.toLocaleString('ko-KR')}원</td>
        <td class="num">${r.qty}주</td>
        <td class="num">${Math.round(r.amount).toLocaleString('ko-KR')}원</td>
        <td class="num">${pnlCell}</td>
        <td style="text-align:right"><button class="del-btn" onclick="deleteRecord(${i})" title="삭제">×</button></td>
      </tr>`;
    }).join('');
  }

  const totalBuy  = records.filter(r => r.type === 'buy').reduce((s, r) => s + r.amount, 0);
  const totalSell = records.filter(r => r.type === 'sell').reduce((s, r) => s + r.amount, 0);
  const totalPnl  = records.filter(r => r.type === 'sell' && r.pnl !== null).reduce((s, r) => s + r.pnl, 0);
  const rate      = totalBuy > 0 ? totalPnl / totalBuy * 100 : null;

  document.getElementById('s-buy').textContent  = w(totalBuy);
  document.getElementById('s-sell').textContent = w(totalSell);

  const pnlEl = document.getElementById('s-pnl');
  pnlEl.textContent = (totalPnl >= 0 ? '+' : '') + Math.round(totalPnl).toLocaleString('ko-KR') + '원';
  pnlEl.className   = 'card-value ' + (totalPnl >= 0 ? 'pos' : 'neg');

  const rateEl = document.getElementById('s-rate');
  if (rate === null) { rateEl.textContent = '—'; rateEl.className = 'card-value'; }
  else {
    rateEl.textContent = (rate >= 0 ? '+' : '') + rate.toFixed(2) + '%';
    rateEl.className   = 'card-value ' + (rate >= 0 ? 'pos' : 'neg');
  }
}

document.getElementById('f-name').addEventListener('keydown', e => { if (e.key === 'Enter') addRecord(); });
document.getElementById('f-qty').addEventListener('keydown',  e => { if (e.key === 'Enter') addRecord(); });

load();
