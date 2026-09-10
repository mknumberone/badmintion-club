import React, { useState, useEffect, useMemo, useRef } from "react";

/* Lưu dữ liệu bằng localStorage của trình duyệt.
   Bản chạy trong Claude dùng window.storage; ngoài Claude thì không có API đó,
   nên đây là lớp thay thế cùng hình dạng (get/set/delete trả về Promise). */
const store = {
  async get(key) {
    const v = localStorage.getItem(key);
    if (v === null) throw new Error("Chưa có dữ liệu cho khoá " + key);
    return { key, value: v };
  },
  async set(key, value) {
    localStorage.setItem(key, value);
    return { key, value };
  },
  async delete(key) {
    localStorage.removeItem(key);
    return { key, deleted: true };
  },
};


/* ─────────────────────────  STYLE  ───────────────────────── */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&display=swap');

.clb, .clb * { box-sizing: border-box; }
.clb {
  --court:#12463A; --court-2:#0B2E26; --line:#F7F9F5;
  --paper:#EDF0EA; --card:#FFFFFF; --ink:#16241E; --muted:#5F6F67;
  --smash:#F0B429; --clay:#A93E2F; --edge:#D8DED4;
  font-family:'Archivo',system-ui,sans-serif; color:var(--ink);
  background:var(--paper); min-height:100vh; display:flex;
  font-size:15px; line-height:1.45; -webkit-font-smoothing:antialiased;
}
.clb button, .clb input, .clb select { font:inherit; color:inherit; }
.clb :focus-visible { outline:2px solid var(--smash); outline-offset:2px; }

/* rail */
.rail { width:210px; flex:0 0 210px; background:var(--court); color:var(--line);
  padding:20px 14px; display:flex; flex-direction:column; gap:22px; min-height:100vh; }
