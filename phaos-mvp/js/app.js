/* ======================= SHARED DATA ======================= */

const GRACE_DAYS_PER_MONTH_STORED = 3;
const CRATE_RENTAL_PER_CRATE = 5;

const FACILITIES = [
  { name: "Fruit Basket Cold Chain Pvt Ltd", loc: "Lassipora, Pulwama", used: 78, capacity: 5000, rate: 18, commodities: ["Apple", "Plum"], track: "Track A (Connector)", lastSync: "3 min ago", syncStatus: "healthy" },
  { name: "Wadoora CA Storage", loc: "Lassipora, Pulwama", used: 45, capacity: 4200, rate: 16, commodities: ["Apple", "Cherry"], track: "Track A (Connector)", lastSync: "22 min ago", syncStatus: "healthy" },
  { name: "Valley Fresh Cold Store", loc: "Shopian", used: 92, capacity: 3600, rate: 20, commodities: ["Apple", "Pear"], track: "Track A (Connector)", lastSync: "6 hr ago", syncStatus: "stale" },
  { name: "Himalayan Agro Storage", loc: "Pulwama", used: 30, capacity: 5000, rate: 17, commodities: ["Apple", "Apricot"], track: "Track B (Native)", lastSync: "live", syncStatus: "healthy" },
];

// Grace days accrue dynamically: 3 grace days for every full 30-day month
// a lot has been in storage, not a flat allowance granted upfront.
// rate shown on facility cards is ₹/crate/month. Bill below is computed from
// that same rate, not a separate hardcoded number, so the two always agree.
function computeBill(qty, daysStored, monthlyRatePerCrate) {
  const monthsCompleted = Math.floor(daysStored / 30);
  const graceDays = monthsCompleted * GRACE_DAYS_PER_MONTH_STORED;
  const billableDays = Math.max(0, daysStored - graceDays);
  const dailyRate = monthlyRatePerCrate / 30;
  const caCharge = Math.round(billableDays * dailyRate * qty);
  const rental = qty * CRATE_RENTAL_PER_CRATE;
  return { caCharge, rental, graceDays, total: caCharge + rental };
}

const MY_LOTS = [
  {
    id: "L-2091", facility: "Fruit Basket Cold Chain Pvt Ltd", chamber: "Chamber 5",
    qty: 100, unit: "crates", quality: "Grade A", intake: "28 Jun 2026",
    daysStored: 9, shelfLifeDays: 120, balance: "In Storage",
  },
  {
    id: "L-2077", facility: "Fruit Basket Cold Chain Pvt Ltd", chamber: "Chamber 2",
    qty: 60, unit: "crates", quality: "Grade B", intake: "28 May 2026",
    daysStored: 40, shelfLifeDays: 120, balance: "In Storage",
  },
];

const ACTIVITY = [
  { text: "Gate In — Rohit Fruit, 450 crates, Vehicle JK04G-6423", time: "2 min ago", type: "green" },
  { text: "Dispatch request — GH Mohl., Lot L-1987", time: "14 min ago", type: "amber" },
  { text: "Quality graded — Shabir A., Lot L-2088, Grade A", time: "38 min ago", type: "green" },
  { text: "Booking confirmed — new farmer via app", time: "1 hr ago", type: "amber" },
  { text: "Gate In — MMI Fru., 80 crates, Vehicle JK09C-7130", time: "2 hr ago", type: "green" },
];

/* Module 2 — Grower & Agreement (staff-facing onboarding) */
const GROWERS = [
  { name: "Rohit Fruit", village: "Lassipora, Pulwama", phone: "+91 9906712345", rate: 18, status: "active" },
  { name: "GH Mohl.", village: "Pulwama", phone: "+91 9797123456", rate: 18, status: "active" },
  { name: "Shabir A.", village: "Shopian", phone: "+91 9622334455", rate: 20, status: "active" },
];

