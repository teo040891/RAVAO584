// ===============================
// CẤU HÌNH
// ===============================
// Dán URL Web App Google Apps Script sau khi Deploy (kết thúc bằng /exec)
const API_BASE = "https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLjaDoaEcmVlXAN1u4oHCzaXZP4aHgn8tzuP54rWMvHHwN7P7BlJ-ctuiAwMKqMjK_nHsXLeuBworOrVlNn78AeqpoGPJmbq_BonL4CyGcNcTaOnAwWDTwzC22o07pt37ZA9jTb1WD2bg9sj3Atbq9xXARmUbaPpvzfE3m-IRJXxTCd0sO6YACRKAK4RUc1CAQjxgRP-y8c3Mmw2A4yASfpmd3kHvJzcPsl9NfXT_zmRJUozOCoiP_wvE-S1SC6dVtHKo8bGCxQNwb2NvviquM7z7jhtTg&lib=M6GjJHZtZRR9FsjQjxu768AoUp9UuHMYn";

// Polling realtime (ms) – có thể đổi tại đây
const POLL_INTERVAL_MS = 2000;

// ===============================
// TIỆN ÍCH
// ===============================
function $(id){ return document.getElementById(id); }

function nowISO(){ return new Date().toISOString(); }

function getToken(){ return localStorage.getItem("token") || ""; }
function setToken(t){ localStorage.setItem("token", t); }
function getRole(){ return localStorage.getItem("role") || ""; }
function setRole(r){ localStorage.setItem("role", r); }
function clearAuth(){ localStorage.removeItem("token"); localStorage.removeItem("role"); localStorage.removeItem("user"); }

function setUser(u){ localStorage.setItem("user", u); }
function getUser(){ return localStorage.getItem("user") || ""; }

function apiUrl(action){
  const u = new URL(API_BASE);
  u.searchParams.set("action", action);
  return u.toString();
}

async function apiGet(action, params={}, auth=false){
  const u = new URL(apiUrl(action));
  Object.entries(params).forEach(([k,v])=>u.searchParams.set(k, v));
  const headers = {};
  if (auth){
    const t = getToken();
    if (t) headers["Authorization"] = "Bearer " + t;
  }
  const res = await fetch(u.toString(), { method:"GET", headers });
  return await res.json();
}

async function apiPost(action, body={}, auth=false){
  const headers = { "Content-Type":"application/json" };
  if (auth){
    const t = getToken();
    if (t) headers["Authorization"] = "Bearer " + t;
  }
  const res = await fetch(apiUrl(action), { method:"POST", headers, body: JSON.stringify(body) });
  return await res.json();
}

function qs(name){
  const u = new URL(window.location.href);
  return u.searchParams.get(name) || "";
}

function escapeHtml(s){
  return (s||"").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}

function toast(msg){
  const el = $("toast");
  if (!el) { alert(msg); return; }
  el.textContent = msg;
  el.style.display = "block";
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(()=>{ el.style.display="none"; }, 3500);
}

function requireAuth(allowedRoles){
  const role = getRole();
  const token = getToken();
  if (!token || !role || (allowedRoles && !allowedRoles.includes(role))){
    window.location.href = "index.html";
  }
}

// Simple table render
function renderTable(el, rows, columns){
  if (!el) return;
  const thead = "<thead><tr>" + columns.map(c=>`<th>${escapeHtml(c.label)}</th>`).join("") + "</tr></thead>";
  const tbody = "<tbody>" + rows.map(r=>{
    return "<tr>" + columns.map(c=>{
      const v = (typeof c.value === "function") ? c.value(r) : r[c.value];
      return `<td>${escapeHtml(v==null?"":String(v))}</td>`;
    }).join("") + "</tr>";
  }).join("") + "</tbody>";
  el.innerHTML = thead + tbody;
}

function fmtTime(iso){
  if (!iso) return "";
  try{
    const d = new Date(iso);
    return d.toLocaleString();
  }catch(e){ return iso; }
}
