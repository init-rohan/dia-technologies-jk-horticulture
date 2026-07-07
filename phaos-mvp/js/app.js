const GRACE_PERIOD_DAYS = 15;
const CRATE_RENTAL_PER_CRATE = 5;

const FACILITIES = [
  { name: "Fruit Basket Cold Chain Pvt Ltd", loc: "Lassipora, Pulwama", used: 78, capacity: 5000, rate: 18, commodities: ["Apple", "Plum"] },
  { name: "Wadoora CA Storage", loc: "Lassipora, Pulwama", used: 45, capacity: 4200, rate: 16, commodities: ["Apple", "Cherry"] },
  { name: "Valley Fresh Cold Store", loc: "Shopian", used: 92, capacity: 3600, rate: 20, commodities: ["Apple", "Pear"] },
  { name: "Himalayan Agro Storage", loc: "Pulwama", used: 30, capacity: 5000, rate: 17, commodities: ["Apple", "Apricot"] },
];

// rate shown on facility cards is ₹/crate/month. Bill below is computed from
// that same rate, not a separate hardcoded number, so the two always agree.
function computeBill(qty, daysStored, monthlyRatePerCrate) {
  const billableDays = Math.max(0, daysStored - GRACE_PERIOD_DAYS);
  const dailyRate = monthlyRatePerCrate / 30;
  const caCharge = Math.round(billableDays * dailyRate * qty);
  const rental = qty * CRATE_RENTAL_PER_CRATE;
  const freeDays = Math.min(daysStored, GRACE_PERIOD_DAYS);
  const lines = [
    [`CA Rate (${daysStored} days stored, first ${freeDays} free)`, caCharge === 0 ? "₹0" : "₹" + caCharge.toLocaleString()],
    ["Crate Rental", "₹" + rental.toLocaleString()],
  ];
  return { lines, total: caCharge + rental };
}

const MY_LOTS = [
  {
    id: "L-2091", facility: "Fruit Basket Cold Chain Pvt Ltd", chamber: "Chamber 5",
    qty: 100, unit: "crates", quality: "Grade A", intake: "28 Jun 2026",
    daysStored: 9, shelfLifeDays: 120, balance: "In Storage",
  },
  {
    id: "L-2077", facility: "Fruit Basket Cold Chain Pvt Ltd", chamber: "Chamber 2",
    qty: 60, unit: "crates", quality: "Grade B", intake: "15 Jun 2026",
    daysStored: 22, shelfLifeDays: 120, balance: "In Storage",
  },
];

const ACTIVITY = [
  { text: "Gate In — Rohit Fruit, 450 crates, Vehicle JK04G-6423", time: "2 min ago", type: "green" },
  { text: "Dispatch request — GH Mohl., Lot L-1987", time: "14 min ago", type: "amber" },
  { text: "Quality graded — Shabir A., Lot L-2088, Grade A", time: "38 min ago", type: "green" },
  { text: "Booking confirmed — new farmer via app", time: "1 hr ago", type: "amber" },
  { text: "Gate In — MMI Fru., 80 crates, Vehicle JK09C-7130", time: "2 hr ago", type: "green" },
];

function renderFacilities() {
  const wrap = document.getElementById("facility-list");
  wrap.innerHTML = FACILITIES.map((f, i) => {
    const pct = Math.round((f.used / 100) * 100);
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
          ${bill.lines.map(([label, amt]) => `<div class="bill-line"><span>${label}</span><span>${amt}</span></div>`).join("")}
          <div class="bill-line total"><span>Running Total</span><span>₹${bill.total.toLocaleString()}</span></div>
        </div>
        <div class="rate-row" style="margin-top:14px;">
          <button class="btn btn-ghost" onclick="requestPickup('${l.id}')">Request Pickup</button>
        </div>
      </div>`;
  }).join("");
}

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

function switchTab(tab) {
  document.querySelectorAll(".tab-btn").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
  document.querySelectorAll(".view").forEach((v) => v.classList.toggle("active", v.id === "view-" + tab));
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
        <strong>${f.name}</strong> — CA Rate ₹${f.rate.toFixed(2)}/crate/month, 15-day grace period.
      </p>
      <p style="color:#3a8955;font-weight:700;font-size:0.85rem;margin-top:14px;">
        &#128172; SMS/WhatsApp sent: "Booking confirmed. Bring your produce to ${f.name} anytime."
      </p>
      <button class="btn btn-primary" style="margin-top:18px;width:100%;" onclick="closeModal()">Done</button>
    </div>`;
}

function requestPickup(lotId) {
  alert(`Pickup requested for ${lotId}.\n\nSimulated: facility staff notified. Farmer will receive a WhatsApp update once loading begins.`);
}

function closeModal() {
  document.getElementById("modal-overlay").classList.remove("open");
}

document.addEventListener("DOMContentLoaded", () => {
  renderFacilities();
  renderLots();
  renderDashboard();
});