/* Module 4 — Intake & Storage Operations */
const GATE_ENTRIES = [
  { lotId: "L-2101", grower: "Rohit Fruit", vehicle: "JK04G-6423", qty: 450, status: "Pending Weight" },
  { lotId: "L-2100", grower: "MMI Fru.", vehicle: "JK09C-7130", qty: 80, status: "Weighed" },
];

const WEIGHING_QUEUE = [
  { lotId: "L-2101", grower: "Rohit Fruit", qty: 450, arrived: "12 min ago" },
];

const QC_QUEUE = [
  { lotId: "L-2100", grower: "MMI Fru.", qty: 80, weight: "1,840 kg" },
  { lotId: "L-2095", grower: "Shabir A.", qty: 200, weight: "4,120 kg" },
];

const BIN_QUEUE = [
  { lotId: "L-2088", grower: "Shabir A.", qty: 200, grade: "Grade A" },
];

const DISPATCH_QUEUE = [
  { lotId: "L-1987", grower: "GH Mohl.", qty: 50, requested: "14 min ago", status: "pending" },
  { lotId: "L-1955", grower: "Rohit Fruit", qty: 30, requested: "1 day ago", status: "pending" },
];

/* Module 6 — Billing (aggregate, derived from MY_LOTS + a couple extra sample invoices) */
const EXTRA_INVOICES = [
  { lotId: "L-1901", grower: "GH Mohl.", qty: 80, daysStored: 55, facility: "Fruit Basket Cold Chain Pvt Ltd", status: "billed" },
  { lotId: "L-1877", grower: "Shabir A.", qty: 150, daysStored: 70, facility: "Fruit Basket Cold Chain Pvt Ltd", status: "settled" },
];

/* Module 8 — Notifications */
const NOTIFICATIONS = [
  { farmer: "Rohit Fruit", channel: "WhatsApp", event: "Booking Confirmed", message: "Booking confirmed. Bring your produce anytime.", sent: "2 hr ago", status: "Delivered" },
  { farmer: "MMI Fru.", channel: "SMS", event: "Gate In", message: "Your produce (80 crates) received.", sent: "2 hr ago", status: "Delivered" },
  { farmer: "Shabir A.", channel: "WhatsApp", event: "Quality Graded", message: "Lot L-2088 graded: Grade A.", sent: "38 min ago", status: "Delivered" },
  { farmer: "GH Mohl.", channel: "SMS", event: "Dispatch Requested", message: "Your pickup request has been received.", sent: "14 min ago", status: "Pending" },
];

/* ======================= NAVIGATION ======================= */

function switchTab(tab) {
  document.querySelectorAll(".tab-btn").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
  document.querySelectorAll(".view").forEach((v) => v.classList.toggle("active", v.id === "view-" + tab));
}

function switchSub(scope, sub) {
  const section = document.getElementById("view-" + scope);
  section.querySelectorAll(".subnav-btn").forEach((b) => b.classList.toggle("active", b.dataset.sub === sub));
  section.querySelectorAll(".subview").forEach((v) => v.classList.toggle("active", v.id === scope + "-" + sub));
}

/* ======================= FARMER APP ======================= */

function renderFacilities() {
  const wrap = document.getElementById("facility-list");
  wrap.innerHTML = FACILITIES.map((f, i) => {
    const available = Math.round(f.capacity * (1 - f.used / 100));
    return `
      <div class="card">
        <h3>${f.name}</h3>
        <div class="loc">${f.loc} &middot; ${f.commodities.join(", ")}</div>
        <div class="capacity-bar"><div class="capacity-fill" style="width:${f.used}%"></div></div>
        <div class="capacity-label"><span>${f.used}% full</span><span>${available.toLocaleString()} crates available</span></div>
        <div class="rate-row">
          <div class="rate">₹${f.rate}<small>/crate/month</small></div>
          <button class="btn btn-primary" onclick="openBooking(${i})">Book Slot</button>
        </div>
      </div>`;
  }).join("");
}