.brand { display:flex; gap:10px; align-items:flex-start; padding:0 6px; }
.brand h1 { margin:0; font-size:17px; font-weight:700; letter-spacing:-.02em; line-height:1.15; }
.brand p { margin:2px 0 0; font-size:12px; color:#9FC0B4; }
.nav { display:flex; flex-direction:column; gap:2px; }
.nav button { display:flex; align-items:center; gap:10px; width:100%; text-align:left;
  background:none; border:0; padding:9px 10px; border-radius:7px; cursor:pointer;
  color:#BBD6CB; font-size:14px; font-weight:500; }
.nav button:hover { background:rgba(255,255,255,.07); color:var(--line); }
.nav button.on { background:var(--line); color:var(--court); font-weight:600; }
.nav .badge { margin-left:auto; background:var(--smash); color:#3B2A00; font-size:11px;
  font-weight:700; padding:1px 6px; border-radius:20px; }
.rail-foot { margin-top:auto; border-top:1px solid rgba(255,255,255,.14); padding-top:14px; }
.rail-foot .bal { font-size:12px; color:#9FC0B4; }
.rail-foot .amt { font-size:20px; font-weight:700; font-variant-numeric:tabular-nums;
  letter-spacing:-.02em; color:var(--smash); }
.rail-foot button { margin-top:10px; background:none; border:0; padding:0; cursor:pointer;
  color:#7FA598; font-size:12px; text-decoration:underline; }

/* main */
.main { flex:1; min-width:0; padding:26px 34px 64px; }
.wrap { width:100%; max-width:1720px; margin:0 auto; }
.seslist, .courtgrid { display:grid; gap:12px; grid-template-columns:1fr; align-items:start; }
.page-head { display:flex; align-items:flex-end; gap:16px; flex-wrap:wrap;
  padding-bottom:14px; border-bottom:2px solid var(--court); margin-bottom:22px; }
.page-head h2 { margin:0; font-size:26px; font-weight:700; letter-spacing:-.03em; }
.page-head p { margin:3px 0 0; color:var(--muted); font-size:14px; }
.page-head .spread { margin-left:auto; display:flex; gap:8px; }

.card { background:var(--card); border:1px solid var(--edge); border-radius:10px; padding:18px; }
.card h3 { margin:0 0 12px; font-size:15px; font-weight:600; letter-spacing:-.01em; }
.row { display:flex; gap:14px; flex-wrap:wrap; }
.cols { display:grid; gap:14px; }
.c2 { grid-template-columns:repeat(2,minmax(0,1fr)); }
.c3 { grid-template-columns:repeat(3,minmax(0,1fr)); }
.c4 { grid-template-columns:repeat(4,minmax(0,1fr)); }

/* hero court */
.hero { position:relative; background:var(--court); border-radius:12px; overflow:hidden;
  color:var(--line); min-height:210px; display:flex; }
.hero svg { position:absolute; inset:0; width:100%; height:100%; }
.hero .inner { position:relative; padding:22px 24px; display:flex; flex-direction:column; gap:4px; width:100%; }
.hero .when { font-size:12px; color:#A9CABE; }
.hero .title { font-size:30px; font-weight:700; letter-spacing:-.035em; margin:2px 0 0; }
.hero .meta { font-size:14px; color:#CFE3DA; }
.hero .strip { margin-top:auto; display:flex; gap:26px; flex-wrap:wrap; padding-top:16px;
  border-top:1px solid rgba(247,249,245,.25); }
.hero .strip div span { display:block; font-size:11px; color:#A9CABE; }
.hero .strip div b { font-size:17px; font-weight:600; font-variant-numeric:tabular-nums; }

/* stat */
.stat { background:var(--card); border:1px solid var(--edge); border-radius:10px; padding:13px 15px; min-width:0; }
.stat span { display:block; font-size:12px; color:var(--muted); white-space:nowrap;
  overflow:hidden; text-overflow:ellipsis; }
.stat b { display:block; font-size:20px; font-weight:700; font-variant-numeric:tabular-nums;
  letter-spacing:-.03em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
/* ô số liệu lồng trong thẻ thì nhỏ hơn một bậc */
.card .stat { padding:10px 12px; border-radius:8px; background:var(--paper); border-color:transparent; }
.card .stat span { font-size:11px; }
.card .stat b { font-size:16px; letter-spacing:-.02em; }
.stat.pos b { color:var(--court); } .stat.neg b { color:var(--clay); }

/* table */
.tbl { width:100%; border-collapse:collapse; }
.tbl th { text-align:left; font-size:12px; font-weight:600; color:var(--muted);
  padding:0 10px 8px; border-bottom:1px solid var(--edge); white-space:nowrap; }
.tbl td { padding:11px 10px; border-bottom:1px solid var(--paper); vertical-align:middle; font-size:14px; }
.tbl tr:last-child td { border-bottom:0; }
.tbl .num { text-align:right; font-variant-numeric:tabular-nums; }
.tbl .nm { font-weight:600; }
.tbl .sub { display:block; font-size:12px; color:var(--muted); font-weight:400; }
.acts { display:flex; gap:6px; justify-content:flex-end; }

/* buttons */
.btn { border:1px solid var(--court); background:var(--card); color:var(--court);
  padding:8px 13px; border-radius:7px; font-size:14px; font-weight:600; cursor:pointer; }
.btn:hover { background:#E4EDE7; }
.btn.pri { background:var(--court); color:var(--line); }
.btn.pri:hover { background:var(--court-2); }
.btn.warm { background:var(--smash); border-color:#C9930F; color:#3B2A00; }
.btn.warm:hover { background:#E0A81B; }
.btn.sm { padding:5px 9px; font-size:13px; font-weight:500; }
.btn.mut { border-color:var(--edge); color:var(--muted); }
.btn.mut:hover { background:var(--paper); color:var(--ink); }
.btn.dgr { border-color:#E3C4BF; color:var(--clay); }
.btn.dgr:hover { background:#FBEFED; }
.btn:disabled { opacity:.45; cursor:not-allowed; }

/* pills */
.pill { display:inline-block; padding:2px 8px; border-radius:20px; font-size:12px; font-weight:600; }
.pill.next { background:#E4EDE7; color:var(--court); }
.pill.open { background:#FDF0D5; color:#8A5B00; }
.pill.done { background:#E9EDE7; color:var(--muted); }
.pill.thu { background:#E4EDE7; color:var(--court); }
.pill.chi { background:#FBEFED; color:var(--clay); }

/* forms */
.fld { display:flex; flex-direction:column; gap:5px; min-width:0; }
.fld label { font-size:12px; font-weight:600; color:var(--muted); }
.fld input, .fld select { border:1px solid var(--edge); background:var(--card);
  border-radius:7px; padding:9px 10px; font-size:14px; width:100%; }
.fld input:focus, .fld select:focus { border-color:var(--court); }
.hint { font-size:12px; color:var(--muted); }

/* modal */
.veil { position:fixed; inset:0; background:rgba(11,46,38,.55); display:flex;
  align-items:flex-start; justify-content:center; padding:34px 16px; overflow:auto; z-index:50; }
.modal { background:var(--card); border-radius:12px; width:100%; max-width:560px; padding:22px; }
.modal h3 { margin:0 0 4px; font-size:19px; font-weight:700; letter-spacing:-.02em; }
.modal .foot { display:flex; gap:8px; justify-content:flex-end; margin-top:20px;
  padding-top:16px; border-top:1px solid var(--paper); }

/* two-pane page */
.pane { display:grid; grid-template-columns:minmax(0,1.55fr) minmax(0,1fr); gap:14px; align-items:start; }
.thumb { flex:0 0 auto; width:104px; height:64px; border-radius:6px; background:var(--court); }
.wk { display:flex; align-items:center; gap:10px; padding:7px 0; border-bottom:1px solid var(--paper); }
.wk:last-child { border-bottom:0; }
.wk b { flex:0 0 66px; font-size:13px; font-weight:600; }
.wk .slot { font-size:13px; }
.wk .off { font-size:13px; color:#AEB8B0; }
.roleline { display:flex; align-items:center; gap:6px; margin:10px 0 6px; }
.roleline .pill { background:rgba(247,249,245,.16); color:var(--line); }
.roleline .pill.adm { background:var(--smash); color:#3B2A00; }
.viewnote { background:#FDF0D5; border:1px solid #F0D9A8; color:#6E4A00; border-radius:8px;
  padding:9px 13px; font-size:13px; margin-bottom:16px; }

/* member sheet */
.modal.wide { max-width:760px; }
.tabs { display:flex; gap:6px; border-bottom:1px solid var(--edge); padding-bottom:10px; }
.tabs button { border:0; background:none; padding:6px 11px; border-radius:20px; cursor:pointer;
  font-size:14px; font-weight:600; color:var(--muted); }
.tabs button:hover { background:var(--paper); color:var(--ink); }
.tabs button.on { background:var(--court); color:var(--line); }
.scroll { max-height:330px; overflow:auto; }
.namebtn { border:0; background:none; padding:0; font:inherit; font-weight:600; cursor:pointer;
  color:var(--court); text-align:left; }
.namebtn:hover { text-decoration:underline; }
.picks { display:flex; flex-wrap:wrap; gap:7px; max-height:180px; overflow:auto;
  border:1px solid var(--edge); border-radius:8px; padding:10px; }
.pick { border:1px solid var(--edge); background:var(--card); border-radius:20px;
  padding:5px 11px; font-size:13px; cursor:pointer; }
.pick.on { background:var(--court); border-color:var(--court); color:var(--line); font-weight:600; }

.empty { text-align:center; padding:34px 20px; color:var(--muted); }
.empty b { display:block; color:var(--ink); font-size:16px; margin-bottom:4px; }
.split { display:flex; justify-content:space-between; gap:12px; font-size:14px; padding:5px 0; }
.split.tot { border-top:1px solid var(--edge); margin-top:6px; padding-top:9px; font-weight:700; }
.split b { font-variant-numeric:tabular-nums; }

@media (max-width:860px) {
  .clb { flex-direction:column; }
  .rail { width:100%; flex:none; min-height:0; flex-direction:row; align-items:center;
    gap:14px; overflow-x:auto; padding:12px; }
  .nav { flex-direction:row; }
  .nav button span.lbl { display:none; }
  .brand p { display:none; }
  .rail-foot { margin:0 0 0 auto; border-top:0; padding-top:0; display:flex;
    align-items:center; gap:8px; flex:0 0 auto; }
  .rail-foot .bal, .rail-foot .amt { display:none; }
  .roleline { margin:0; }
  .main { padding:18px 16px 50px; }
  .c2,.c3,.c4,.pane { grid-template-columns:1fr; }
}
@media (min-width:600px) and (max-width:860px) {
  .c2,.c3,.c4,.pane { grid-template-columns:repeat(2,minmax(0,1fr)); }
}
@media (min-width:1200px) {
  .seslist { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .pane { grid-template-columns:minmax(0,2.1fr) minmax(0,1fr); }
}
@media (min-width:1420px) {
  .rail { width:236px; flex:0 0 236px; }
  .main { padding:30px 40px 70px; }
  .page-head h2 { font-size:29px; }
  .hero { min-height:250px; }
}
@media (min-width:1560px) {
  .courtgrid { grid-template-columns:repeat(2,minmax(0,1fr)); }
}
@media (min-width:1900px) {
  .seslist { grid-template-columns:repeat(3,minmax(0,1fr)); }
}
/* số liệu bên trong thẻ: 2x2 ở thẻ buổi đánh, 3 cột ở thẻ sân khi đủ rộng */
@media (min-width:560px) {
  .seslist .c4 { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .courtgrid .c3 { grid-template-columns:repeat(3,minmax(0,1fr)); }
}
`;

/* ─────────────────────────  HELPERS  ───────────────────────── */

const KEY = "clb-cau-long:v1";
const uid = () => Math.random().toString(36).slice(2, 9);
const nf = new Intl.NumberFormat("vi-VN");
const vnd = (n) => nf.format(Math.round(n || 0)) + "₫";
const iso = (d) => d.toISOString().slice(0, 10);
const today = () => iso(new Date());
const DOW = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];
const dowOf = (s) => DOW[new Date(s + "T00:00:00").getDay()];
const dmy = (s) => { const [y, m, d] = s.split("-"); return `${d}/${m}/${y}`; };
const hoursBetween = (a, b) => {
  if (!a || !b) return 0;
  const [h1, m1] = a.split(":").map(Number), [h2, m2] = b.split(":").map(Number);
  return Math.max(0, (h2 * 60 + m2 - h1 * 60 - m1) / 60);
};
const roundUp = (n, step = 1000) => Math.ceil(n / step) * step;

const THU_CATS = ["Nạp quỹ", "Tài trợ", "Khác"];
const CHI_CATS = ["Tiền sân", "Tiền cầu", "Nước uống", "Giải thưởng", "Khác"];

/* thu = tiền vào quỹ · chi = tiền ra khỏi quỹ · tru = trừ số dư của thành viên (tiền đã nằm trong quỹ) */
const cashOf = (txs) =>
  txs.reduce((s, t) => (t.type === "thu" ? s + t.amount : t.type === "chi" ? s - t.amount : s), 0);
const memBal = (txs, id) =>
  txs.filter((t) => t.memberId === id)
    .reduce((s, t) => (t.type === "thu" ? s + t.amount : t.type === "tru" ? s - t.amount : s), 0);

const EMPTY = { members: [], courts: [], sessions: [], txs: [], slots: [] };

function sessionCost(s, courts) {
  const court = courts.find((c) => c.id === s.courtId);
  const hrs = hoursBetween(s.start, s.end);
  const courtCost = s.courtCost != null ? s.courtCost : Math.round(hrs * (court?.price || 0));
  const shuttleCost = (s.shuttles || 0) * (s.shuttlePrice || 0);
  const extra = s.extra || 0;
  const total = courtCost + shuttleCost + extra;
  const n = (s.attendees || []).length;
  const perHead = n ? roundUp(total / n) : 0;
  return { court, hrs, courtCost, shuttleCost, extra, total, n, perHead, collected: perHead * n };
}

/* ─────────────────────────  ICONS  ───────────────────────── */

const Ic = ({ d, w = 17 }) => (
  <svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
);
const I = {
  home: <Ic d={<><path d="M4 10.5 12 4l8 6.5V20H4z" /><path d="M9.5 20v-6h5v6" /></>} />,
  cal: <Ic d={<><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M8 3v4M16 3v4M3.5 10h17" /></>} />,
  users: <Ic d={<><circle cx="9" cy="8" r="3.3" /><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" /><path d="M16.5 5.5a3 3 0 0 1 0 5.8M18 14.6c2 .7 3.4 2.5 3.4 5" /></>} />,
  wallet: <Ic d={<><rect x="3" y="6.5" width="18" height="12" rx="2.5" /><path d="M3 10.5h18" /><circle cx="16.5" cy="14.5" r="1.2" /></>} />,
  net: <Ic d={<><rect x="3.5" y="4.5" width="17" height="15" rx="1.5" /><path d="M3.5 12h17M12 4.5v15" /></>} />,
  shuttle: <Ic d={<><path d="M12 3c3.6 2.4 5.6 6.2 6 11H6c.4-4.8 2.4-8.6 6-11z" /><circle cx="12" cy="17.5" r="3" /></>} />,
};

/* ─────────────────────────  BITS  ───────────────────────── */

function Modal({ title, sub, children, onClose, onSave, saveLabel = "Lưu", saveOff, wide }) {
  useEffect(() => {
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div className="veil" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={"modal" + (wide ? " wide" : "")}>
        <h3>{title}</h3>
        {sub && <p className="hint" style={{ margin: "0 0 16px" }}>{sub}</p>}
        <div className="cols" style={{ gap: 14 }}>{children}</div>
        <div className="foot">
          <button className="btn mut" onClick={onClose}>Đóng</button>
          {onSave && <button className="btn pri" onClick={onSave} disabled={saveOff}>{saveLabel}</button>}
        </div>
      </div>
    </div>
  );
}

const Field = ({ label, children }) => (
  <div className="fld"><label>{label}</label>{children}</div>
);

const Stat = ({ label, value, tone }) => (
  <div className={"stat " + (tone || "")}><span>{label}</span><b>{value}</b></div>
);

const Adm = React.createContext(true);
const useAdmin = () => React.useContext(Adm);

function CourtThumb() {
  const L = { stroke: "#F7F9F5", strokeOpacity: 0.45, strokeWidth: 1, fill: "none" };
  return (
    <svg className="thumb" viewBox="0 0 104 64" aria-hidden="true">
      <rect x="7" y="6" width="90" height="52" {...L} strokeWidth="1.4" />
      <rect x="7" y="12" width="90" height="40" {...L} />
      <path d="M52 6v52M7 32h90M25 12v40M79 12v40" {...L} />
    </svg>
  );
}

function CourtLines() {
  const L = { stroke: "#F7F9F5", strokeOpacity: 0.3, strokeWidth: 1.4, fill: "none" };
  return (
    <svg viewBox="0 0 400 210" preserveAspectRatio="none">
      <rect x="14" y="14" width="372" height="182" {...L} strokeWidth="2" />
      <rect x="14" y="30" width="372" height="150" {...L} />
      <path d="M200 14V196M14 105h372M84 30v150M316 30v150M120 14v182M280 14v182" {...L} />
      <circle cx="200" cy="105" r="3" fill="#F7F9F5" fillOpacity=".35" />
    </svg>
  );
}

/* ─────────────────────────  APP  ───────────────────────── */

export default function App() {
  const [tab, setTab] = useState("home");
  const [data, setData] = useState(EMPTY);
  const [ready, setReady] = useState(false);
  const [saveErr, setSaveErr] = useState(false);
  const [admin, setAdmin] = useState(true);
  const [gate, setGate] = useState(null);
  const first = useRef(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await store.get(KEY);
        if (r?.value) {
          const d = { ...EMPTY, ...JSON.parse(r.value) };
          // dữ liệu cũ: tiền buổi đánh từng ghi là "thu" → giờ là khoản trừ số dư
          d.txs = d.txs.map((t) =>
            t.type === "thu" && t.sesId && t.memberId ? { ...t, type: "tru" } : t);
          setData(d);
          if (d.pin) setAdmin(false);
        }
      } catch (e) { /* chưa có dữ liệu */ }
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (first.current) { first.current = false; return; }
    const t = setTimeout(async () => {
      try {
        const ok = await store.set(KEY, JSON.stringify(data));
        setSaveErr(!ok);
      } catch (e) { setSaveErr(true); }
    }, 350);
    return () => clearTimeout(t);
  }, [data, ready]);

  const up = (fn) => setData((d) => ({ ...d, ...fn(d) }));
  const { members, courts, sessions, txs, slots } = data;

  const balance = useMemo(() => cashOf(txs), [txs]);
  const held = useMemo(
    () => members.reduce((s, m) => s + memBal(txs, m.id), 0), [members, txs]);
  const sorted = useMemo(
    () => [...sessions].sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start)), [sessions]);
  const upcoming = useMemo(() => sorted.filter((s) => s.date >= today()), [sorted]);
  const unsettled = useMemo(
    () => sorted.filter((s) => !s.settled && s.date < today()).length, [sorted]);

  const seed = () => {
    const m = ["Nam", "Hưng", "Linh", "Quân", "Thảo", "Đạt", "Mai", "Tuấn"].map((n, i) => ({
      id: uid(), name: n, phone: "", level: ["Trung bình", "Khá", "Tốt"][i % 3],
      joined: today(), active: true,
    }));
    const c = [
      { id: uid(), name: "Sân Cầu Giấy – sân 3", place: "12 Trần Duy Hưng", price: 90000, note: "" },
      { id: uid(), name: "Nhà thi đấu Mỹ Đình – sân 1", place: "Lê Đức Thọ", price: 120000, note: "" },
    ];
    up(() => ({
      members: m, courts: c,
      slots: [{ id: uid(), dow: 3, start: "19:00", end: "21:00", courtId: c[0].id },
              { id: uid(), dow: 0, start: "08:00", end: "10:00", courtId: c[1].id }],
      txs: m.map((x) => ({ id: uid(), date: today(), type: "thu", amount: 300000,
              cat: "Nạp quỹ", note: x.name, memberId: x.id })),
    }));
  };

  const wipe = () => {
    if (!window.confirm("Xoá toàn bộ dữ liệu CLB? Không thể hoàn lại.")) return;
    setData(EMPTY);
    store.delete(KEY).catch(() => {});
  };

  const NAV = [
    ["home", "Tổng quan", I.home], ["ses", "Buổi đánh", I.cal],
    ["mem", "Thành viên", I.users], ["fund", "Quỹ", I.wallet], ["court", "Sân", I.net],
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="clb">
        <nav className="rail">
          <div className="brand">
            <span style={{ color: "var(--smash)", marginTop: 2 }}>{I.shuttle}</span>
            <div><h1>CLB Cầu lông</h1><p>Sổ tay quản lý</p></div>
          </div>
          <div className="nav">
            {NAV.map(([k, label, icon]) => (
              <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}
                title={label} aria-current={tab === k}>
                {icon}<span className="lbl">{label}</span>
                {k === "ses" && unsettled > 0 && <span className="badge">{unsettled}</span>}
              </button>
            ))}
          </div>
          <div className="rail-foot">
            <div className="bal">Tiền mặt trong quỹ</div>
            <div className="amt">{vnd(balance)}</div>
            <div className="bal" style={{ marginTop: 4 }}>Số dư thành viên {vnd(held)}</div>
            <div className="roleline">
              <span className={"pill " + (admin ? "adm" : "")}>{admin ? "Quản lý" : "Chỉ xem"}</span>
            </div>
            {admin ? (
              <>
                <button onClick={() => data.pin ? setAdmin(false) : setGate({ mode: "set", val: "", err: "" })}>
                  {data.pin ? "Khoá lại, chỉ xem" : "Đặt mã quản lý"}
                </button>
                {data.pin && <button style={{ marginLeft: 10 }} onClick={() => setGate({ mode: "set", val: "", err: "" })}>Đổi mã</button>}
                <div><button onClick={wipe}>Xoá dữ liệu</button></div>
              </>
            ) : (
              <button onClick={() => setGate({ mode: "open", val: "", err: "" })}>Mở quyền quản lý</button>
            )}
          </div>
        </nav>

        <main className="main">
         <div className="wrap">
          {!ready ? (
            <p className="hint">Đang mở sổ…</p>
          ) : (
            <>
              {saveErr && (
                <p className="hint" style={{ color: "var(--clay)", marginTop: 0 }}>
                  Không lưu được thay đổi vừa rồi. Thử lại sau một lát.
                </p>
              )}
              {!admin && (
                <div className="viewnote">
                  Chế độ chỉ xem: bạn xem được lịch, quỹ và số dư nhưng không sửa được gì.
                  Bấm “Mở quyền quản lý” ở góc dưới nếu bạn giữ mã.
                </div>
              )}
              <Adm.Provider value={admin}>
                {tab === "home" && <Home {...{ data, balance, held, upcoming, unsettled, seed, setTab }} />}
                {tab === "ses" && <Sessions {...{ data, up, sorted }} />}
                {tab === "mem" && <Members {...{ data, up }} />}
                {tab === "fund" && <Fund {...{ data, up, balance }} />}
                {tab === "court" && <Courts {...{ data, up }} />}
              </Adm.Provider>
            </>
          )}
         </div>
        </main>

        {gate && (
          <Modal
            title={gate.mode === "open" ? "Mở quyền quản lý" : "Mã quản lý"}
            sub={gate.mode === "open"
              ? "Nhập mã của thủ quỹ để sửa được dữ liệu."
              : "Đặt mã để lần sau app mở ở chế độ chỉ xem. Để trống rồi lưu là bỏ mã."}
            onClose={() => setGate(null)}
            saveLabel={gate.mode === "open" ? "Mở" : "Lưu mã"}
            onSave={() => {
              if (gate.mode === "open") {
                if (gate.val === data.pin) { setAdmin(true); setGate(null); }
                else setGate({ ...gate, err: "Mã không đúng." });
              } else {
                up(() => ({ pin: gate.val.trim() || null }));
                setGate(null);
              }
            }}>
            <Field label={gate.mode === "open" ? "Mã quản lý" : "Mã mới"}>
              <input type="password" value={gate.val} autoFocus
                onChange={(e) => setGate({ ...gate, val: e.target.value, err: "" })} />
            </Field>
            {gate.err && <p className="hint" style={{ color: "var(--clay)", margin: 0 }}>{gate.err}</p>}
            <p className="hint" style={{ margin: 0 }}>
              Đây là khoá nhẹ để tránh sửa nhầm khi chuyền máy cho nhau, không phải bảo mật thật:
              dữ liệu vẫn nằm trên máy này.
            </p>
          </Modal>
        )}
      </div>
    </>
  );
}

/* ─────────────────────────  TỔNG QUAN  ───────────────────────── */

function Home({ data, balance, held, upcoming, unsettled, seed, setTab }) {
  const admin = useAdmin();
  const { members, courts, sessions, txs } = data;
  const lowList = members.filter((m) => m.active && memBal(txs, m.id) < 100000);
  const bare = !members.length && !courts.length && !sessions.length;
  const next = upcoming[0];
  const nx = next ? sessionCost(next, courts) : null;
  const mo = today().slice(0, 7);
  const moThu = txs.filter((t) => t.type === "thu" && t.date.startsWith(mo)).reduce((s, t) => s + t.amount, 0);
  const moChi = txs.filter((t) => t.type === "chi" && t.date.startsWith(mo)).reduce((s, t) => s + t.amount, 0);
  const played = sessions.filter((s) => s.settled).length;

  if (bare)
    return (
      <>
        <div className="page-head"><div><h2>Tổng quan</h2><p>Chưa có gì trong sổ.</p></div></div>
        <div className="card empty">
          <b>Bắt đầu bằng việc thêm sân và thành viên</b>
          Sau đó mỗi buổi đánh chỉ cần tích tên người có mặt, tiền sân và tiền cầu tự chia đầu người.
          {admin && (
            <div className="row" style={{ justifyContent: "center", marginTop: 16 }}>
              <button className="btn pri" onClick={() => setTab("court")}>Thêm sân</button>
              <button className="btn" onClick={() => setTab("mem")}>Thêm thành viên</button>
              <button className="btn mut" onClick={seed}>Nạp dữ liệu mẫu</button>
            </div>
          )}
        </div>
      </>
    );

  return (
    <>
      <div className="page-head">
        <div><h2>Tổng quan</h2><p>{dowOf(today())}, {dmy(today())}</p></div>
      </div>

      <div className="hero">
        <CourtLines />
        <div className="inner">
          {next ? (
            <>
              <div className="when">Buổi kế tiếp · {dowOf(next.date)} {dmy(next.date)}</div>
              <div className="title">{next.start}–{next.end}</div>
              <div className="meta">{nx.court?.name || "Chưa chọn sân"}{nx.court?.place ? ` · ${nx.court.place}` : ""}</div>
              <div className="strip">
                <div><span>Đã tích tên</span><b>{nx.n} người</b></div>
                <div><span>Tiền sân</span><b>{vnd(nx.courtCost)}</b></div>
                <div><span>Dự kiến mỗi người</span><b>{nx.n ? vnd(nx.perHead) : "—"}</b></div>
              </div>
            </>
          ) : (
            <>
              <div className="when">Lịch trống</div>
              <div className="title">Chưa có buổi nào sắp tới</div>
              <div className="meta">Tạo buổi đánh mới hoặc sinh buổi từ lịch cố định.</div>
              <div className="strip">
                <button className="btn warm" onClick={() => setTab("ses")}>{admin ? "Mở lịch đánh" : "Xem lịch"}</button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="cols c4" style={{ marginTop: 14 }}>
        <Stat label="Tiền mặt trong quỹ" value={vnd(balance)} tone={balance >= 0 ? "pos" : "neg"} />
        <Stat label="Số dư của thành viên" value={vnd(held)} />
        <Stat label="Quỹ chung của CLB" value={vnd(balance - held)} />
        <Stat label="Chi tháng này" value={vnd(moChi)} tone="neg" />
      </div>

      <div className="cols c3" style={{ marginTop: 14 }}>
        <div className="card">
          <h3>Buổi sắp tới</h3>
          {upcoming.length ? (
            <table className="tbl">
              <tbody>
                {upcoming.slice(0, 5).map((s) => {
                  const c = sessionCost(s, courts);
                  return (
                    <tr key={s.id}>
                      <td className="nm">{dowOf(s.date)} {dmy(s.date).slice(0, 5)}
                        <span className="sub">{s.start}–{s.end} · {c.court?.name || "chưa có sân"}</span></td>
                      <td className="num">{c.n} người</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : <p className="hint">Trống. Tạo buổi ở tab Buổi đánh.</p>}
          {unsettled > 0 && (
            <p className="hint" style={{ marginBottom: 0 }}>
              Có {unsettled} buổi đã đánh nhưng chưa chốt tiền.
            </p>
          )}
        </div>

        <div className="card">
          <h3>Cần nạp thêm quỹ</h3>
          {lowList.length ? (
            <>
              <table className="tbl">
                <tbody>
                  {lowList.map((m) => {
                    const b = memBal(txs, m.id);
                    return (
                      <tr key={m.id}>
                        <td className="nm">{m.name}</td>
                        <td className="num" style={{ fontWeight: 600, color: b < 0 ? "var(--clay)" : "#8A5B00" }}>
                          {vnd(b)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <button className="btn sm" style={{ marginTop: 12 }} onClick={() => setTab("mem")}>Mở sổ thành viên</button>
            </>
          ) : <p className="hint">Mọi người đều còn dư trên 100.000₫.</p>}
        </div>
        <div className="card">
          <h3>Sổ quỹ gần đây</h3>
          {txs.length ? (
            <table className="tbl">
              <tbody>
                {[...txs].reverse().slice(0, 6).map((t) => (
                  <tr key={t.id}>
                    <td>{t.cat}<span className="sub">{dmy(t.date)}{t.note ? " · " + t.note : ""}</span></td>
                    <td className="num" style={{ fontWeight: 600,
                      color: t.type === "thu" ? "var(--court)" : t.type === "chi" ? "var(--clay)" : "#8A5B00" }}>
                      {t.type === "thu" ? "+" : "−"}{vnd(t.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className="hint">Chưa có giao dịch nào.</p>}
        </div>
      </div>

      <p className="hint" style={{ marginTop: 14 }}>Đã chốt {played} buổi · {courts.length} sân đang dùng</p>
    </>
  );
}

/* ─────────────────────────  BUỔI ĐÁNH  ───────────────────────── */

function Sessions({ data, up, sorted }) {
  const admin = useAdmin();
  const { members, courts, sessions, slots } = data;
  const [edit, setEdit] = useState(null);
  const [settle, setSettle] = useState(null);
  const [slotForm, setSlotForm] = useState(null);
  const [view, setView] = useState("next");

  const active = members.filter((m) => m.active);
  const list = sorted.filter((s) =>
    view === "next" ? s.date >= today() : view === "open" ? !s.settled && s.date < today() : true);

  const blank = () => ({
    id: uid(), date: today(), start: "19:00", end: "21:00",
    courtId: courts[0]?.id || "", attendees: [], shuttles: 4, shuttlePrice: 25000,
    extra: 0, note: "", settled: false,
  });

  const save = (s) => {
    up((d) => ({ sessions: d.sessions.some((x) => x.id === s.id)
      ? d.sessions.map((x) => (x.id === s.id ? s : x)) : [...d.sessions, s] }));
    setEdit(null);
  };
  const del = (id) => {
    if (!window.confirm("Xoá buổi đánh này?")) return;
    up((d) => ({ sessions: d.sessions.filter((s) => s.id !== id),
      txs: d.txs.filter((t) => t.sesId !== id) }));
  };
  const unsettle = (s) => {
    if (!window.confirm("Bỏ chốt buổi này? Các khoản đã ghi vào quỹ và số dư sẽ được hoàn lại.")) return;
    up((d) => ({ txs: d.txs.filter((t) => t.sesId !== s.id),
      sessions: d.sessions.map((x) => (x.id === s.id ? { ...x, settled: false } : x)) }));
  };
  const toggle = (s, mid) => save({ ...s,
    attendees: s.attendees.includes(mid) ? s.attendees.filter((x) => x !== mid) : [...s.attendees, mid] });

  const genFromSlots = () => {
    if (!slots.length) return;
    const add = [];
    for (let w = 0; w < 4; w++)
      for (const sl of slots) {
        const base = new Date(); base.setHours(12, 0, 0, 0);
        const diff = (sl.dow - base.getDay() + 7) % 7 + w * 7;
        const d = new Date(base); d.setDate(base.getDate() + diff);
        const date = iso(d);
        const dup = sessions.some((s) => s.date === date && s.start === sl.start) ||
          add.some((s) => s.date === date && s.start === sl.start);
        if (!dup) add.push({ ...blank(), id: uid(), date, start: sl.start, end: sl.end, courtId: sl.courtId });
      }
    if (add.length) up((d) => ({ sessions: [...d.sessions, ...add] }));
    else window.alert("4 tuần tới đã có đủ buổi theo lịch cố định.");
  };

  return (
    <>
      <div className="page-head">
        <div><h2>Buổi đánh</h2><p>Tích tên người có mặt, tiền sân và tiền cầu tự chia đầu người.</p></div>
        {admin && (
          <div className="spread">
            <button className="btn mut" onClick={genFromSlots} disabled={!slots.length}>Sinh buổi từ lịch</button>
            <button className="btn pri" onClick={() => setEdit(blank())} disabled={!courts.length}>Buổi mới</button>
          </div>
        )}
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <h3>Lịch cố định hằng tuần</h3>
        {slots.length ? (
          <div className="row">
            {slots.map((sl) => (
              <div key={sl.id} style={{ border: "1px solid var(--edge)", borderRadius: 8, padding: "9px 12px" }}>
                <b style={{ fontSize: 14 }}>{DOW[sl.dow]}</b>
                <div className="hint">{sl.start}–{sl.end} · {courts.find((c) => c.id === sl.courtId)?.name || "chưa có sân"}</div>
                {admin && (
                  <div className="acts" style={{ marginTop: 6, justifyContent: "flex-start" }}>
                    <button className="btn sm mut" onClick={() => setSlotForm(sl)}>Sửa</button>
                    <button className="btn sm dgr" onClick={() => up((d) => ({ slots: d.slots.filter((x) => x.id !== sl.id) }))}>Xoá</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : <p className="hint">Chưa đặt ngày đánh cố định. Ví dụ: thứ tư 19:00–21:00 và chủ nhật 08:00–10:00.</p>}
        {admin && (
          <button className="btn sm" style={{ marginTop: 12 }} disabled={!courts.length}
            onClick={() => setSlotForm({ id: uid(), dow: 3, start: "19:00", end: "21:00", courtId: courts[0]?.id || "" })}>
            Thêm ngày cố định
          </button>
        )}
      </div>

      <div className="row" style={{ marginBottom: 12 }}>
        {[["next", "Sắp tới"], ["open", "Chưa chốt"], ["all", "Tất cả"]].map(([k, l]) => (
          <button key={k} className={"btn sm " + (view === k ? "pri" : "mut")} onClick={() => setView(k)}>{l}</button>
        ))}
      </div>

      {!courts.length && <div className="card empty"><b>Cần có sân trước</b>Thêm sân ở tab Sân rồi quay lại tạo buổi đánh.</div>}

      <div className="seslist">
        {list.map((s) => {
          const c = sessionCost(s, courts);
          const state = s.settled ? ["done", "Đã chốt"] : s.date < today() ? ["open", "Chưa chốt"] : ["next", "Sắp tới"];
          return (
            <div className="card" key={s.id}>
              <div className="row" style={{ alignItems: "baseline" }}>
                <div>
                  <b style={{ fontSize: 17, letterSpacing: "-.02em", marginRight: 8 }}>{dowOf(s.date)}, {dmy(s.date)}</b>
                  <span className={"pill " + state[0]}>{state[1]}</span>
                  <div className="hint">{s.start}–{s.end} ({c.hrs} giờ) · {c.court?.name || "chưa có sân"}</div>
                </div>
                {admin && (
                  <div className="acts" style={{ marginLeft: "auto" }}>
                    {s.settled
                      ? <button className="btn sm mut" onClick={() => unsettle(s)}>Bỏ chốt</button>
                      : <button className="btn sm warm" onClick={() => setSettle(s)} disabled={!c.n}>Chốt tiền</button>}
                    <button className="btn sm mut" onClick={() => setEdit(s)}>Sửa</button>
                    <button className="btn sm dgr" onClick={() => del(s.id)}>Xoá</button>
                  </div>
                )}
              </div>

              <div className="cols c4" style={{ marginTop: 12 }}>
                <Stat label="Có mặt" value={c.n + " người"} />
                <Stat label="Tiền sân" value={vnd(c.courtCost)} />
                <Stat label={`Cầu (${s.shuttles || 0} quả)`} value={vnd(c.shuttleCost)} />
                <Stat label="Mỗi người" value={c.n ? vnd(c.perHead) : "—"} tone="pos" />
              </div>

              {!s.settled && admin && (
                <>
                  <p className="hint" style={{ margin: "14px 0 6px" }}>Bấm tên để tích có mặt · số trong ngoặc là số dư hiện có</p>
                  <div className="picks">
                    {active.length ? active.map((m) => {
                      const b = memBal(data.txs, m.id);
                      return (
                        <button key={m.id} className={"pick " + (s.attendees.includes(m.id) ? "on" : "")}
                          onClick={() => toggle(s, m.id)}
                          style={b < c.perHead && !s.attendees.includes(m.id) ? { borderColor: "#E3C4BF" } : undefined}>
                          {m.name} <span style={{ opacity: .7, fontVariantNumeric: "tabular-nums" }}>({nf.format(b)})</span>
                        </button>
                      );
                    }) : <span className="hint">Chưa có thành viên nào.</span>}
                  </div>
                </>
              )}
              {(s.settled || !admin) && !!c.n && (
                <p className="hint" style={{ marginBottom: 0 }}>
                  {s.attendees.map((id) => members.find((m) => m.id === id)?.name || "?").join(", ")}
                </p>
              )}
              {s.note && <p className="hint" style={{ marginBottom: 0 }}>Ghi chú: {s.note}</p>}
            </div>
          );
        })}
        {courts.length > 0 && !list.length && (
          <div className="card empty"><b>Không có buổi nào ở mục này</b>Tạo buổi mới hoặc sinh buổi từ lịch cố định.</div>
        )}
      </div>

      {edit && <SessionForm s={edit} courts={courts} members={active} onClose={() => setEdit(null)} onSave={save} />}
      {settle && <SettleForm s={settle} data={data} up={up} onClose={() => setSettle(null)} />}
      {slotForm && (
        <Modal title="Ngày đánh cố định" onClose={() => setSlotForm(null)}
          onSave={() => { up((d) => ({ slots: d.slots.some((x) => x.id === slotForm.id)
            ? d.slots.map((x) => (x.id === slotForm.id ? slotForm : x)) : [...d.slots, slotForm] }));
            setSlotForm(null); }}>
          <div className="cols c2">
            <Field label="Thứ">
              <select value={slotForm.dow} onChange={(e) => setSlotForm({ ...slotForm, dow: +e.target.value })}>
                {DOW.map((d, i) => <option key={i} value={i}>{d}</option>)}
              </select>
            </Field>
            <Field label="Sân">
              <select value={slotForm.courtId} onChange={(e) => setSlotForm({ ...slotForm, courtId: e.target.value })}>
                {courts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Giờ bắt đầu">
              <input type="time" value={slotForm.start} onChange={(e) => setSlotForm({ ...slotForm, start: e.target.value })} />
            </Field>
            <Field label="Giờ kết thúc">
              <input type="time" value={slotForm.end} onChange={(e) => setSlotForm({ ...slotForm, end: e.target.value })} />
            </Field>
          </div>
          <p className="hint">Bấm “Sinh buổi từ lịch” để tạo sẵn buổi cho 4 tuần tới.</p>
        </Modal>
      )}
    </>
  );
}

function SessionForm({ s: init, courts, members, onClose, onSave }) {
  const [s, setS] = useState(init);
  const c = sessionCost(s, courts);
  const set = (k) => (e) => setS({ ...s, [k]: e.target.value });
  const setNum = (k) => (e) => setS({ ...s, [k]: +e.target.value || 0 });
  return (
    <Modal title={init.settled ? "Sửa buổi đã chốt" : "Buổi đánh"}
      sub="Tiền sân tính theo giờ thuê; có thể ghi đè nếu chủ sân tính khác."
      onClose={onClose} onSave={() => onSave(s)}>
      <div className="cols c2">
        <Field label="Ngày đánh"><input type="date" value={s.date} onChange={set("date")} /></Field>
        <Field label="Sân">
          <select value={s.courtId} onChange={set("courtId")}>
            {courts.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
        </Field>
        <Field label="Giờ bắt đầu"><input type="time" value={s.start} onChange={set("start")} /></Field>
        <Field label="Giờ kết thúc"><input type="time" value={s.end} onChange={set("end")} /></Field>
        <Field label="Số quả cầu"><input type="number" min="0" value={s.shuttles} onChange={setNum("shuttles")} /></Field>
        <Field label="Giá một quả (₫)"><input type="number" min="0" step="1000" value={s.shuttlePrice} onChange={setNum("shuttlePrice")} /></Field>
        <Field label="Tiền sân ghi đè (₫)">
          <input type="number" min="0" step="1000" placeholder={String(Math.round(c.hrs * (c.court?.price || 0)))}
            value={s.courtCost ?? ""} onChange={(e) => setS({ ...s, courtCost: e.target.value === "" ? null : +e.target.value })} />
        </Field>
        <Field label="Chi khác: nước, thuê máy… (₫)">
          <input type="number" min="0" step="1000" value={s.extra || 0} onChange={setNum("extra")} />
        </Field>
      </div>
      <Field label="Ghi chú"><input value={s.note || ""} onChange={set("note")} placeholder="Giao lưu với CLB bạn…" /></Field>
      <div>
        <label className="fld" style={{ marginBottom: 6 }}><span style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>Người có mặt ({s.attendees.length})</span></label>
        <div className="picks">
          {members.length ? members.map((m) => (
            <button key={m.id} className={"pick " + (s.attendees.includes(m.id) ? "on" : "")}
              onClick={() => setS({ ...s, attendees: s.attendees.includes(m.id)
                ? s.attendees.filter((x) => x !== m.id) : [...s.attendees, m.id] })}>{m.name}</button>
          )) : <span className="hint">Chưa có thành viên đang chơi.</span>}
        </div>
      </div>
      <div>
        <div className="split"><span>Tiền sân {c.hrs} giờ</span><b>{vnd(c.courtCost)}</b></div>
        <div className="split"><span>Tiền cầu {s.shuttles} quả</span><b>{vnd(c.shuttleCost)}</b></div>
        {!!c.extra && <div className="split"><span>Chi khác</span><b>{vnd(c.extra)}</b></div>}
        <div className="split tot"><span>Mỗi người ({c.n} người, làm tròn lên 1.000₫)</span><b>{c.n ? vnd(c.perHead) : "—"}</b></div>
      </div>
    </Modal>
  );
}

function SettleForm({ s, data, up, onClose }) {
  const { courts, members, txs } = data;
  const c = sessionCost(s, courts);
  const [mode, setMode] = useState("balance");
  const surplus = c.collected - c.total;

  const rows = s.attendees.map((id) => {
    const m = members.find((x) => x.id === id);
    const before = memBal(txs, id);
    return { id, name: m?.name || "?", before, after: before - c.perHead };
  });
  const short = rows.filter((r) => r.after < 0);

  const done = () => {
    const add = [{ id: uid(), date: s.date, type: "chi", amount: c.total, cat: "Tiền sân",
      note: `Buổi ${dmy(s.date)} ${s.start}–${s.end}`, sesId: s.id }];
    if (mode === "balance")
      rows.forEach((r) => add.push({ id: uid(), date: s.date, type: "tru", amount: c.perHead,
        cat: "Tiền buổi đánh", note: `Buổi ${dmy(s.date)}`, memberId: r.id, sesId: s.id }));
    if (mode === "collect")
      rows.forEach((r) => add.push({ id: uid(), date: s.date, type: "thu", amount: c.perHead,
        cat: "Nạp quỹ", note: `Trả tiền buổi ${dmy(s.date)}`, memberId: r.id, sesId: s.id },
        { id: uid(), date: s.date, type: "tru", amount: c.perHead,
        cat: "Tiền buổi đánh", note: `Buổi ${dmy(s.date)}`, memberId: r.id, sesId: s.id }));
    up((d) => ({ txs: [...d.txs, ...add],
      sessions: d.sessions.map((x) => (x.id === s.id ? { ...x, settled: true } : x)) }));
    onClose();
  };

  return (
    <Modal title="Chốt tiền buổi đánh" sub={`${dowOf(s.date)}, ${dmy(s.date)} · ${c.n} người có mặt`}
      onClose={onClose} onSave={done} saveLabel="Chốt buổi">
      <div>
        <div className="split"><span>Tiền sân {c.hrs} giờ</span><b>{vnd(c.courtCost)}</b></div>
        <div className="split"><span>Tiền cầu {s.shuttles || 0} quả</span><b>{vnd(c.shuttleCost)}</b></div>
        {!!c.extra && <div className="split"><span>Chi khác</span><b>{vnd(c.extra)}</b></div>}
        <div className="split tot"><span>Tổng chi · mỗi người {vnd(c.perHead)}</span><b>{vnd(c.total)}</b></div>
      </div>

      <Field label="Cách tính">
        <select value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="balance">Trừ vào số dư của từng người</option>
          <option value="collect">Thu tiền mặt tại sân rồi trừ ngay</option>
          <option value="fund">Quỹ chung chịu, không trừ ai</option>
        </select>
      </Field>

      {mode === "fund" ? (
        <p className="hint">Quỹ chung của CLB chịu toàn bộ {vnd(c.total)}, số dư mọi người giữ nguyên.</p>
      ) : (
        <>
          <table className="tbl">
            <thead><tr><th>Người có mặt</th><th className="num">Số dư trước</th><th className="num">Còn lại</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="nm">{r.name}</td>
                  <td className="num">{vnd(r.before)}</td>
                  <td className="num" style={{ fontWeight: 600, color: r.after < 0 ? "var(--clay)" : "var(--court)" }}>
                    {vnd(r.after)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {mode === "collect" && (
            <p className="hint">Mỗi người trả {vnd(c.perHead)} tại sân: tiền vào quỹ rồi trừ ra ngay, số dư không đổi.</p>
          )}
          {!!short.length && mode === "balance" && (
            <p className="hint" style={{ color: "var(--clay)" }}>
              {short.map((r) => r.name).join(", ")} sẽ bị âm số dư. Vẫn chốt được, nhắc họ nạp thêm sau.
            </p>
          )}
          {surplus !== 0 && (
            <p className="hint">Chênh {vnd(surplus)} do làm tròn lên 1.000₫ sẽ vào quỹ chung.</p>
          )}
        </>
      )}
    </Modal>
  );
}

function MemberSheet({ m, data, onClose, onPay }) {
  const admin = useAdmin();
  const { txs, sessions, courts } = data;
  const [tab, setTab] = useState("tx");

  const mine = useMemo(() => {
    const rows = txs.map((t, i) => ({ ...t, i })).filter((t) => t.memberId === m.id)
      .sort((a, b) => a.date.localeCompare(b.date) || a.i - b.i);
    let run = 0;
    return rows.map((t) => {
      run += t.type === "thu" ? t.amount : t.type === "tru" ? -t.amount : 0;
      return { ...t, after: run };
    }).reverse();
  }, [txs, m.id]);

  const mySes = useMemo(() => sessions
    .filter((s) => s.attendees.includes(m.id))
    .sort((a, b) => (b.date + b.start).localeCompare(a.date + a.start))
    .map((s) => ({ s, c: sessionCost(s, courts) })), [sessions, courts, m.id]);

  const paid = txs.filter((t) => t.memberId === m.id && t.type === "thu").reduce((a, t) => a + t.amount, 0);
  const used = txs.filter((t) => t.memberId === m.id && t.type === "tru").reduce((a, t) => a + t.amount, 0);
  const bal = paid - used;
  const done = mySes.filter((x) => x.s.settled).length;
  const avg = done ? used / done : 0;

  return (
    <Modal wide title={m.name}
      sub={`${m.level} · vào CLB ${dmy(m.joined)}${m.phone ? " · " + m.phone : ""}${m.active ? "" : " · đã nghỉ"}`}
      onClose={onClose} onSave={admin ? () => onPay(m) : undefined} saveLabel="Nạp quỹ">
      <div className="cols c4">
        <Stat label="Số dư còn" value={vnd(bal)} tone={bal < 0 ? "neg" : "pos"} />
        <Stat label="Đã nạp" value={vnd(paid)} />
        <Stat label="Đã dùng" value={vnd(used)} />
        <Stat label="Buổi đã chốt" value={String(done)} />
      </div>
      {done > 0 && <p className="hint" style={{ margin: 0 }}>Trung bình {vnd(avg)} một buổi.</p>}

      <div className="tabs">
        <button className={tab === "tx" ? "on" : ""} onClick={() => setTab("tx")}>Giao dịch ({mine.length})</button>
        <button className={tab === "ses" ? "on" : ""} onClick={() => setTab("ses")}>Buổi đánh ({mySes.length})</button>
      </div>

      {tab === "tx" ? (
        mine.length ? (
          <div className="scroll">
            <table className="tbl">
              <thead><tr><th>Ngày</th><th>Nội dung</th><th className="num">Số tiền</th><th className="num">Số dư sau</th></tr></thead>
              <tbody>
                {mine.map((t) => (
                  <tr key={t.id}>
                    <td>{dmy(t.date)}</td>
                    <td className="nm">{t.cat}{t.note ? <span className="sub">{t.note}</span> : null}</td>
                    <td className="num" style={{ fontWeight: 600,
                      color: t.type === "thu" ? "var(--court)" : "#8A5B00" }}>
                      {t.type === "thu" ? "+" : "−"}{vnd(t.amount)}
                    </td>
                    <td className="num" style={{ color: t.after < 0 ? "var(--clay)" : "inherit" }}>{vnd(t.after)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="hint">Chưa có giao dịch nào. Nạp quỹ để bắt đầu.</p>
      ) : (
        mySes.length ? (
          <div className="scroll">
            <table className="tbl">
              <thead><tr><th>Ngày</th><th>Giờ & sân</th><th className="num">Sĩ số</th><th className="num">Phần của {m.name.split(" ").pop()}</th></tr></thead>
              <tbody>
                {mySes.map(({ s, c }) => (
                  <tr key={s.id}>
                    <td className="nm">{dmy(s.date)}<span className="sub">{dowOf(s.date)}</span></td>
                    <td>{s.start}–{s.end}<span className="sub">{c.court?.name || "chưa có sân"}</span></td>
                    <td className="num">{c.n}</td>
                    <td className="num" style={{ fontWeight: 600 }}>
                      {s.settled ? vnd(c.perHead) : <span className="pill open">chưa chốt</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="hint">Chưa tham gia buổi nào.</p>
      )}
    </Modal>
  );
}

/* ─────────────────────────  THÀNH VIÊN  ───────────────────────── */

function Members({ data, up }) {
  const admin = useAdmin();
  const { members, sessions, txs } = data;
  const [edit, setEdit] = useState(null);
  const [pay, setPay] = useState(null);
  const [sheet, setSheet] = useState(null);

  const blank = { id: uid(), name: "", phone: "", level: "Trung bình", joined: today(), active: true };
  const save = () => {
    if (!edit.name.trim()) return;
    up((d) => ({ members: d.members.some((m) => m.id === edit.id)
      ? d.members.map((m) => (m.id === edit.id ? edit : m)) : [...d.members, edit] }));
    setEdit(null);
  };
  const del = (id) => {
    if (!window.confirm("Xoá thành viên này? Giao dịch quỹ đã ghi vẫn giữ nguyên.")) return;
    up((d) => ({ members: d.members.filter((m) => m.id !== id),
      sessions: d.sessions.map((s) => ({ ...s, attendees: s.attendees.filter((a) => a !== id) })) }));
  };
  const stat = (id) => ({
    plays: sessions.filter((s) => s.settled && s.attendees.includes(id)).length,
    paid: txs.filter((t) => t.memberId === id && t.type === "thu").reduce((a, t) => a + t.amount, 0),
    used: txs.filter((t) => t.memberId === id && t.type === "tru").reduce((a, t) => a + t.amount, 0),
    bal: memBal(txs, id),
  });

  return (
    <>
      <div className="page-head">
        <div><h2>Thành viên</h2><p>{members.filter((m) => m.active).length} người đang chơi · {members.length} người trong sổ</p></div>
        {admin && <div className="spread"><button className="btn pri" onClick={() => setEdit({ ...blank, id: uid() })}>Thêm thành viên</button></div>}
      </div>

      {members.length ? (
        <>
        <div className="cols c4" style={{ marginBottom: 14 }}>
          <Stat label="Đang chơi" value={members.filter((m) => m.active).length + " người"} />
          <Stat label="Tổng số dư đang giữ"
            value={vnd(members.reduce((a, m) => a + memBal(txs, m.id), 0))} tone="pos" />
          <Stat label="Người cần nạp thêm"
            value={members.filter((m) => m.active && memBal(txs, m.id) < 100000).length + " người"} />
          <Stat label="Đang âm quỹ"
            value={members.filter((m) => memBal(txs, m.id) < 0).length + " người"}
            tone={members.some((m) => memBal(txs, m.id) < 0) ? "neg" : ""} />
        </div>
        <div className="card">
          <table className="tbl">
            <thead><tr>
              <th>Tên</th><th>Trình độ</th><th className="num">Số buổi</th>
              <th className="num">Đã nạp</th><th className="num">Đã dùng</th><th className="num">Số dư</th><th></th>
            </tr></thead>
            <tbody>
              {members.map((m) => {
                const st = stat(m.id);
                return (
                  <tr key={m.id} style={{ opacity: m.active ? 1 : 0.55 }}>
                    <td>
                      <button className="namebtn" onClick={() => setSheet(m)}>{m.name}</button>
                      <span className="sub">{m.phone || "chưa có số"}{m.active ? "" : " · đã nghỉ"}</span></td>
                    <td>{m.level}</td>
                    <td className="num">{st.plays}</td>
                    <td className="num">{vnd(st.paid)}</td>
                    <td className="num" style={{ color: "var(--muted)" }}>−{vnd(st.used)}</td>
                    <td className="num" style={{ fontWeight: 700,
                      color: st.bal < 0 ? "var(--clay)" : st.bal < 100000 ? "#8A5B00" : "var(--court)" }}>
                      {vnd(st.bal)}</td>
                    <td><div className="acts">
                      {admin && <button className="btn sm warm" onClick={() => setPay({ id: m.id, name: m.name, amount: 300000 })}>Nạp quỹ</button>}
                      <button className="btn sm mut" onClick={() => setSheet(m)}>Lịch sử</button>
                      {admin && <button className="btn sm mut" onClick={() => setEdit(m)}>Sửa</button>}
                      {admin && <button className="btn sm dgr" onClick={() => del(m.id)}>Xoá</button>}
                    </div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        </>
      ) : (
        <div className="card empty"><b>Sổ thành viên đang trống</b>{admin
          ? "Thêm người đầu tiên để bắt đầu điểm danh buổi đánh."
          : "Thủ quỹ chưa thêm ai vào sổ."}</div>
      )}

      {sheet && (
        <MemberSheet m={sheet} data={data} onClose={() => setSheet(null)}
          onPay={(x) => { setSheet(null); setPay({ id: x.id, name: x.name, amount: 300000 }); }} />
      )}

      {edit && (
        <Modal title={members.some((m) => m.id === edit.id) ? "Sửa thành viên" : "Thành viên mới"}
          onClose={() => setEdit(null)} onSave={save} saveOff={!edit.name.trim()}>
          <div className="cols c2">
            <Field label="Họ tên"><input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} placeholder="Nguyễn Văn Nam" /></Field>
            <Field label="Số điện thoại"><input value={edit.phone} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} placeholder="09…" /></Field>
            <Field label="Trình độ">
              <select value={edit.level} onChange={(e) => setEdit({ ...edit, level: e.target.value })}>
                {["Mới chơi", "Trung bình", "Khá", "Tốt"].map((l) => <option key={l}>{l}</option>)}
              </select>
            </Field>
            <Field label="Ngày vào CLB"><input type="date" value={edit.joined} onChange={(e) => setEdit({ ...edit, joined: e.target.value })} /></Field>
            <Field label="Trạng thái">
              <select value={edit.active ? "1" : "0"} onChange={(e) => setEdit({ ...edit, active: e.target.value === "1" })}>
                <option value="1">Đang chơi</option><option value="0">Đã nghỉ</option>
              </select>
            </Field>
          </div>
        </Modal>
      )}

      {pay && (
        <Modal title={`${pay.name} nạp quỹ`}
          sub={`Số dư hiện tại ${vnd(memBal(txs, pay.id))} → sau khi nạp ${vnd(memBal(txs, pay.id) + pay.amount)}`}
          onClose={() => setPay(null)} saveLabel="Ghi vào quỹ"
          onSave={() => { up((d) => ({ txs: [...d.txs, { id: uid(), date: today(), type: "thu",
            amount: pay.amount, cat: "Nạp quỹ", note: pay.name, memberId: pay.id }] })); setPay(null); }}>
          <Field label="Số tiền (₫)">
            <input type="number" step="10000" min="0" value={pay.amount} onChange={(e) => setPay({ ...pay, amount: +e.target.value || 0 })} />
          </Field>
          <div className="row">
            {[100000, 200000, 300000, 500000].map((v) => (
              <button key={v} className="btn sm mut" onClick={() => setPay({ ...pay, amount: v })}>{nf.format(v)}</button>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
}

/* ─────────────────────────  QUỸ  ───────────────────────── */

function Fund({ data, up, balance }) {
  const admin = useAdmin();
  const { txs, members } = data;
  const [edit, setEdit] = useState(null);
  const [filter, setFilter] = useState("all");

  const mo = today().slice(0, 7);
  const sum = (type, only) => txs.filter((t) => t.type === type && (!only || t.date.startsWith(mo)))
    .reduce((a, t) => a + t.amount, 0);
  const list = [...txs].filter((t) => filter === "all" || t.type === filter).reverse();
  const held = members.reduce((s, m) => s + memBal(txs, m.id), 0);
  const LBL = { thu: ["thu", "Tiền vào quỹ"], chi: ["chi", "Tiền ra khỏi quỹ"], tru: ["open", "Trừ số dư"] };

  const blank = { id: uid(), date: today(), type: "chi", amount: 0, cat: "Tiền cầu", note: "", memberId: "" };
  const save = () => {
    if (!edit.amount) return;
    up((d) => ({ txs: d.txs.some((t) => t.id === edit.id)
      ? d.txs.map((t) => (t.id === edit.id ? edit : t)) : [...d.txs, edit] }));
    setEdit(null);
  };

  return (
    <>
      <div className="page-head">
        <div><h2>Quỹ CLB</h2><p>Mọi khoản thu chi, kể cả tiền chốt từ buổi đánh.</p></div>
        {admin && <div className="spread"><button className="btn pri" onClick={() => setEdit({ ...blank, id: uid() })}>Ghi giao dịch</button></div>}
      </div>

      <div className="cols c4">
        <Stat label="Tiền mặt trong quỹ" value={vnd(balance)} tone={balance >= 0 ? "pos" : "neg"} />
        <Stat label="Số dư của thành viên" value={vnd(held)} />
        <Stat label="Quỹ chung của CLB" value={vnd(balance - held)} />
        <Stat label="Chi tháng này" value={vnd(sum("chi", true))} tone="neg" />
      </div>

      <p className="hint" style={{ marginTop: 12 }}>
        Tiền mặt trong quỹ gồm phần mọi người nạp trước còn chưa dùng, cộng quỹ chung của CLB
        (tài trợ, tiền lẻ làm tròn, phần quỹ tự chịu).
      </p>

      <div className="pane" style={{ marginTop: 14 }}>
       <div>
      <div className="row" style={{ marginBottom: 12 }}>
        {[["all", "Tất cả"], ["thu", "Nạp vào quỹ"], ["chi", "Chi ra"], ["tru", "Trừ số dư"]].map(([k, l]) => (
          <button key={k} className={"btn sm " + (filter === k ? "pri" : "mut")} onClick={() => setFilter(k)}>{l}</button>
        ))}
        <span className="hint" style={{ marginLeft: "auto", alignSelf: "center" }}>{list.length} dòng</span>
      </div>

      {list.length ? (
        <div className="card">
          <table className="tbl">
            <thead><tr><th>Ngày</th><th>Khoản</th><th>Người</th><th className="num">Số tiền</th><th></th></tr></thead>
            <tbody>
              {list.map((t) => (
                <tr key={t.id}>
                  <td>{dmy(t.date)}</td>
                  <td className="nm">{t.cat}
                    <span className="sub">
                      <span className={"pill " + LBL[t.type][0]}>{LBL[t.type][1]}</span>
                      {t.note ? " " + t.note : ""}
                    </span></td>
                  <td>{members.find((m) => m.id === t.memberId)?.name || "—"}</td>
                  <td className="num" style={{ fontWeight: 600,
                    color: t.type === "thu" ? "var(--court)" : t.type === "chi" ? "var(--clay)" : "#8A5B00" }}>
                    {t.type === "thu" ? "+" : "−"}{vnd(t.amount)}
                  </td>
                  <td>{admin && (<div className="acts">
                    <button className="btn sm mut" onClick={() => setEdit(t)}>Sửa</button>
                    <button className="btn sm dgr" onClick={() => window.confirm("Xoá giao dịch này?") &&
                      up((d) => ({ txs: d.txs.filter((x) => x.id !== t.id) }))}>Xoá</button>
                  </div>)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card empty"><b>Sổ quỹ chưa có dòng nào</b>Ghi khoản nạp đầu kỳ, hoặc chốt một buổi đánh để tiền tự vào sổ.</div>
      )}
       </div>

       <div className="cols" style={{ gap: 12 }}>
         <div className="card">
           <h3>Số dư từng người</h3>
           {members.filter((m) => m.active).length ? (
             <table className="tbl">
               <tbody>
                 {members.filter((m) => m.active)
                   .map((m) => ({ m, b: memBal(txs, m.id) }))
                   .sort((a, b) => a.b - b.b)
                   .map(({ m, b }) => (
                     <tr key={m.id}>
                       <td className="nm">{m.name}</td>
                       <td className="num" style={{ fontWeight: 600,
                         color: b < 0 ? "var(--clay)" : b < 100000 ? "#8A5B00" : "var(--court)" }}>{vnd(b)}</td>
                     </tr>
                   ))}
               </tbody>
             </table>
           ) : <p className="hint">Chưa có thành viên nào đang chơi.</p>}
         </div>

         <div className="card">
           <h3>Tháng này</h3>
           <div className="split"><span>Mọi người nạp vào</span><b>{vnd(sum("thu", true))}</b></div>
           <div className="split"><span>Chi ra khỏi quỹ</span><b>{vnd(sum("chi", true))}</b></div>
           <div className="split"><span>Trừ vào số dư</span><b>{vnd(sum("tru", true))}</b></div>
           <div className="split tot"><span>Quỹ tăng / giảm</span>
             <b style={{ color: sum("thu", true) - sum("chi", true) < 0 ? "var(--clay)" : "var(--court)" }}>
               {sum("thu", true) - sum("chi", true) >= 0 ? "+" : "−"}{vnd(Math.abs(sum("thu", true) - sum("chi", true)))}
             </b></div>
         </div>

         <div className="card">
           <h3>Chi nhiều nhất</h3>
           {CHI_CATS.map((c) => ({ c, v: txs.filter((t) => t.type === "chi" && t.cat === c).reduce((a, t) => a + t.amount, 0) }))
             .filter((x) => x.v > 0).sort((a, b) => b.v - a.v).map(({ c, v }) => (
               <div className="split" key={c}><span>{c}</span><b>{vnd(v)}</b></div>
             ))}
           {!txs.some((t) => t.type === "chi") && <p className="hint" style={{ margin: 0 }}>Chưa có khoản chi nào.</p>}
         </div>
       </div>
      </div>

      {edit && (
        <Modal title={txs.some((t) => t.id === edit.id) ? "Sửa giao dịch" : "Giao dịch mới"}
          onClose={() => setEdit(null)} onSave={save} saveOff={!edit.amount}>
          <div className="cols c2">
            <Field label="Loại">
              <select value={edit.type} onChange={(e) => setEdit({ ...edit, type: e.target.value,
                cat: e.target.value === "chi" ? CHI_CATS[0] : e.target.value === "thu" ? THU_CATS[0] : "Tiền buổi đánh" })}>
                <option value="thu">Nạp vào quỹ</option>
                <option value="chi">Chi từ quỹ</option>
                <option value="tru">Trừ số dư thành viên</option>
              </select>
            </Field>
            <Field label="Ngày"><input type="date" value={edit.date} onChange={(e) => setEdit({ ...edit, date: e.target.value })} /></Field>
            <Field label="Khoản">
              <select value={edit.cat} onChange={(e) => setEdit({ ...edit, cat: e.target.value })}>
                {(edit.type === "thu" ? THU_CATS : edit.type === "chi" ? CHI_CATS
                  : ["Tiền buổi đánh", "Tiền cầu riêng", "Khác"]).map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Số tiền (₫)">
              <input type="number" step="1000" min="0" value={edit.amount} onChange={(e) => setEdit({ ...edit, amount: +e.target.value || 0 })} />
            </Field>
            <Field label="Gắn với thành viên">
              <select value={edit.memberId || ""} onChange={(e) => setEdit({ ...edit, memberId: e.target.value })}>
                <option value="">Không gắn</option>
                {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Ghi chú"><input value={edit.note} onChange={(e) => setEdit({ ...edit, note: e.target.value })} placeholder="Mua 1 hộp cầu Hải Yến…" /></Field>
        </Modal>
      )}
    </>
  );
}

/* ─────────────────────────  SÂN  ───────────────────────── */

function Courts({ data, up }) {
  const admin = useAdmin();
  const { courts, sessions, slots, txs } = data;
  const [edit, setEdit] = useState(null);
  const blank = { id: uid(), name: "", place: "", price: 90000, note: "" };

  const save = () => {
    if (!edit.name.trim()) return;
    up((d) => ({ courts: d.courts.some((c) => c.id === edit.id)
      ? d.courts.map((c) => (c.id === edit.id ? edit : c)) : [...d.courts, edit] }));
    setEdit(null);
  };
  const del = (id) => {
    if (sessions.some((s) => s.courtId === id)) { window.alert("Sân này đang gắn với buổi đánh. Đổi sân của buổi đó trước."); return; }
    if (window.confirm("Xoá sân này?")) up((d) => ({ courts: d.courts.filter((c) => c.id !== id) }));
  };

  const statOf = (id) => {
    const mine = sessions.filter((s) => s.courtId === id);
    const done = mine.filter((s) => s.settled);
    return {
      booked: mine.length,
      done: done.length,
      next: mine.filter((s) => s.date >= today()).sort((a, b) => a.date.localeCompare(b.date))[0],
      spent: done.reduce((a, s) => a + sessionCost(s, courts).courtCost, 0),
      hrs: done.reduce((a, s) => a + hoursBetween(s.start, s.end), 0),
      heads: done.reduce((a, s) => a + s.attendees.length, 0),
    };
  };

  const totalHrs = sessions.filter((s) => s.settled).reduce((a, s) => a + hoursBetween(s.start, s.end), 0);
  const totalCourt = txs.filter((t) => t.type === "chi" && t.cat === "Tiền sân").reduce((a, t) => a + t.amount, 0);
  const cheapest = [...courts].sort((a, b) => a.price - b.price)[0];

  return (
    <>
      <div className="page-head">
        <div><h2>Sân</h2><p>Giá thuê theo giờ dùng để tính tiền mỗi buổi.</p></div>
        {admin && <div className="spread"><button className="btn pri" onClick={() => setEdit({ ...blank, id: uid() })}>Thêm sân</button></div>}
      </div>

      {!courts.length ? (
        <div className="card empty"><b>Chưa có sân nào</b>{admin
          ? "Thêm sân CLB thường đánh, kèm giá thuê mỗi giờ."
          : "Thủ quỹ chưa nhập sân nào."}</div>
      ) : (
        <div className="pane">
          <div className="courtgrid">
            {courts.map((c) => {
              const st = statOf(c.id);
              return (
                <div className="card" key={c.id}>
                  <div className="row" style={{ gap: 14, flexWrap: "nowrap", alignItems: "flex-start" }}>
                    <CourtThumb />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <b style={{ fontSize: 16, letterSpacing: "-.01em" }}>{c.name}</b>
                      <div className="hint">{c.place || "chưa có địa chỉ"}</div>
                      <div style={{ marginTop: 6, fontSize: 14, fontWeight: 600, color: "var(--court)",
                        fontVariantNumeric: "tabular-nums" }}>
                        {vnd(c.price)} / giờ
                      </div>
                    </div>
                    {admin && (
                      <div className="acts">
                        <button className="btn sm mut" onClick={() => setEdit(c)}>Sửa</button>
                        <button className="btn sm dgr" onClick={() => del(c.id)}>Xoá</button>
                      </div>
                    )}
                  </div>

                  <div className="cols c3" style={{ marginTop: 14 }}>
                    <Stat label="Buổi đã đặt" value={st.booked + (st.done < st.booked ? ` (${st.done} đã chốt)` : "")} />
                    <Stat label="Đã trả cho sân" value={vnd(st.spent)} />
                    <Stat label="Tổng giờ đã đánh" value={st.hrs ? st.hrs + " giờ" : "—"} />
                  </div>

                  <div className="wk" style={{ borderBottom: 0, paddingBottom: 0 }}>
                    <b style={{ flex: "0 0 auto", color: "var(--muted)", fontWeight: 500, fontSize: 13 }}>Buổi tới đây:</b>
                    <span className="slot">
                      {st.next
                        ? `${dowOf(st.next.date)} ${dmy(st.next.date)}, ${st.next.start}–${st.next.end}`
                        : <span className="off">chưa xếp buổi nào</span>}
                    </span>
                  </div>
                  {c.note && <p className="hint" style={{ marginBottom: 0 }}>{c.note}</p>}
                </div>
              );
            })}
          </div>

          <div className="cols" style={{ gap: 12 }}>
            <div className="card">
              <h3>Lịch tuần</h3>
              {DOW.map((d, i) => {
                const sl = slots.filter((x) => x.dow === i);
                return (
                  <div className="wk" key={i}>
                    <b style={{ color: sl.length ? "var(--ink)" : "#AEB8B0" }}>{d.replace("Thứ ", "T")}</b>
                    {sl.length ? (
                      <div style={{ minWidth: 0 }}>
                        {sl.map((x) => (
                          <div className="slot" key={x.id}>
                            {x.start}–{x.end}
                            <span style={{ color: "var(--muted)" }}> · {courts.find((c) => c.id === x.courtId)?.name || "chưa có sân"}</span>
                          </div>
                        ))}
                      </div>
                    ) : <span className="off">nghỉ</span>}
                  </div>
                );
              })}
              <p className="hint" style={{ margin: "10px 0 0" }}>
                {admin ? "Sửa lịch này ở tab Buổi đánh." : "Lịch cố định do thủ quỹ đặt."}
              </p>
            </div>

            <div className="card">
              <h3>Tiền sân đã trả</h3>
              <div className="split"><span>Tổng đã trả</span><b>{vnd(totalCourt)}</b></div>
              <div className="split"><span>Số giờ đã đánh</span><b>{totalHrs ? totalHrs + " giờ" : "—"}</b></div>
              <div className="split tot"><span>Bình quân mỗi giờ</span>
                <b>{totalHrs ? vnd(totalCourt / totalHrs) : "—"}</b></div>
              {courts.length > 1 && cheapest && (
                <p className="hint" style={{ marginBottom: 0 }}>
                  Rẻ nhất đang là {cheapest.name} với {vnd(cheapest.price)} một giờ.
                </p>
              )}
            </div>

            <div className="card">
              <h3>Chi phí một buổi 2 giờ</h3>
              <p className="hint" style={{ marginTop: 0 }}>Tính thử với 4 quả cầu 25.000₫, chia cho 8 người.</p>
              {courts.map((c) => {
                const tot = c.price * 2 + 4 * 25000;
                return (
                  <div className="split" key={c.id}>
                    <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
                    <b>{vnd(roundUp(tot / 8))}/người</b>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {edit && (
        <Modal title={courts.some((c) => c.id === edit.id) ? "Sửa sân" : "Sân mới"}
          onClose={() => setEdit(null)} onSave={save} saveOff={!edit.name.trim()}>
          <Field label="Tên sân"><input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} placeholder="Nhà thi đấu Cầu Giấy – sân 3" /></Field>
          <div className="cols c2">
            <Field label="Địa chỉ"><input value={edit.place} onChange={(e) => setEdit({ ...edit, place: e.target.value })} placeholder="35 Trần Duy Hưng" /></Field>
            <Field label="Giá mỗi giờ (₫)"><input type="number" step="5000" min="0" value={edit.price} onChange={(e) => setEdit({ ...edit, price: +e.target.value || 0 })} /></Field>
          </div>
          <Field label="Ghi chú"><input value={edit.note} onChange={(e) => setEdit({ ...edit, note: e.target.value })} placeholder="Liên hệ anh Sơn 09…, đặt trước 2 ngày" /></Field>
        </Modal>
      )}
    </>
  );
}
