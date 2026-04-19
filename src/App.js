
import { useState, useEffect, useCallback } from "react";

// ─── Storage helpers ────────────────────────────────────────────
const useStorage = (key, initial) => {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : initial; }
    catch { return initial; }
  });
  const set = useCallback(v => {
    setVal(v);
    try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
  }, [key]);
  return [val, set];
};

// ─── Constants ──────────────────────────────────────────────────
const SERVICE_TYPES = [
  { id: "oil",        name: "Oil Change",          icon: "🛢️",  milesInterval: 5000,  monthInterval: 6,  color: "amber" },
  { id: "tires",      name: "Tire Rotation",        icon: "🔄",  milesInterval: 7500,  monthInterval: 6,  color: "blue" },
  { id: "airfilter",  name: "Engine Air Filter",    icon: "🌬️",  milesInterval: 15000, monthInterval: 12, color: "teal" },
  { id: "cabin",      name: "Cabin Air Filter",     icon: "💨",  milesInterval: 15000, monthInterval: 12, color: "cyan" },
  { id: "brakes",     name: "Brake Service",        icon: "🛑",  milesInterval: 25000, monthInterval: 24, color: "red" },
  { id: "trans",      name: "Transmission Fluid",   icon: "⚙️",  milesInterval: 30000, monthInterval: 24, color: "purple" },
  { id: "coolant",    name: "Coolant Flush",        icon: "🌡️",  milesInterval: 30000, monthInterval: 24, color: "indigo" },
  { id: "sparks",     name: "Spark Plugs",          icon: "⚡",  milesInterval: 30000, monthInterval: 36, color: "yellow" },
  { id: "battery",    name: "Battery Check",        icon: "🔋",  milesInterval: 0,     monthInterval: 12, color: "green" },
  { id: "balance",    name: "Tire Balance",         icon: "⚖️",  milesInterval: 10000, monthInterval: 12, color: "sky" },
  { id: "wipers",     name: "Wiper Blades",         icon: "🌧️",  milesInterval: 0,     monthInterval: 12, color: "slate" },
  { id: "inspect",    name: "Full Inspection",      icon: "🔍",  milesInterval: 0,     monthInterval: 12, color: "orange" },
];