function renderLots() {
  const wrap = document.getElementById("lot-list");
  wrap.innerHTML = MY_LOTS.map((l) => {
    const pct = Math.min(100, Math.round((l.daysStored / l.shelfLifeDays) * 100));
    const remaining = l.shelfLifeDays - l.daysStored;
    const facilityRate = FACILITIES.find((f) => f.name === l.facility).rate;
    const bill = computeBill(l.qty, l.daysStored, facilityRate);
    return `
      <div class="card">
        <h3>Lot ${l.id}</h3>
        <div class="loc">${l.facility} &middot; ${l.chamber}</div>
        <div class="lot-card">
          <div class="lot-field"><div class="label">Quantity</div><div class="val">${l.qty} ${l.unit}</div></div>
          <div class="lot-field"><div class="label">Quality</div><div class="val">${l.quality}</div></div>
          <div class="lot-field"><div class="label">Intake Date</div><div class="val">${l.intake}</div></div>
        </div>
        <span class="lot-status">${l.balance}</span>
        <div class="lot-progress">
          <div class="lot-progress-bar"><div class="lot-progress-fill" style="width:${pct}%"></div></div>
          <div class="lot-progress-label">${remaining} days estimated shelf life remaining</div>
        </div>
        <div style="margin-top:16px;">
          <div class="bill-line"><span>CA Rate (${l.daysStored} days stored, ${bill.graceDays} grace days earned)</span><span>₹${bill.caCharge.toLocaleString()}</span></div>
          <div class="bill-line"><span>Crate Rental</span><span>₹${bill.rental.toLocaleString()}</span></div>
          <div class="bill-line total"><span>Running Total</span><span>₹${bill.total.toLocaleString()}</span></div>
        </div>
        <div class="rate-row" style="margin-top:14px;">
          <button class="btn btn-ghost" onclick="requestPickup('${l.id}')">Request Pickup</button>
        </div>
      </div>`;
  }).join("");
}

let bookingIndex = 0;
function openBooking(i) {
  bookingIndex = i;
  const f = FACILITIES[i];
  document.getElementById("modal-facility-name").textContent = f.name;
  document.getElementById("modal-body").innerHTML = `
    <label>Your Name</label>
    <input type="text" id="booking-name" placeholder="e.g. Rohit Fruit" value="Rohit Fruit" />
    <label>Phone Number</label>
    <input type="text" id="booking-phone" placeholder="+91 9XXXXXXXXX" value="+91 9906712345" />
    <label>Quantity (crates)</label>
    <input type="text" id="booking-qty" placeholder="e.g. 100" value="100" />
    <label>Commodity</label>
    <select id="booking-commodity">${f.commodities.map((c) => `<option>${c}</option>`).join("")}</select>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="confirmBooking()">Confirm Booking</button>
    </div>`;
  document.getElementById("modal-overlay").classList.add("open");
}

function confirmBooking() {
  const f = FACILITIES[bookingIndex];
  const name = document.getElementById("booking-name").value || "Rohit Fruit";
  document.getElementById("modal-body").innerHTML = `
    <div class="success-box">
      <div class="check">&#10003;</div>
      <h3 style="margin-bottom:6px;">Booking Confirmed</h3>
      <p style="color:#616b64;font-size:0.9rem;line-height:1.5;">
        A storage agreement has been auto-generated for <strong>${name}</strong> at
        <strong>${f.name}</strong> — CA Rate ₹${f.rate}/crate/month. Earn 3 grace days for every month stored.
      </p>
      <p style="color:#3a8955;font-weight:700;font-size:0.85rem;margin-top:14px;">
        &#128172; SMS/WhatsApp sent: "Booking confirmed. Bring your produce to ${f.name} anytime."
      </p>
      <button class="btn btn-primary" style="margin-top:18px;width:100%;" onclick="closeModal()">Done</button>
    </div>`;
}

function requestPickup(lotId) {
  alert(`Pickup requested for ${lotId}.\n\nSimulated: this now appears in the facility's Staff App → Dispatch Queue for confirmation.`);
}

function closeModal() {
  document.getElementById("modal-overlay").classList.remove("open");
}

/* ======================= STAFF APP ======================= */

function renderGrowerTable() {
  document.getElementById("grower-table").innerHTML = GROWERS.map((g) => `
    <tr><td>${g.name}</td><td>${g.village}</td><td>${g.phone}</td><td>₹${g.rate}/crate/mo</td><td><span class="badge badge-active">Active</span></td></tr>
  `).join("");
}

function onboardGrower() {
  const name = document.getElementById("ob-name").value || "New Grower";
  const village = document.getElementById("ob-village").value || "—";
  const phone = document.getElementById("ob-phone").value || "—";
  const rate = parseFloat(document.getElementById("ob-rate").value) || 18;
  GROWERS.unshift({ name, village, phone, rate, status: "active" });
  renderGrowerTable();
  populateGateInGrowers();
  alert(`Grower "${name}" onboarded. Agreement auto-generated: CA Rate ₹${rate}/crate/month, 3 grace days per month stored.`);
}

function populateGateInGrowers() {
  document.getElementById("gi-grower").innerHTML = GROWERS.map((g) => `<option>${g.name}</option>`).join("");
}

function renderGateInTable() {
  document.getElementById("gatein-table").innerHTML = GATE_ENTRIES.map((e) => `
    <tr><td>${e.lotId}</td><td>${e.grower}</td><td>${e.vehicle}</td><td>${e.qty} crates</td><td><span class="badge ${e.status === "Weighed" ? "badge-active" : "badge-pending"}">${e.status}</span></td></tr>
  `).join("");
}

function gateIn() {
  const grower = document.getElementById("gi-grower").value;
  const vehicle = document.getElementById("gi-vehicle").value || "—";
  const qty = document.getElementById("gi-qty").value || "0";
  const lotId = "L-" + (2100 + GATE_ENTRIES.length + 1);
  GATE_ENTRIES.unshift({ lotId, grower, vehicle, qty, status: "Pending Weight" });
  WEIGHING_QUEUE.unshift({ lotId, grower, qty, arrived: "just now" });
  renderGateInTable();
  renderWeighingQueue();
  alert(`Gate In recorded for ${grower}. Lot ${lotId} created.\n\nSimulated: SMS/WhatsApp sent — "Your produce received."`);
}

function renderWeighingQueue() {
  const wrap = document.getElementById("weighing-queue");
  if (WEIGHING_QUEUE.length === 0) { wrap.innerHTML = `<p style="color:var(--ink-500);">No lots waiting to be weighed.</p>`; return; }
  wrap.innerHTML = WEIGHING_QUEUE.map((w, i) => `
    <div class="queue-card">
      <div><div class="who">${w.lotId} — ${w.grower}</div><div class="meta">${w.qty} crates &middot; arrived ${w.arrived}</div></div>
      <div class="queue-actions"><button class="btn btn-primary" onclick="confirmWeight(${i})">Capture Weight (Weighbridge)</button></div>
    </div>`).join("");
}

function confirmWeight(i) {
  const w = WEIGHING_QUEUE[i];
  const simulatedWeight = (w.qty * 20 + Math.floor(Math.random() * 40)).toLocaleString();
  QC_QUEUE.unshift({ lotId: w.lotId, grower: w.grower, qty: w.qty, weight: simulatedWeight + " kg" });
  WEIGHING_QUEUE.splice(i, 1);
  renderWeighingQueue();
  renderQcQueue();
  alert(`Weight captured for ${w.lotId}: ${simulatedWeight} kg. Moved to Quality Control queue.`);
}

function renderQcQueue() {
  const wrap = document.getElementById("qc-queue");
  if (QC_QUEUE.length === 0) { wrap.innerHTML = `<p style="color:var(--ink-500);">No lots waiting for grading.</p>`; return; }
  wrap.innerHTML = QC_QUEUE.map((q, i) => `
    <div class="queue-card">
      <div><div class="who">${q.lotId} — ${q.grower}</div><div class="meta">${q.qty} crates &middot; ${q.weight}</div></div>
      <div class="queue-actions">
        <button class="btn btn-ghost" onclick="gradeLot(${i}, 'Grade B')">Grade B</button>
        <button class="btn btn-primary" onclick="gradeLot(${i}, 'Grade A')">Grade A</button>
      </div>
    </div>`).join("");
}