const VEHICLE_ICONS = ["🚗","🚙","🛻","🚐","🏎️","🚕"];
const COLORS = {
  amber:  { bg: "bg-amber-500",  light: "bg-amber-50",  border: "border-amber-200",  text: "text-amber-700",  dot: "bg-amber-400"  },
  blue:   { bg: "bg-blue-500",   light: "bg-blue-50",   border: "border-blue-200",   text: "text-blue-700",   dot: "bg-blue-400"   },
  teal:   { bg: "bg-teal-500",   light: "bg-teal-50",   border: "border-teal-200",   text: "text-teal-700",   dot: "bg-teal-400"   },
  cyan:   { bg: "bg-cyan-500",   light: "bg-cyan-50",   border: "border-cyan-200",   text: "text-cyan-700",   dot: "bg-cyan-400"   },
  red:    { bg: "bg-red-500",    light: "bg-red-50",    border: "border-red-200",    text: "text-red-700",    dot: "bg-red-400"    },
  purple: { bg: "bg-purple-500", light: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", dot: "bg-purple-400" },
  indigo: { bg: "bg-indigo-500", light: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700", dot: "bg-indigo-400" },
  yellow: { bg: "bg-yellow-500", light: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", dot: "bg-yellow-400" },
  green:  { bg: "bg-green-500",  light: "bg-green-50",  border: "border-green-200",  text: "text-green-700",  dot: "bg-green-400"  },
  sky:    { bg: "bg-sky-500",    light: "bg-sky-50",    border: "border-sky-200",    text: "text-sky-700",    dot: "bg-sky-400"    },
  slate:  { bg: "bg-slate-500",  light: "bg-slate-50",  border: "border-slate-200",  text: "text-slate-700",  dot: "bg-slate-400"  },
  orange: { bg: "bg-orange-500", light: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", dot: "bg-orange-400" },
};

const DEMO_VEHICLES = [
  {
    id: "v1", year: "2020", make: "Toyota", model: "Camry", nick: "Family Car",
    mileage: 52400, icon: "🚗", color: "#3B82F6",
    services: {
      oil:       { date: "2024-08-15", miles: 50100, cost: 65 },
      tires:     { date: "2024-05-10", miles: 47500, cost: 25 },
      airfilter: { date: "2023-08-01", miles: 41000, cost: 28 },
      brakes:    { date: "2024-01-20", miles: 45000, cost: 280 },
      battery:   { date: "2023-11-01", miles: 48000, cost: 0 },
    },
    reminders: [{ id: "r1", type: "oil", dueDate: "2025-02-15", dueMiles: 55100, note: "Synthetic preferred" }]
  },
  {
    id: "v2", year: "2018", make: "Ford", model: "F-150", nick: "Work Truck",
    mileage: 87600, icon: "🛻", color: "#EF4444",
    services: {
      oil:     { date: "2024-09-01", miles: 86000, cost: 85 },
      tires:   { date: "2024-06-15", miles: 83000, cost: 30 },
      battery: { date: "2023-04-01", miles: 72000, cost: 0 },
      brakes:  { date: "2023-12-01", miles: 80000, cost: 350 },
    },
    reminders: []
  },
  {
    id: "v3", year: "2022", make: "Honda", model: "CR-V", nick: "Daily Driver",
    mileage: 31200, icon: "🚙", color: "#10B981",
    services: {
      oil:     { date: "2024-10-20", miles: 30000, cost: 75 },
      tires:   { date: "2024-10-20", miles: 30000, cost: 0 },
      inspect: { date: "2024-06-01", miles: 27000, cost: 120 },
    },
    reminders: []
  },
];

// ─── Helpers ────────────────────────────────────────────────────
function getServiceStatus(vehicle, svcId) {
  const svc = SERVICE_TYPES.find(s => s.id === svcId);
  const last = vehicle.services?.[svcId];
  const today = new Date();
  let nextMiles = null, nextDate = null;

  if (last) {
    if (svc.milesInterval) nextMiles = last.miles + svc.milesInterval;
    if (svc.monthInterval) {
      const d = new Date(last.date);
      d.setMonth(d.getMonth() + svc.monthInterval);
      nextDate = d;
    }
  } else {
    nextDate = new Date(today.getTime() - 86400000);
  }

  const mileOverdue = nextMiles && vehicle.mileage >= nextMiles;
  const dateOverdue = nextDate && today >= nextDate;
  const mileSoon = nextMiles && !mileOverdue && (nextMiles - vehicle.mileage) < 1000;
  const dateSoon = nextDate && !dateOverdue && ((nextDate - today) < 45 * 86400000);

  let status = "ok";
  if (mileOverdue || dateOverdue) status = "overdue";
  else if (mileSoon || dateSoon) status = "soon";

  let dueText = "";
  if (nextMiles) dueText = `Due at ${nextMiles.toLocaleString()} mi`;
  if (nextDate && svc.monthInterval) {
    const dateStr = nextDate.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    dueText += dueText ? ` · ${dateStr}` : dateStr;
  }
  if (!last) dueText = "No record — schedule recommended";

  return { status, dueText, nextMiles, nextDate, last };
}

function getAllAlerts(vehicles) {
  const alerts = [];
  vehicles.forEach(v => {
    SERVICE_TYPES.forEach(svc => {
      const { status, dueText } = getServiceStatus(v, svc.id);
      if (status !== "ok") alerts.push({ vehicle: v, svc, status, dueText });
    });
  });
  return alerts.sort((a, b) => (a.status === "overdue" ? -1 : 1));
}

function getTotalSpend(vehicle) {
  return Object.values(vehicle.services || {}).reduce((s, r) => s + (r.cost || 0), 0);
}

// ─── Sub-components ─────────────────────────────────────────────
function StatusBadge({ status }) {
  if (status === "overdue") return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">OVERDUE</span>;
  if (status === "soon")    return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">DUE SOON</span>;
  return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">OK</span>;
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div className={`rounded-2xl p-5 ${accent} text-white shadow-lg`}>
      <div className="text-3xl font-black tracking-tight">{value}</div>
      <div className="text-sm font-semibold mt-1 opacity-90">{label}</div>
      {sub && <div className="text-xs opacity-70 mt-0.5">{sub}</div>}
    </div>
  );
}

// ─── VIEWS ──────────────────────────────────────────────────────

function Dashboard({ vehicles, onSelectVehicle, onAddVehicle }) {
  const alerts = getAllAlerts(vehicles);
  const overdue = alerts.filter(a => a.status === "overdue").length;
  const soon = alerts.filter(a => a.status === "soon").length;
  const totalSpend = vehicles.reduce((s, v) => s + getTotalSpend(v), 0);

  return (
    <div className="space-y-8">
      {/* Hero stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Vehicles" value={vehicles.length} sub="in garage" accent="bg-gradient-to-br from-slate-800 to-slate-700" />
        <StatCard label="Overdue" value={overdue} sub="need service" accent={overdue > 0 ? "bg-gradient-to-br from-red-500 to-rose-600" : "bg-gradient-to-br from-emerald-500 to-teal-600"} />
        <StatCard label="Due Soon" value={soon} sub="within 45 days" accent={soon > 0 ? "bg-gradient-to-br from-amber-500 to-orange-500" : "bg-gradient-to-br from-emerald-500 to-teal-600"} />
        <StatCard label="Total Spend" value={`$${totalSpend.toLocaleString()}`} sub="logged service costs" accent="bg-gradient-to-br from-violet-600 to-purple-700" />
      </div>

      {/* Vehicle cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Your Garage</h2>
          <button onClick={onAddVehicle} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition-colors">
            <span className="text-lg leading-none">+</span> Add Vehicle
          </button>
        </div>
        {vehicles.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <div className="text-5xl mb-3">🏎️</div>
            <p className="text-slate-500 font-medium">No vehicles yet.</p>
            <button onClick={onAddVehicle} className="mt-4 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold">Add your first vehicle</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map(v => {
              const { status } = getServiceStatus(v, "oil");
              const allStatuses = SERVICE_TYPES.map(s => getServiceStatus(v, s.id).status);
              const vStatus = allStatuses.includes("overdue") ? "overdue" : allStatuses.includes("soon") ? "soon" : "ok";
              const spend = getTotalSpend(v);
              const overdueCount = allStatuses.filter(s => s === "overdue").length;
              const soonCount = allStatuses.filter(s => s === "soon").length;
              return (
                <button key={v.id} onClick={() => onSelectVehicle(v.id)}
                  className="text-left rounded-2xl border-2 border-slate-100 bg-white shadow-sm hover:shadow-md hover:border-slate-300 transition-all p-5 group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{v.icon}</div>
                    <StatusBadge status={vStatus} />
                  </div>
                  <div className="font-black text-slate-900 text-lg tracking-tight">{v.year} {v.make} {v.model}</div>
                  <div className="text-slate-500 text-sm font-medium mt-0.5">{v.nick} · {v.mileage.toLocaleString()} mi</div>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-xs text-slate-500">
                      {overdueCount > 0 && <span className="text-red-600 font-bold">{overdueCount} overdue</span>}
                      {overdueCount > 0 && soonCount > 0 && " · "}
                      {soonCount > 0 && <span className="text-amber-600 font-bold">{soonCount} soon</span>}
                      {overdueCount === 0 && soonCount === 0 && <span className="text-emerald-600 font-bold">All up to date</span>}
                    </div>
                    <div className="text-xs text-slate-400 font-medium">${spend.toLocaleString()} logged</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent alerts */}
      {alerts.length > 0 && (
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight mb-4">Action Needed</h2>
          <div className="space-y-2">
            {alerts.slice(0, 5).map((a, i) => (
              <button key={i} onClick={() => onSelectVehicle(a.vehicle.id)}
                className="w-full text-left flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow transition-all">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${a.status === "overdue" ? "bg-red-500" : "bg-amber-500"}`} />
                <span className="text-xl">{a.svc.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 text-sm">{a.svc.name}</div>
                  <div className="text-xs text-slate-500 truncate">{a.vehicle.year} {a.vehicle.make} {a.vehicle.model} · {a.dueText}</div>
                </div>
                <StatusBadge status={a.status} />
              </button>
            ))}
            {alerts.length > 5 && <p className="text-xs text-slate-400 text-center pt-1">+{alerts.length - 5} more alerts — check the Alerts tab</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function VehicleDetail({ vehicle, onBack, onUpdateVehicle }) {
  const [activeTab, setActiveTab] = useState("schedule");
  const [showAddService, setShowAddService] = useState(false);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [serviceForm, setServiceForm] = useState({ type: "oil", date: new Date().toISOString().split("T")[0], miles: vehicle.mileage, cost: "", note: "" });
  const [reminderForm, setReminderForm] = useState({ type: "oil", dueDate: "", dueMiles: "", note: "" });

  const schedule = SERVICE_TYPES.map(svc => ({
    ...svc,
    ...getServiceStatus(vehicle, svc.id)
  })).sort((a, b) => {
    const ord = { overdue: 0, soon: 1, ok: 2 };
    return ord[a.status] - ord[b.status];
  });

  const history = Object.entries(vehicle.services || {}).map(([id, rec]) => ({
    ...rec, id, svc: SERVICE_TYPES.find(s => s.id === id)
  })).sort((a, b) => new Date(b.date) - new Date(a.date));

  function logService() {
    const updated = {
      ...vehicle,
      services: {
        ...vehicle.services,
        [serviceForm.type]: {
          date: serviceForm.date,
          miles: parseInt(serviceForm.miles) || 0,
          cost: parseFloat(serviceForm.cost) || 0,
          note: serviceForm.note,
        }
      }
    };
    onUpdateVehicle(updated);
    setShowAddService(false);
  }

  function addReminder() {
    const updated = {
      ...vehicle,
      reminders: [...(vehicle.reminders || []), {
        id: `r${Date.now()}`,
        type: reminderForm.type,
        dueDate: reminderForm.dueDate,
        dueMiles: parseInt(reminderForm.dueMiles) || null,
        note: reminderForm.note,
      }]
    };
    onUpdateVehicle(updated);
    setShowAddReminder(false);
  }

  function deleteReminder(rid) {
    onUpdateVehicle({ ...vehicle, reminders: vehicle.reminders.filter(r => r.id !== rid) });
  }

  const totalSpend = getTotalSpend(vehicle);
  const spendByType = Object.entries(vehicle.services || {}).reduce((acc, [id, rec]) => {
    acc[id] = (acc[id] || 0) + (rec.cost || 0);
    return acc;
  }, {});

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
          <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
        </button>
        <div className="text-4xl">{vehicle.icon}</div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{vehicle.year} {vehicle.make} {vehicle.model}</h2>
          <p className="text-slate-500 font-medium">{vehicle.nick} · {vehicle.mileage.toLocaleString()} miles</p>
        </div>
        <div className="ml-auto flex gap-2">
          <button onClick={() => setShowAddService(true)} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition-colors">+ Log Service</button>
          <button onClick={() => setShowAddReminder(true)} className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-700 transition-colors">+ Reminder</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 rounded-xl p-1">
        {["schedule","history","reminders","costs"].map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold capitalize transition-all ${activeTab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Schedule tab */}
      {activeTab === "schedule" && (
        <div className="space-y-2">
          {schedule.map(item => {
            const c = COLORS[item.color] || COLORS.slate;
            return (
              <div key={item.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 bg-white transition-all
                ${item.status === "overdue" ? "border-red-200 bg-red-50" : item.status === "soon" ? "border-amber-200 bg-amber-50" : "border-slate-100"}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${item.status === "ok" ? c.light : ""}`}>{item.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900">{item.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{item.dueText}</div>
                  {item.last && <div className="text-xs text-slate-400 mt-0.5">Last: {item.last.date} · {item.last.miles?.toLocaleString()} mi{item.last.cost ? ` · $${item.last.cost}` : ""}</div>}
                </div>
                <StatusBadge status={item.status} />
              </div>
            );
          })}
        </div>
      )}

      {/* History tab */}
      {activeTab === "history" && (
        <div>
          {history.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <div className="text-4xl mb-2">📋</div>
              <p>No service history logged yet.</p>
              <button onClick={() => setShowAddService(true)} className="mt-3 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold">Log first service</button>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200" />
              <div className="space-y-4">
                {history.map((rec, i) => (
                  <div key={i} className="relative flex gap-4 pl-12">
                    <div className="absolute left-3 top-3 w-4 h-4 rounded-full bg-white border-2 border-slate-400 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    </div>
                    <div className="flex-1 bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{rec.svc?.icon}</span>
                          <span className="font-bold text-slate-900">{rec.svc?.name}</span>
                        </div>
                        {rec.cost > 0 && <span className="text-sm font-bold text-emerald-600">${rec.cost.toFixed(2)}</span>}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">{new Date(rec.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · {rec.miles?.toLocaleString()} mi</div>
                      {rec.note && <div className="text-xs text-slate-400 mt-1 italic">"{rec.note}"</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reminders tab */}
      {activeTab === "reminders" && (
        <div className="space-y-3">
          {(!vehicle.reminders || vehicle.reminders.length === 0) ? (
            <div className="text-center py-16 text-slate-400">
              <div className="text-4xl mb-2">🔔</div>
              <p>No reminders set.</p>
              <button onClick={() => setShowAddReminder(true)} className="mt-3 px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-bold">Add first reminder</button>
            </div>
          ) : vehicle.reminders.map(rem => {
            const svc = SERVICE_TYPES.find(s => s.id === rem.type);
            const isOverdue = rem.dueDate && new Date() > new Date(rem.dueDate);
            return (
              <div key={rem.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 ${isOverdue ? "border-red-200 bg-red-50" : "border-violet-100 bg-violet-50"}`}>
                <div className="text-2xl">{svc?.icon}</div>
                <div className="flex-1">
                  <div className="font-bold text-slate-900">{svc?.name}</div>
                  {rem.dueDate && <div className="text-xs text-slate-500">By {new Date(rem.dueDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>}
                  {rem.dueMiles && <div className="text-xs text-slate-500">At {parseInt(rem.dueMiles).toLocaleString()} mi</div>}
                  {rem.note && <div className="text-xs text-slate-400 italic mt-0.5">"{rem.note}"</div>}
                </div>
                <button onClick={() => deleteReminder(rem.id)} className="text-slate-300 hover:text-red-400 transition-colors text-xl">×</button>
              </div>
            );
          })}
        </div>
      )}

      {/* Costs tab */}
      {activeTab === "costs" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-5 text-white">
              <div className="text-3xl font-black">${totalSpend.toLocaleString()}</div>
              <div className="text-sm opacity-80 mt-1">Total Logged Spend</div>
            </div>
            <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-5 text-white">
              <div className="text-3xl font-black">{history.length}</div>
              <div className="text-sm opacity-80 mt-1">Service Records</div>
            </div>
          </div>
          <h3 className="font-black text-slate-900 text-lg">Spend by Service</h3>
          <div className="space-y-2">
            {Object.entries(spendByType).filter(([,v]) => v > 0).sort(([,a],[,b]) => b-a).map(([id, amt]) => {
              const svc = SERVICE_TYPES.find(s => s.id === id);
              const pct = Math.round((amt / totalSpend) * 100);
              return (
                <div key={id} className="bg-white rounded-xl border border-slate-100 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span>{svc?.icon}</span>
                      <span className="font-bold text-slate-900 text-sm">{svc?.name}</span>
                    </div>
                    <span className="font-black text-slate-900">${amt.toFixed(2)}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {totalSpend === 0 && <div className="text-center py-10 text-slate-400">No costs logged yet. Add costs when logging service.</div>}
          </div>
        </div>
      )}

      {/* Log Service Modal */}
      {showAddService && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-black text-slate-900 mb-5">Log Service</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Service Type</label>
                <select value={serviceForm.type} onChange={e => setServiceForm(f => ({ ...f, type: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900">
                  {SERVICE_TYPES.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Date</label>
                  <input type="date" value={serviceForm.date} onChange={e => setServiceForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Mileage</label>
                  <input type="number" value={serviceForm.miles} onChange={e => setServiceForm(f => ({ ...f, miles: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Cost ($) <span className="text-slate-300 normal-case">optional</span></label>
                <input type="number" placeholder="0.00" value={serviceForm.cost} onChange={e => setServiceForm(f => ({ ...f, cost: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Note <span className="text-slate-300 normal-case">optional</span></label>
                <input type="text" placeholder="e.g. Full synthetic, Jiffy Lube" value={serviceForm.note} onChange={e => setServiceForm(f => ({ ...f, note: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddService(false)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={logService} className="flex-2 flex-1 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-700">Save Record</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Reminder Modal */}
      {showAddReminder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-black text-slate-900 mb-5">Add Reminder</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Service Type</label>
                <select value={reminderForm.type} onChange={e => setReminderForm(f => ({ ...f, type: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600">
                  {SERVICE_TYPES.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Due Date</label>
                  <input type="date" value={reminderForm.dueDate} onChange={e => setReminderForm(f => ({ ...f, dueDate: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Due Mileage</label>
                  <input type="number" placeholder="55000" value={reminderForm.dueMiles} onChange={e => setReminderForm(f => ({ ...f, dueMiles: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Note</label>
                <input type="text" placeholder="e.g. Synthetic preferred" value={reminderForm.note} onChange={e => setReminderForm(f => ({ ...f, note: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddReminder(false)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={addReminder} className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-700">Set Reminder</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AlertsView({ vehicles, onSelectVehicle }) {
  const alerts = getAllAlerts(vehicles);
  const overdue = alerts.filter(a => a.status === "overdue");
  const soon = alerts.filter(a => a.status === "soon");

  return (
    <div className="space-y-6">
      {overdue.length === 0 && soon.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">✅</div>
          <div className="text-2xl font-black text-slate-900 mb-2">All clear!</div>
          <p className="text-slate-500">Every vehicle is up to date. Nice work.</p>
        </div>
      )}
      {overdue.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <h2 className="text-lg font-black text-slate-900">Overdue ({overdue.length})</h2>
          </div>
          <div className="space-y-2">
            {overdue.map((a, i) => (
              <button key={i} onClick={() => onSelectVehicle(a.vehicle.id)}
                className="w-full text-left flex items-center gap-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl hover:bg-red-100 transition-all">
                <span className="text-2xl">{a.svc.icon}</span>
                <div className="flex-1">
                  <div className="font-bold text-slate-900">{a.svc.name}</div>
                  <div className="text-xs text-slate-500">{a.vehicle.year} {a.vehicle.make} {a.vehicle.model} · {a.vehicle.nick}</div>
                  <div className="text-xs text-red-600 font-medium mt-0.5">{a.dueText}</div>
                </div>
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
              </button>
            ))}
          </div>
        </div>
      )}
      {soon.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <h2 className="text-lg font-black text-slate-900">Due Soon ({soon.length})</h2>
          </div>
          <div className="space-y-2">
            {soon.map((a, i) => (
              <button key={i} onClick={() => onSelectVehicle(a.vehicle.id)}
                className="w-full text-left flex items-center gap-4 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl hover:bg-amber-100 transition-all">
                <span className="text-2xl">{a.svc.icon}</span>
                <div className="flex-1">
                  <div className="font-bold text-slate-900">{a.svc.name}</div>
                  <div className="text-xs text-slate-500">{a.vehicle.year} {a.vehicle.make} {a.vehicle.model} · {a.vehicle.nick}</div>
                  <div className="text-xs text-amber-700 font-medium mt-0.5">{a.dueText}</div>
                </div>
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ImportView({ vehicles, onUpdateVehicle }) {
  const [text, setText] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  function handleFile(file) {
    const reader = new FileReader();
    reader.onload = e => setText(e.target.result);
    reader.readAsText(file);
  }

  async function analyze() {
    if (!text.trim()) { setError("Please paste or upload a service record."); return; }
    if (!selectedVehicle) { setError("Please select a vehicle."); return; }
    setError(""); setLoading(true); setResult(null);

    const vehicle = vehicles.find(v => v.id === selectedVehicle);
    const prompt = `You are a vehicle maintenance expert. Parse this service record text and extract all maintenance events.

Service record:
${text}

Return ONLY a valid JSON array — no markdown, no backticks, no explanation. Each object must have:
{"service":"name","date":"YYYY-MM-DD","miles":number_or_null,"cost":number_or_null,"note":"string_or_null"}

Match service names to these exact IDs (use the id in the "service" field):
oil=Oil Change, tires=Tire Rotation, airfilter=Engine Air Filter, cabin=Cabin Air Filter, brakes=Brake Service, trans=Transmission Fluid, coolant=Coolant Flush, sparks=Spark Plugs, battery=Battery Check, balance=Tire Balance, wipers=Wiper Blades, inspect=Full Inspection

Example output: [{"service":"oil","date":"2023-04-15","miles":47250,"cost":65,"note":"Synthetic 5W-30"}]`;

    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await resp.json();
      const raw = data.content?.find(b => b.type === "text")?.text || "[]";
      let parsed;
      try { parsed = JSON.parse(raw.replace(/```json|```/g, "").trim()); } catch { parsed = []; }

      if (!parsed.length) { setError("Couldn't parse records. Try different formatting or be more explicit."); setLoading(false); return; }

      const updated = { ...vehicle, services: { ...vehicle.services } };
      parsed.forEach(ev => {
        if (ev.service && ev.date) {
          updated.services[ev.service] = { date: ev.date, miles: ev.miles || 0, cost: ev.cost || 0, note: ev.note || "" };
        }
      });
      onUpdateVehicle(updated);
      setResult(parsed);
    } catch {
      setError("Connection error. Check your network and try again.");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-900 mb-1">Import Service Records</h2>
        <p className="text-slate-500 text-sm">Claude AI will parse your service history and auto-populate the maintenance schedule.</p>
      </div>

      {/* Drop zone */}
      <label className="block border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-2xl p-8 text-center cursor-pointer transition-all bg-slate-50 hover:bg-white"
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}>
        <div className="text-4xl mb-3">📁</div>
        <div className="font-bold text-slate-700">Drop a file here or click to browse</div>
        <div className="text-slate-400 text-sm mt-1">TXT, CSV, or any plain text export from your service app</div>
        <input type="file" className="hidden" accept=".txt,.csv,.pdf,.json" onChange={e => handleFile(e.target.files[0])} />
      </label>

      {/* Paste area */}
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Or paste text directly</label>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={7}
          placeholder={"2024-08-15  Oil Change  50,100 miles  $65\n2024-05-10  Tire Rotation  47,500 miles\n2024-01-20  Brake Service  45,000 miles  $280\n..."}
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-900 resize-y bg-slate-50" />
      </div>

      {/* Vehicle select + button */}
      <div className="flex gap-3">
        <select value={selectedVehicle} onChange={e => setSelectedVehicle(e.target.value)}
          className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900">
          <option value="">Select vehicle...</option>
          {vehicles.map(v => <option key={v.id} value={v.id}>{v.icon} {v.year} {v.make} {v.model}</option>)}
        </select>
        <button onClick={analyze} disabled={loading}
          className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-700 disabled:opacity-50 flex items-center gap-2 transition-colors">
          {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Analyzing...</> : "✦ Analyze with AI"}
        </button>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">{error}</div>}

      {result && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl">
          <div className="font-black text-emerald-800 mb-3">✓ Imported {result.length} service record{result.length !== 1 ? "s" : ""}</div>
          <div className="space-y-1">
            {result.map((r, i) => {
              const svc = SERVICE_TYPES.find(s => s.id === r.service);
              return (
                <div key={i} className="flex items-center gap-2 text-sm text-emerald-700">
                  <span>{svc?.icon}</span>
                  <span className="font-medium">{svc?.name}</span>
                  <span className="text-emerald-500">·</span>
                  <span>{r.date}</span>
                  {r.miles && <><span className="text-emerald-500">·</span><span>{parseInt(r.miles).toLocaleString()} mi</span></>}
                  {r.cost > 0 && <><span className="text-emerald-500">·</span><span>${r.cost}</span></>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function AddVehicleModal({ onSave, onClose }) {
  const [form, setForm] = useState({ year: "", make: "", model: "", nick: "", mileage: "", icon: "🚗", color: "#3B82F6" });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  function save() {
    if (!form.year || !form.make || !form.model) return;
    onSave({ ...form, id: `v${Date.now()}`, mileage: parseInt(form.mileage) || 0, services: {}, reminders: [] });
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-xl font-black text-slate-900 mb-5">Add Vehicle</h3>
        <div className="flex gap-3 mb-4 flex-wrap">
          {VEHICLE_ICONS.map(icon => (
            <button key={icon} onClick={() => setForm(f => ({ ...f, icon }))}
              className={`w-12 h-12 text-2xl rounded-xl border-2 transition-all ${form.icon === icon ? "border-slate-900 bg-slate-100" : "border-slate-200 hover:border-slate-300"}`}>
              {icon}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Year</label>
              <input type="number" placeholder="2022" value={form.year} onChange={set("year")} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Make</label>
              <input placeholder="Honda" value={form.make} onChange={set("make")} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Model</label>
              <input placeholder="CR-V" value={form.model} onChange={set("model")} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Nickname</label>
              <input placeholder="Family Car" value={form.nick} onChange={set("nick")} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Current Miles</label>
              <input type="number" placeholder="45000" value={form.mileage} onChange={set("mileage")} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={save} disabled={!form.year || !form.make || !form.model} className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-700 disabled:opacity-40">Add Vehicle</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────
export default function App() {
  const [vehicles, setVehicles] = useStorage("garage_v2", DEMO_VEHICLES);
  const [view, setView] = useState("dashboard");
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [showAddVehicle, setShowAddVehicle] = useState(false);

  const updateVehicle = useCallback(updated => {
    setVehicles(prev => prev.map(v => v.id === updated.id ? updated : v));
  }, [setVehicles]);

  const addVehicle = useCallback(v => {
    setVehicles(prev => [...prev, v]);
    setShowAddVehicle(false);
    setSelectedVehicleId(v.id);
    setView("vehicle");
  }, [setVehicles]);

  const selectVehicle = useCallback(id => {
    setSelectedVehicleId(id);
    setView("vehicle");
  }, []);

  const alerts = getAllAlerts(vehicles);
  const alertCount = alerts.length;

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
    )},
    { id: "alerts",    label: "Alerts",    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
    ), badge: alertCount },
    { id: "import",    label: "Import",    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"/></svg>
    )},
  ];

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Top nav */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center h-16 gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-lg">🔧</div>
              <span className="font-black text-slate-900 text-lg tracking-tight hidden sm:block">Family Garage</span>
            </div>
            <nav className="flex items-center gap-1 ml-auto">
              {navItems.map(item => (
                <button key={item.id} onClick={() => setView(item.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-all
                    ${view === item.id ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"}`}>
                  {item.icon}
                  <span className="hidden sm:block">{item.label}</span>
                  {item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">{item.badge > 9 ? "9+" : item.badge}</span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {view === "dashboard" && <Dashboard vehicles={vehicles} onSelectVehicle={selectVehicle} onAddVehicle={() => setShowAddVehicle(true)} />}
        {view === "alerts"    && <AlertsView vehicles={vehicles} onSelectVehicle={selectVehicle} />}
        {view === "import"    && <ImportView vehicles={vehicles} onUpdateVehicle={updateVehicle} />}
        {view === "vehicle" && selectedVehicle && (
          <VehicleDetail vehicle={selectedVehicle} onBack={() => setView("dashboard")} onUpdateVehicle={updateVehicle} />
        )}
      </main>

      {showAddVehicle && <AddVehicleModal onSave={addVehicle} onClose={() => setShowAddVehicle(false)} />}
    </div>
  );
}