function gradeLot(i, grade) {
  const q = QC_QUEUE[i];
  BIN_QUEUE.unshift({ lotId: q.lotId, grower: q.grower, qty: q.qty, grade });
  QC_QUEUE.splice(i, 1);
  renderQcQueue();
  renderBinQueue();
  alert(`${q.lotId} graded: ${grade} (photo evidence attached). Moved to Bin Allocation queue.\n\nSimulated: WhatsApp sent to ${q.grower}.`);
}

function renderBinQueue() {
  const wrap = document.getElementById("bin-queue");
  if (BIN_QUEUE.length === 0) { wrap.innerHTML = `<p style="color:var(--ink-500);">No graded lots waiting for storage allocation.</p>`; return; }
  wrap.innerHTML = BIN_QUEUE.map((b, i) => `
    <div class="queue-card">
      <div><div class="who">${b.lotId} — ${b.grower}</div><div class="meta">${b.qty} crates &middot; ${b.grade}</div></div>
      <div class="queue-actions"><button class="btn btn-primary" onclick="allocateBin(${i})">Assign Chamber 5, Bin 12 &amp; Print Sticker</button></div>
    </div>`).join("");
}

function allocateBin(i) {
  const b = BIN_QUEUE[i];
  BIN_QUEUE.splice(i, 1);
  renderBinQueue();
  ACTIVITY.unshift({ text: `Stored — ${b.grower}, ${b.lotId}, Chamber 5`, time: "just now", type: "green" });
  renderDashboard();
  alert(`${b.lotId} stored in Chamber 5, Bin 12. Sticker sent to printer.\n\nSimulated: WhatsApp sent — "Your lot is now stored in Chamber 5."`);
}

function renderDispatchQueue() {
  const wrap = document.getElementById("dispatch-queue");
  wrap.innerHTML = DISPATCH_QUEUE.map((d, i) => `
    <div class="queue-card">
      <div><div class="who">${d.lotId} — ${d.grower}</div><div class="meta">${d.qty} crates &middot; requested ${d.requested}</div></div>
      <div class="queue-actions">
        <span class="badge badge-pending" style="margin-right:8px;">${d.status}</span>
        <button class="btn btn-primary" onclick="confirmDispatch(${i})">Confirm &amp; Load</button>
      </div>
    </div>`).join("");
}

function confirmDispatch(i) {
  const d = DISPATCH_QUEUE[i];
  DISPATCH_QUEUE.splice(i, 1);
  renderDispatchQueue();
  alert(`${d.lotId} confirmed and marked as loaded.\n\nInvoice auto-generated and sent to ${d.grower} via WhatsApp/SMS.`);
}

/* ======================= ADMIN DASHBOARD ======================= */

function renderDashboard() {
  const wrap = document.getElementById("chamber-grid");
  let html = "";
  for (let i = 1; i <= 16; i++) {
    const active = Math.random() > 0.35;
    const qty = active ? Math.floor(Math.random() * 5000 + 500) : 0;
    html += `
      <div class="chamber ${active ? "active" : ""}">
        <div class="num">Chamber ${i}</div>
        ${active
          ? `<div class="qty">${qty.toLocaleString()} crates</div><div class="date">First in: 2${i % 9}.06.2026</div>`
          : `<div class="qty" style="color:#8a9088;">Empty</div>`}
      </div>`;
  }
  wrap.innerHTML = html;

  const feed = document.getElementById("activity-feed");
  feed.innerHTML = ACTIVITY.map((a) => `
    <div class="activity-item">
      <span class="activity-dot ${a.type === "amber" ? "amber" : ""}"></span>
      <span>${a.text}</span>
      <span class="activity-time">${a.time}</span>
    </div>`).join("");
}

function allInvoiceableLots() {
  const fromMyLots = MY_LOTS.map((l) => ({ lotId: l.id, grower: "Rohit Fruit", qty: l.qty, daysStored: l.daysStored, facility: l.facility, status: "unbilled" }));
  return [...fromMyLots, ...EXTRA_INVOICES];
}

function renderInvoices() {
  const rows = allInvoiceableLots();
  let totalBilled = 0, unbilled = 0, graceSum = 0;
  const trs = rows.map((r) => {
    const rate = FACILITIES.find((f) => f.name === r.facility).rate;
    const bill = computeBill(r.qty, r.daysStored, rate);
    if (r.status === "unbilled") unbilled += bill.total; else totalBilled += bill.total;
    graceSum += bill.graceDays;
    const badgeClass = r.status === "settled" ? "badge-done" : r.status === "billed" ? "badge-active" : "badge-pending";
    return `<tr><td>${r.lotId}</td><td>${r.grower}</td><td>₹${bill.caCharge.toLocaleString()}</td><td>₹${bill.rental.toLocaleString()}</td><td>₹${bill.total.toLocaleString()}</td><td><span class="badge ${badgeClass}">${r.status}</span></td></tr>`;
  }).join("");
  document.getElementById("invoice-table").innerHTML = trs;
  document.getElementById("stat-total-billed").textContent = "₹" + totalBilled.toLocaleString();
  document.getElementById("stat-unbilled").textContent = "₹" + unbilled.toLocaleString();
  document.getElementById("stat-invoice-count").textContent = rows.length;
  document.getElementById("stat-avg-grace").textContent = Math.round(graceSum / rows.length) + " days";
}

function runImport() {
  const result = document.getElementById("import-result");
  result.innerHTML = `<p style="color:var(--ink-500);">Parsing CSV export...</p>`;
  setTimeout(() => {
    result.innerHTML = `
      <div class="grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:20px;">
        <div class="stat-card"><div class="num">312</div><div class="lbl">Records Processed</div></div>
        <div class="stat-card"><div class="num">296</div><div class="lbl">Succeeded</div></div>
        <div class="stat-card"><div class="num">16</div><div class="lbl">Failed / Exceptions</div></div>
        <div class="stat-card"><div class="num">100%</div><div class="lbl">Historical + Active Lots</div></div>
      </div>
      <div class="section-title"><h2>Exception Report</h2><p>Reviewed before final commit — nothing silently dropped</p></div>
      <div class="table-wrap"><table class="data-table">
        <thead><tr><th>Source Row</th><th>Reason</th></tr></thead>
        <tbody>
          <tr><td>Gid 20441</td><td>Ref Grower "ROHI..." could not be matched to an existing farmer record</td></tr>
          <tr><td>Gid 20487</td><td>Missing Chamber value — cannot map to lot_placements</td></tr>
          <tr><td>Gid 20502</td><td>Duplicate Lot No. — already imported in a prior batch</td></tr>
        </tbody>
      </table></div>`;
  }, 900);
}

function renderNotifications() {
  document.getElementById("notification-table").innerHTML = NOTIFICATIONS.map((n) => `
    <tr><td>${n.farmer}</td><td>${n.channel}</td><td>${n.event}</td><td style="color:var(--ink-500);">${n.message}</td><td>${n.sent}</td><td><span class="badge ${n.status === "Delivered" ? "badge-active" : "badge-pending"}">${n.status}</span></td></tr>
  `).join("");
}

function renderFacilityTable() {
  document.getElementById("facility-table").innerHTML = FACILITIES.map((f) => `
    <tr><td>${f.name}</td><td>${f.loc}</td><td>${f.track}</td><td>${f.lastSync}</td><td><span class="badge ${f.syncStatus === "healthy" ? "badge-active" : "badge-error"}">${f.syncStatus}</span></td></tr>
  `).join("");
}

/* ======================= INIT ======================= */

document.addEventListener("DOMContentLoaded", () => {
  renderFacilities();
  renderLots();
  renderDashboard();

  renderGrowerTable();
  populateGateInGrowers();
  renderGateInTable();
  renderWeighingQueue();
  renderQcQueue();
  renderBinQueue();
  renderDispatchQueue();

  renderInvoices();
  renderNotifications();
  renderFacilityTable();
});
