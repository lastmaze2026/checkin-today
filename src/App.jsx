import { useState, useEffect } from "react";
import {
  auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged,
  db, doc, getDoc, setDoc, serverTimestamp
} from "./firebase.js";

/* ── FIREBASE CONFIG ── */
// Firebase 설정은 src/firebase.js에서 관리됩니다.

/* ── FONTS ── */
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Gaegu:wght@300;400;700&family=Noto+Serif+KR:wght@300;400;500&display=swap');`;

/* ── CSS ── */
const css = `
* { margin:0; padding:0; box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
:root {
  --bg:      #EFF5F0;
  --bg2:     #E2EDE4;
  --surface: #F7FAF7;
  --warm:    #4A7C6F;
  --warm2:   #5E9A8A;
  --pale:    #A8CBBC;
  --sage:    #3A9E7E;
  --sage-p:  #C5E6D8;
  --sky:     #4A9A8A;
  --sky-p:   #BAE0D4;
  --rose:    #C96B6B;
  --rose-p:  #F0D0D0;
  --text:    #1A2E24;
  --muted:   #5F8070;
  --border:  rgba(74,124,111,0.15);
}
body { font-family:'Gaegu', cursive; background:var(--bg); color:var(--text); }

.phone {
  width:390px; min-height:844px; background:var(--bg);
  border-radius:50px; overflow:hidden; position:relative;
  box-shadow: 0 40px 100px rgba(30,60,45,0.18), inset 0 0 0 1.5px rgba(74,124,111,0.18);
  display:flex; flex-direction:column;
}
.status { 
  height:48px; display:flex; align-items:center; justify-content:space-between;
  padding:0 28px; flex-shrink:0;
}
.status span { font-size:13px; color:var(--muted); }
.content { flex:1; overflow-y:auto; scrollbar-width:none; padding-bottom:96px; }
.content::-webkit-scrollbar { display:none; }

/* NAV */
.nav {
  position:absolute; bottom:0; left:0; right:0; height:86px;
  background:rgba(245,250,247,0.96); backdrop-filter:blur(16px);
  border-top:1px solid var(--border);
  display:flex; align-items:center; justify-content:space-around;
  padding:0 8px 10px;
}
.nav-btn {
  display:flex; flex-direction:column; align-items:center; gap:3px;
  background:none; border:none; cursor:pointer; padding:10px 16px;
  border-radius:18px; transition:all 0.18s; color:var(--muted); min-width:72px;
}
.nav-btn.on { color:var(--warm); background:rgba(74,124,111,0.09); }
.nav-btn .ico { font-size:22px; }
.nav-btn .lbl { font-size:12px; font-family:'Gaegu'; }

/* PAGE HEADER */
.ph { padding:24px 24px 4px; }
.ph-sub { font-size:13px; color:var(--muted); margin-bottom:4px; }
.ph-title { font-family:'Noto Serif KR', serif; font-size:22px; font-weight:400; line-height:1.35; }
.ph-title em { color:var(--warm); font-style:normal; }

/* FOLDER CHIPS */
.chips { display:flex; gap:8px; padding:16px 20px 8px; overflow-x:auto; scrollbar-width:none; }
.chips::-webkit-scrollbar { display:none; }
.chip {
  flex-shrink:0; padding:8px 16px; border-radius:20px; font-size:14px;
  border:1.5px solid var(--border); background:var(--surface); cursor:pointer;
  transition:all 0.15s; white-space:nowrap; display:flex; align-items:center; gap:6px;
}
.chip.on { background:var(--warm); border-color:var(--warm); color:#fff; }

/* TASK ITEM */
.task-card {
  margin:0 16px 8px; background:var(--surface); border:1.5px solid var(--border);
  border-radius:18px; padding:14px 16px; display:flex; align-items:flex-start; gap:10px;
  animation:up 0.22s ease both;
}
@keyframes up { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
.task-folder-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; margin-top:6px; }
.task-text { flex:1; font-size:15px; line-height:1.5; }
.task-del { background:none; border:none; color:var(--muted); font-size:14px; cursor:pointer; padding:2px 4px; transition:color 0.15s; }
.task-del:hover { color:var(--rose); }

/* ADD BAR */
.add-bar { margin:8px 16px 0; display:flex; gap:8px; }
.add-in {
  flex:1; background:var(--surface); border:1.5px solid var(--border); border-radius:16px;
  padding:13px 16px; color:var(--text); font-family:'Gaegu'; font-size:14px; outline:none;
  transition:border-color 0.18s;
}
.add-in:focus { border-color:var(--warm2); }
.add-in::placeholder { color:var(--muted); }
.add-btn {
  background:var(--warm); border:none; border-radius:16px; padding:13px 18px;
  color:#fff; font-size:20px; cursor:pointer; transition:opacity 0.15s;
}
.add-btn:hover { opacity:0.85; }

/* FOLDER SELECT */
.fsel { display:flex; gap:8px; margin:8px 16px 16px; flex-wrap:wrap; }
.fsel-btn {
  padding:6px 14px; border-radius:14px; font-size:13px; font-family:'Gaegu';
  border:1.5px solid var(--border); background:var(--surface); cursor:pointer;
  transition:all 0.15s; display:flex; align-items:center; gap:5px;
}
.fsel-btn.on { color:#fff; border-color:transparent; }

/* EMPTY */
.empty { text-align:center; padding:48px 32px; }
.empty-ico { font-size:36px; margin-bottom:12px; }
.empty-txt { font-size:14px; color:var(--muted); line-height:1.7; }

/* ── CHECK-IN SCREENS ── */
.checkin-wrap { padding:0 24px; }
.step-dots { display:flex; gap:6px; justify-content:center; margin:16px 0 28px; }
.step-dot { width:8px; height:8px; border-radius:50%; background:var(--pale); transition:all 0.2s; }
.step-dot.on { background:var(--warm); width:20px; }

.ci-title { font-family:'Noto Serif KR',serif; font-size:24px; font-weight:400; margin-bottom:8px; line-height:1.4; }
.ci-title em { color:var(--warm); font-style:normal; }
.ci-sub { font-size:14px; color:var(--muted); margin-bottom:28px; line-height:1.6; }

/* EMOJI GRID */
.emoji-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:32px; }
.emoji-btn {
  aspect-ratio:1; background:var(--surface); border:2px solid var(--border); border-radius:20px;
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px;
  cursor:pointer; transition:all 0.15s;
}
.emoji-btn:hover { border-color:var(--warm2); background:var(--bg2); }
.emoji-btn.on { border-color:var(--warm); background:rgba(74,124,111,0.08); }
.emoji-btn .e { font-size:28px; }
.emoji-btn .el { font-size:11px; color:var(--muted); font-family:'Gaegu'; }

/* ENERGY BARS */
.energy-opts { display:flex; flex-direction:column; gap:10px; margin-bottom:32px; }
.energy-btn {
  background:var(--surface); border:2px solid var(--border); border-radius:18px;
  padding:16px 20px; display:flex; align-items:center; gap:14px; cursor:pointer;
  transition:all 0.15s;
}
.energy-btn:hover { border-color:var(--warm2); }
.energy-btn.on { border-color:var(--warm); background:rgba(74,124,111,0.06); }
.energy-ico { font-size:24px; }
.energy-info { flex:1; }
.energy-name { font-size:16px; font-weight:700; }
.energy-desc { font-size:12px; color:var(--muted); margin-top:2px; }
.energy-bar { display:flex; gap:3px; }
.e-pip { width:14px; height:6px; border-radius:3px; background:var(--pale); }
.e-pip.filled { background:var(--warm); }

/* MOOD PILLS */
.mood-grid { display:flex; flex-wrap:wrap; gap:10px; margin-bottom:32px; }
.mood-btn {
  padding:10px 18px; border-radius:20px; border:2px solid var(--border);
  background:var(--surface); font-size:14px; font-family:'Gaegu'; cursor:pointer;
  transition:all 0.15s; display:flex; align-items:center; gap:6px;
}
.mood-btn.on { border-color:var(--warm); background:rgba(74,124,111,0.08); color:var(--warm); }

/* CTA */
.cta {
  width:100%; background:var(--warm); border:none; border-radius:20px; padding:18px;
  color:#fff; font-family:'Gaegu'; font-size:18px; cursor:pointer;
  transition:opacity 0.15s; margin-top:4px;
}
.cta:disabled { opacity:0.4; cursor:not-allowed; }
.cta:not(:disabled):hover { opacity:0.88; }

/* AI RESULT */
.result-card {
  background:var(--surface); border:2px solid var(--pale); border-radius:24px;
  padding:24px; margin:0 0 16px; position:relative; overflow:hidden;
}
.result-card::before {
  content:''; position:absolute; top:0; left:0; right:0; height:3px;
  background:linear-gradient(90deg, var(--pale), var(--warm2), var(--pale));
}
.result-label { font-size:11px; color:var(--muted); letter-spacing:0.1em; text-transform:uppercase; margin-bottom:12px; }
.result-task { font-family:'Noto Serif KR',serif; font-size:22px; font-weight:400; line-height:1.5; margin-bottom:6px; }
.result-folder { display:inline-flex; align-items:center; gap:6px; font-size:12px; color:var(--muted); margin-bottom:20px; }
.result-folder-dot { width:8px; height:8px; border-radius:50%; }

.quote-card { background:var(--bg2); border-radius:20px; padding:20px; margin-bottom:20px; }
.quote-ico { font-size:20px; margin-bottom:8px; }
.quote-text { font-family:'Noto Serif KR',serif; font-size:15px; line-height:1.7; color:var(--text); margin-bottom:8px; }
.quote-author { font-size:12px; color:var(--muted); }
.coach-text { font-size:14px; color:var(--text); line-height:1.7; background:var(--sage-p); border-radius:16px; padding:16px; }

.result-actions { display:flex; gap:10px; }
.ra-done { flex:1; background:var(--sage); border:none; border-radius:16px; padding:14px; color:#fff; font-family:'Gaegu'; font-size:15px; cursor:pointer; }
.ra-later { flex:1; background:var(--bg2); border:2px solid var(--border); border-radius:16px; padding:14px; color:var(--muted); font-family:'Gaegu'; font-size:15px; cursor:pointer; }

.loading-wrap { text-align:center; padding:48px 24px; }
.loading-txt { font-size:14px; color:var(--muted); line-height:1.7; margin-top:20px; }
.loading-title { font-family:'Noto Serif KR',serif; font-size:20px; font-weight:400; color:var(--text); margin-bottom:8px; }
.loading-title em { color:var(--warm); font-style:normal; }

/* 문 + 열쇠 애니메이션 */
.door-scene { position:relative; width:120px; height:160px; margin:0 auto 16px; overflow:hidden; }
.door-frame {
  position:absolute; bottom:0; left:50%; transform:translateX(-50%);
  width:90px; height:140px; background:var(--bg2); border:2.5px solid var(--pale);
  border-radius:6px 6px 0 0; overflow:hidden;
}
.door-panel {
  position:absolute; top:0; right:0; width:100%; height:100%;
  background:var(--surface); border-left:2.5px solid var(--pale);
  transform-origin:left center;
  animation:doorOpen 2s ease-in-out 0.8s forwards;
}
@keyframes doorOpen {
  0% { transform:perspective(400px) rotateY(0deg); }
  100% { transform:perspective(400px) rotateY(-75deg); }
}
.door-knob {
  position:absolute; right:12px; top:50%; width:8px; height:8px;
  border-radius:50%; background:var(--warm); transform:translateY(-50%);
}
.door-light {
  position:absolute; top:0; left:0; width:100%; height:100%;
  background:linear-gradient(135deg, rgba(74,124,111,0.15) 0%, rgba(74,124,111,0.05) 100%);
  opacity:0; animation:lightIn 1s ease 1.5s forwards;
}
@keyframes lightIn { to { opacity:1; } }
.door-glow {
  position:absolute; top:10%; left:10%; width:80%; height:80%;
  background:radial-gradient(circle, rgba(74,124,111,0.2) 0%, transparent 70%);
  opacity:0; animation:glowIn 1.2s ease 2s forwards;
}
@keyframes glowIn { to { opacity:1; } }
.key-icon {
  position:absolute; bottom:55px; left:50%; transform:translateX(-50%);
  animation:keyMove 0.8s ease-in-out forwards;
}
@keyframes keyMove {
  0% { transform:translateX(-50%) translateX(-40px) rotate(-30deg); opacity:0; }
  50% { transform:translateX(-50%) translateX(0px) rotate(0deg); opacity:1; }
  70% { transform:translateX(-50%) translateX(0px) rotate(20deg); opacity:1; }
  100% { transform:translateX(-50%) translateX(0px) rotate(0deg); opacity:1; }
}
.key-turn {
  animation:keyTurn 0.4s ease 0.6s forwards;
}
@keyframes keyTurn {
  0% { transform:translateX(-50%) rotate(0deg); }
  50% { transform:translateX(-50%) rotate(45deg); }
  100% { transform:translateX(-50%) rotate(0deg); }
}

/* LANDING SCREEN */
.landing {
  position:absolute; inset:0; z-index:999;
  background:linear-gradient(160deg, #EFF5F0 0%, #E2EDE4 40%, #F7FAF7 100%);
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  transition:opacity 0.6s ease, transform 0.6s ease;
  border-radius:50px;
}
.landing.exit {
  opacity:0; transform:scale(1.04); pointer-events:none;
}
.landing-inner {
  text-align:center; padding:0 36px;
  animation:landFadeUp 0.8s ease both;
}
@keyframes landFadeUp {
  from { opacity:0; transform:translateY(24px); }
  to   { opacity:1; transform:translateY(0); }
}
.landing-emoji {
  font-size:56px; margin-bottom:28px;
  animation:landFloat 3s ease-in-out infinite;
}
@keyframes landFloat {
  0%,100% { transform:translateY(0); }
  50%     { transform:translateY(-8px); }
}
.landing-greeting {
  font-size:15px; color:var(--muted); line-height:1.8;
  margin-bottom:32px; letter-spacing:0.02em;
}
.landing-title {
  font-family:'Noto Serif KR',serif; font-size:26px; font-weight:400;
  color:var(--text); line-height:1.5; margin-bottom:12px;
}
.landing-title em { color:var(--warm); font-style:normal; }
.landing-sub {
  font-size:14px; color:var(--muted); line-height:1.7; margin-bottom:48px;
}
.landing-cta {
  background:var(--warm); border:none; border-radius:22px;
  padding:18px 48px; color:#fff; font-family:'Gaegu'; font-size:18px;
  cursor:pointer; transition:all 0.2s; box-shadow:0 8px 32px rgba(74,124,111,0.25);
  animation:landFadeUp 0.8s ease 0.3s both;
}
.landing-cta:hover { opacity:0.9; transform:translateY(-2px); box-shadow:0 12px 40px rgba(74,124,111,0.3); }
.landing-dots {
  position:absolute; bottom:48px; display:flex; gap:6px;
  animation:landFadeUp 0.8s ease 0.5s both;
}
.landing-dot {
  width:6px; height:6px; border-radius:50%; background:var(--pale);
}
.landing-dot.on { width:18px; background:var(--warm); }
.landing-skip {
  position:absolute; top:56px; right:24px;
  background:none; border:none; font-family:'Gaegu'; font-size:14px;
  color:var(--muted); cursor:pointer; padding:8px 12px; border-radius:12px;
  transition:all 0.15s;
}
.landing-skip:hover { color:var(--warm); background:rgba(74,124,111,0.08); }
.landing-step-badge {
  display:inline-block; font-size:11px; color:var(--warm); letter-spacing:0.1em;
  font-weight:700; margin-bottom:4px;
}
.ob-fade-enter { animation:obFade 0.35s ease both; }
@keyframes obFade { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:translateX(0)} }

.toast {
  position:absolute; top:64px; left:50%; transform:translateX(-50%);
  background:var(--text); color:var(--bg); font-size:13px; font-family:'Gaegu';
  padding:10px 22px; border-radius:20px; white-space:nowrap;
  opacity:0; transition:opacity 0.25s; pointer-events:none; z-index:20;
}
.toast.show { opacity:1; }

/* MODAL */
.modal-overlay {
  position:absolute; inset:0; background:rgba(22,32,64,0.38);
  backdrop-filter:blur(4px); z-index:40;
  display:flex; align-items:flex-end; justify-content:center;
  animation:fadeIn2 0.2s ease;
}
@keyframes fadeIn2 { from{opacity:0} to{opacity:1} }
.modal-sheet {
  background:var(--surface); border-radius:28px 28px 0 0;
  padding:28px 24px 40px; width:100%;
  animation:slideUp2 0.25s ease;
}
@keyframes slideUp2 { from{transform:translateY(100%)} to{transform:translateY(0)} }
.modal-emoji { font-size:36px; text-align:center; margin-bottom:12px; }
.modal-title { font-family:'Noto Serif KR',serif; font-size:20px; font-weight:400; text-align:center; line-height:1.5; margin-bottom:8px; color:var(--text); }
.modal-sub { font-size:13px; color:var(--muted); text-align:center; line-height:1.7; margin-bottom:24px; }
.modal-task-preview {
  background:var(--bg2); border-radius:14px; padding:12px 16px;
  font-size:14px; color:var(--text); margin-bottom:24px; line-height:1.5;
  text-align:center; font-style:italic;
}
.modal-btns { display:flex; flex-direction:column; gap:10px; }
.modal-del-btn {
  background:var(--rose); border:none; border-radius:16px; padding:15px;
  color:#fff; font-family:'Gaegu'; font-size:16px; cursor:pointer;
  transition:opacity 0.15s;
}
.modal-del-btn:hover { opacity:0.88; }
.modal-cancel-btn {
  background:var(--bg2); border:1.5px solid var(--border); border-radius:16px; padding:14px;
  color:var(--muted); font-family:'Gaegu'; font-size:15px; cursor:pointer;
}
.modal-ok-btn {
  background:var(--warm); border:none; border-radius:16px; padding:15px;
  color:#fff; font-family:'Gaegu'; font-size:16px; cursor:pointer;
}


/* WEEKLY GRAPH */
.week-graph {
  margin:16px 16px 0; background:var(--surface); border:1.5px solid var(--border);
  border-radius:20px; padding:20px;
}
.week-graph-title {
  font-size:11px; color:var(--muted); letter-spacing:0.08em; text-transform:uppercase; margin-bottom:16px;
  display:flex; align-items:center; gap:8px;
}
.week-graph-title::after { content:''; flex:1; height:1px; background:var(--pale); }
.week-bars { display:flex; align-items:flex-end; justify-content:space-between; gap:6px; height:80px; padding:0 4px; }
.week-bar-col { display:flex; flex-direction:column; align-items:center; gap:6px; flex:1; }
.week-bar-emoji { font-size:16px; }
.week-bar-track { width:100%; height:50px; background:var(--bg2); border-radius:10px; position:relative; overflow:hidden; display:flex; align-items:flex-end; }
.week-bar-fill { width:100%; border-radius:10px; transition:height 0.4s ease; }
.week-bar-day { font-size:10px; color:var(--muted); margin-top:4px; }
.week-bar-today { font-size:10px; color:var(--warm); font-weight:700; margin-top:4px; }
.week-summary { display:flex; gap:12px; margin-top:16px; padding-top:14px; border-top:1px solid var(--border); }
.week-stat { flex:1; text-align:center; }
.week-stat-val { font-family:'Noto Serif KR',serif; font-size:20px; color:var(--text); font-weight:400; }
.week-stat-lbl { font-size:11px; color:var(--muted); margin-top:2px; }

/* DONE TASKS COLLECTION */
.done-section { margin:20px 16px 0; }
.done-card {
  background:var(--surface); border:1.5px solid var(--border); border-radius:18px;
  padding:16px; margin-bottom:8px; display:flex; align-items:center; gap:12px;
  animation:up 0.2s ease both;
}
.done-check {
  width:28px; height:28px; border-radius:50%; background:linear-gradient(135deg, var(--sage) 0%, #2ECAA0 100%);
  display:flex; align-items:center; justify-content:center; flex-shrink:0;
  color:#fff; font-size:13px; font-weight:700;
}
.done-info { flex:1; }
.done-text { font-size:14px; color:var(--text); line-height:1.4; }
.done-meta { font-size:11px; color:var(--muted); margin-top:3px; }
.done-empty {
  background:var(--surface); border:1.5px dashed var(--border); border-radius:18px;
  padding:28px 20px; text-align:center;
}

/* EMPTY STATE (ENHANCED) */
.empty-enhanced {
  margin:0 16px; background:var(--surface); border:1.5px dashed var(--border);
  border-radius:22px; padding:40px 24px; text-align:center;
  animation:up 0.3s ease both;
}
.empty-enhanced-ico { font-size:48px; margin-bottom:16px; line-height:1; }
.empty-enhanced-title {
  font-family:'Noto Serif KR',serif; font-size:18px; font-weight:400;
  color:var(--text); line-height:1.5; margin-bottom:8px;
}
.empty-enhanced-sub {
  font-size:13px; color:var(--muted); line-height:1.7; margin-bottom:24px;
}
.empty-enhanced-cta {
  background:var(--warm); border:none; border-radius:16px; padding:14px 28px;
  color:#fff; font-family:'Gaegu'; font-size:15px; cursor:pointer;
  transition:all 0.15s; box-shadow:0 4px 16px rgba(74,124,111,0.2);
}
.empty-enhanced-cta:hover { opacity:0.88; transform:translateY(-1px); }
.empty-enhanced-alt {
  display:block; margin-top:12px; background:none; border:none;
  font-family:'Gaegu'; font-size:13px; color:var(--muted); cursor:pointer;
}
.empty-enhanced-alt:hover { color:var(--warm); }
.empty-folder-hint {
  margin:0 16px; background:var(--surface); border:1.5px dashed var(--border);
  border-radius:16px; padding:18px 16px; text-align:center;
  display:flex; align-items:center; gap:10px; justify-content:center;
}
.empty-folder-hint-text { font-size:13px; color:var(--muted); line-height:1.5; }
.empty-folder-hint-arrow { font-size:16px; color:var(--pale); }

.section-lbl {
  font-size:11px; color:var(--muted); letter-spacing:0.1em; text-transform:uppercase;
  margin:20px 24px 8px; display:flex; align-items:center; gap:8px;
}
.section-lbl::after { content:''; flex:1; height:1px; background:var(--pale); }

/* DETAIL PAGE */
.detail-page {
  position:absolute; top:0; left:0; right:0; bottom:0;
  background:var(--bg); z-index:30; display:flex; flex-direction:column;
  animation:slideUp 0.25s ease both;
}
@keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
.detail-header {
  padding:56px 20px 16px; display:flex; align-items:center; gap:12px; flex-shrink:0;
}
.detail-back {
  background:var(--surface); border:1.5px solid var(--border); border-radius:14px;
  padding:8px 14px; font-family:'Gaegu'; font-size:14px; color:var(--muted);
  cursor:pointer; display:flex; align-items:center; gap:4px; flex-shrink:0;
}
.detail-folder-badge {
  display:inline-flex; align-items:center; gap:5px; padding:6px 12px;
  border-radius:12px; font-size:13px; color:#fff;
}
.detail-body { flex:1; overflow-y:auto; scrollbar-width:none; padding:0 20px 100px; }
.detail-body::-webkit-scrollbar { display:none; }
.detail-title-input {
  width:100%; background:none; border:none; outline:none;
  font-family:'Noto Serif KR',serif; font-size:24px; font-weight:400;
  color:var(--text); line-height:1.4; padding:8px 0 16px;
  border-bottom:1.5px solid var(--border); margin-bottom:24px; resize:none;
}
.detail-section-label {
  font-size:11px; color:var(--muted); letter-spacing:0.08em; text-transform:uppercase;
  margin-bottom:10px; display:flex; align-items:center; gap:6px;
}
.detail-memo-input {
  width:100%; background:var(--surface); border:1.5px solid var(--border);
  border-radius:18px; padding:16px; color:var(--text);
  font-family:'Gaegu'; font-size:15px; line-height:1.6; outline:none;
  resize:none; min-height:140px; transition:border-color 0.18s; margin-bottom:24px;
}
.detail-memo-input:focus { border-color:var(--warm2); }
.detail-memo-input::placeholder { color:var(--muted); }
.detail-date-btn {
  width:100%; background:var(--surface); border:1.5px solid var(--border);
  border-radius:18px; padding:16px 20px; display:flex; align-items:center; gap:12px;
  cursor:pointer; transition:border-color 0.18s; margin-bottom:12px;
  font-family:'Gaegu'; font-size:15px; color:var(--text);
}
.detail-date-btn:hover { border-color:var(--warm2); }
.detail-date-btn.set { border-color:var(--warm); background:rgba(74,124,111,0.05); }
.detail-date-input {
  width:100%; background:var(--surface); border:1.5px solid var(--warm);
  border-radius:18px; padding:16px 20px; color:var(--text);
  font-family:'Gaegu'; font-size:15px; outline:none; margin-bottom:12px;
}
.detail-save {
  position:absolute; bottom:24px; left:20px; right:20px;
  background:var(--warm); border:none; border-radius:20px; padding:17px;
  color:#fff; font-family:'Gaegu'; font-size:17px; cursor:pointer;
  transition:opacity 0.15s; z-index:2;
}
.detail-save:hover { opacity:0.88; }
.detail-del {
  margin-left:auto; background:none; border:none; color:var(--muted);
  font-size:13px; font-family:'Gaegu'; cursor:pointer; padding:6px 10px;
  border-radius:10px; transition:all 0.15s;
}
.detail-del:hover { color:var(--rose); background:var(--rose-p); }
.date-chip {
  display:inline-flex; align-items:center; gap:6px; padding:8px 14px;
  border-radius:14px; background:rgba(74,124,111,0.1); color:var(--warm);
  font-size:13px; margin-bottom:10px;
}

/* DETAIL INNER TABS */
.dtabs { display:flex; gap:6px; margin-bottom:20px; }
.dtab {
  flex:1; padding:10px 4px; border-radius:14px; border:1.5px solid var(--border);
  background:var(--surface); font-family:'Gaegu'; font-size:14px; color:var(--muted);
  cursor:pointer; transition:all 0.15s; text-align:center;
}
.dtab.on { background:var(--warm); border-color:var(--warm); color:#fff; }

/* LINK CARD */
.link-card {
  background:var(--surface); border:1.5px solid var(--border); border-radius:18px;
  padding:14px 16px; margin-bottom:10px; display:flex; align-items:center; gap:12px;
  animation:up 0.2s ease both;
}
.link-favicon { width:36px; height:36px; border-radius:10px; object-fit:cover; flex-shrink:0; background:var(--pale); display:flex; align-items:center; justify-content:center; font-size:18px; }
.link-info { flex:1; overflow:hidden; }
.link-name { font-size:14px; font-weight:700; margin-bottom:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.link-url { font-size:11px; color:var(--muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.link-open { background:var(--pale); border:none; border-radius:10px; padding:7px 12px; font-family:'Gaegu'; font-size:12px; color:var(--warm); cursor:pointer; flex-shrink:0; transition:all 0.15s; }
.link-open:hover { background:var(--warm); color:#fff; }
.link-del { background:none; border:none; color:var(--muted); font-size:13px; cursor:pointer; padding:4px; transition:color 0.15s; flex-shrink:0; }
.link-del:hover { color:var(--rose); }
.link-add-row { display:flex; gap:8px; margin-bottom:8px; }
.link-input {
  flex:1; background:var(--surface); border:1.5px solid var(--border); border-radius:16px;
  padding:13px 16px; color:var(--text); font-family:'Gaegu'; font-size:14px; outline:none;
  transition:border-color 0.18s;
}
.link-input:focus { border-color:var(--warm2); }
.link-input::placeholder { color:var(--muted); }

/* MINI CALENDAR */
.cal-wrap {
  margin:16px 16px 0; background:var(--surface); border:1.5px solid var(--border);
  border-radius:18px; padding:12px;
}
.cal-nav-row {
  display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;
}
.cal-month-lbl { font-family:'Noto Serif KR',serif; font-size:14px; font-weight:400; color:var(--text); }
.cal-nav-btn {
  background:var(--bg2); border:none; border-radius:8px;
  padding:4px 10px; color:var(--muted); font-size:13px; cursor:pointer; transition:all 0.15s;
}
.cal-nav-btn:hover { background:var(--pale); color:var(--warm); }
.cal-day-labels { display:grid; grid-template-columns:repeat(7,1fr); margin-bottom:2px; }
.cal-day-lbl { text-align:center; font-size:10px; color:var(--muted); padding:1px 0; }
.cal-grid-mini { display:grid; grid-template-columns:repeat(7,1fr); gap:1px; }
.cal-cell {
  aspect-ratio:1; display:flex; flex-direction:column; align-items:center; justify-content:center;
  border-radius:8px; font-size:12px; cursor:pointer; transition:all 0.15s;
  position:relative; gap:1px;
}
.cal-cell:hover { background:var(--bg2); }
.cal-cell.today { background:var(--warm); color:#fff; font-weight:700; }
.cal-cell.selected { background:var(--bg2); border:1.5px solid var(--warm); color:var(--warm); }
.cal-cell.other { opacity:0.3; }
.cal-cell .cal-dot { width:3px; height:3px; border-radius:50%; background:var(--warm2); flex-shrink:0; }
.cal-cell.today .cal-dot { background:rgba(255,255,255,0.7); }
.cal-schedule { margin-top:10px; border-top:1px solid var(--border); padding-top:10px; }
.cal-sch-item {
  display:flex; align-items:flex-start; gap:8px; padding:6px 0;
  border-bottom:1px solid var(--border);
}
.cal-sch-item:last-child { border-bottom:none; }
.cal-sch-dot { width:7px; height:7px; border-radius:50%; flex-shrink:0; margin-top:4px; }
.cal-sch-text { flex:1; font-size:12px; line-height:1.4; }
.cal-sch-folder { font-size:10px; color:var(--muted); margin-top:1px; }
.cal-empty-day { text-align:center; padding:8px 0; font-size:12px; color:var(--muted); }
`;


/* ── DATA ── */
const DEFAULT_FOLDERS = [
  { id:"todo",  label:"지금",   icon:"📌", color:"#4A7C6F" },
  { id:"want",  label:"나중",   icon:"✨", color:"#3A6B5E" },
  { id:"learn", label:"언제든", icon:"🔍", color:"#3A9E7E" },
];

const EMOJIS = [
  { e:"😴", l:"피곤해" }, { e:"😰", l:"불안해" }, { e:"😶", l:"멍해" }, { e:"😤", l:"의욕넘쳐" },
  { e:"🙂", l:"그럭저럭" }, { e:"😔", l:"우울해" }, { e:"🤩", l:"최고야" }, { e:"😡", l:"짜증나" },
];

const ENERGIES = [
  { id:"low",  name:"낮음", desc:"몸이 무겁고 아무것도 하기 싫다", pips:1, ico:"🪫" },
  { id:"mid",  name:"보통", desc:"할 수 있을 것도 같고... 모르겠다", pips:2, ico:"⚡" },
  { id:"high", name:"높음", desc:"뭔가 해보고 싶은 기분!", pips:3, ico:"🔥" },
];

const MOODS = [
  "😌 평온해", "😟 불안해", "🙂 의욕있어", "😞 무기력해",
  "🤔 생각많아", "😤 집중되는날", "🥲 예민해", "😊 기분좋아",
];

const INIT_TASKS = [];

let uid = 20;

/* ── CLAUDE API ── */
async function askClaude(tasks, emoji, energy, mood, folders) {
  const taskList = tasks.map((t, i) => {
    const f = folders.find(f => f.id === t.folder);
    return `${i+1}. [${f?.label}] ${t.text}`;
  }).join("\n");

  const prompt = `당신은 ADHD와 완벽주의 성향을 가진 사람들을 위한 따뜻한 생산성 코치입니다.

오늘의 유저 상태:
- 기분 이모지: ${emoji}
- 에너지 레벨: ${energy}
- 감정 상태: ${mood}

유저의 할 일 목록:
${taskList}

위 상태를 고려해서, 오늘 이 사람이 부담 없이 시작할 수 있는 할 일을 딱 1개만 추천해주세요.
완벽주의자라서 시작을 두려워하는 사람입니다. 작고 가벼운 것이 좋습니다.

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 절대 포함하지 마세요:
{
  "taskIndex": 숫자(1부터 시작하는 번호),
  "quote": "오늘 상태에 딱 맞는 짧은 명언 (20자 내외)",
  "quoteAuthor": "저자이름 · 《책 제목》 또는 유명인사 이름만 (예: 스티브 잡스, 또는 제임스 클리어 · 《아주 작은 습관의 힘》)",
  "coaching": "이 할 일을 오늘 해보면 좋은 이유를 따뜻하게 2-3문장으로. 판단 없이, 응원하듯이."
}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({
      model:"claude-sonnet-4-20250514",
      max_tokens:600,
      messages:[{ role:"user", content:prompt }]
    })
  });
  const data = await res.json();
  const raw = data.content?.map(c => c.text||"").join("") || "";
  const clean = raw.replace(/```json|```/g,"").trim();
  return JSON.parse(clean);
}

/* ── APP ── */
export default function App() {
  const now = new Date();
  const [tab, setTab]         = useState("home"); // home | list | today
  const [showLanding, setShowLanding] = useState(false);
  const [landingExit, setLandingExit] = useState(false);
  const [onboardPage, setOnboardPage] = useState(0);
  const [noLoginConfirm, setNoLoginConfirm] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [appReady, setAppReady] = useState(false);

  // Firebase Auth 상태 감지
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setCurrentUser({ displayName: user.displayName, email: user.email, photoURL: user.photoURL });
      else setCurrentUser(null);
    });
    return () => unsubscribe();
  }, []);

  const [FOLDERS, setFolders] = useState(DEFAULT_FOLDERS);
  const [tasks, setTasks]     = useState(INIT_TASKS);
  const [folder, setFolder]   = useState("all");
  const [newText, setNewText] = useState("");
  const [newFolder, setNewFolder] = useState("want");
  const [selectedTask, setSelectedTask] = useState(null);
  const [detailTab, setDetailTab]       = useState("memo");
  const [detailMemo, setDetailMemo]     = useState("");
  const [detailLinks, setDetailLinks]   = useState([]);
  const [detailLinkInput, setDetailLinkInput] = useState("");
  const [detailDate, setDetailDate]     = useState("");

  // 유저 데이터 저장 키
  const STORAGE_KEY = "checkin-user-data";

  // 유저 데이터 로드 (앱 시작 시)
  useEffect(() => {
    (async () => {
      try {
        if (window.storage && window.storage.get) {
          const result = await window.storage.get(STORAGE_KEY);
          if (result && result.value) {
            const data = JSON.parse(result.value);
            if (data.tasks) setTasks(data.tasks);
            if (data.doneTasks) setDoneTasks(data.doneTasks);
            if (data.checkinHistory) setCheckinHistory(data.checkinHistory);
            if (data.todayCheckin) setTodayCheckin(data.todayCheckin);
          }
        }
      } catch(e) {}
    })();
  }, []);

  // 유저 데이터 저장 (변경 시 자동 저장)
  const saveUserData = async (newTasks, newDone, newCheckins, newTodayCheckin) => {
    try {
      if (window.storage && window.storage.set) {
        await window.storage.set(STORAGE_KEY, JSON.stringify({
          tasks: newTasks || tasks,
          doneTasks: newDone || doneTasks,
          checkinHistory: newCheckins || checkinHistory,
          todayCheckin: newTodayCheckin !== undefined ? newTodayCheckin : todayCheckin,
        }));
      }
    } catch(e) {}
  };
  const [showDateInput, setShowDateInput] = useState(false);
  const [toast, setToast]     = useState({ show:false, msg:"" });
  const [confirmModal, setConfirmModal] = useState(null);
  const [afterModal, setAfterModal]     = useState(false);
  const [keepModal, setKeepModal]       = useState(false);

  // Calendar
  const [calYear, setCalYear]   = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [calSelDay, setCalSelDay] = useState(now.getDate());

  const MONTHS_KR = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];
  const DAYS_KR   = ["일","월","화","수","목","금","토"];

  const getCalCells = (y, m) => {
    const first = new Date(y, m, 1).getDay();
    const days  = new Date(y, m + 1, 0).getDate();
    const prev  = new Date(y, m, 0).getDate();
    const cells = [];
    for (let i = first - 1; i >= 0; i--) cells.push({ day: prev - i, cur: false });
    for (let i = 1; i <= days; i++)      cells.push({ day: i, cur: true });
    while (cells.length % 7 !== 0)       cells.push({ day: cells.length - days - first + 1, cur: false });
    return cells;
  };

  // tasks that have a date matching a calendar day
  const tasksForDay = (day) => {
    const dateStr = `${calYear}-${String(calMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    const quick = ["오늘","내일","이번 주","다음 주","언젠가"];
    return tasks.filter(t => {
      if (!t.date) return false;
      if (t.date === dateStr) return true;
      if (t.date === "오늘" && day === now.getDate() && calMonth === now.getMonth() && calYear === now.getFullYear()) return true;
      if (t.date === "내일" && day === now.getDate()+1 && calMonth === now.getMonth() && calYear === now.getFullYear()) return true;
      return false;
    });
  };

  const daysWithTask = new Set(
    getCalCells(calYear, calMonth)
      .filter(c => c.cur && tasksForDay(c.day).length > 0)
      .map(c => c.day)
  );


  // check-in steps: 0=emoji 1=energy 2=mood 3=loading 4=result
  const [step, setStep]   = useState(0);
  const [emoji, setEmoji] = useState(null);
  const [energy, setEnergy] = useState(null);
  const [mood, setMood]   = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError]  = useState(false);
  const [todayCheckin, setTodayCheckin] = useState(null);

  const ONBOARD_PAGES = [
    { emoji:"🌿", greeting:"오전에도 오후에도 언제든 좋아요", title:<>나의 오늘의<br/><em>체크인</em> 하세요.</>, sub:"", cta:"시작할게요 →" },
    { emoji:"📝", greeting:"STEP 1", title:<>할 일을<br/><em>던져두세요</em></>, sub:"지금 · 나중 · 언제든\n세 칸에 부담 없이 적어두기만 하면 돼요", cta:"다음 →" },
    { emoji:"😌", greeting:"STEP 2", title:<>기분을<br/><em>체크하면</em></>, sub:"이모지 하나, 에너지 레벨, 감정 상태\n판단 없이 지금 느끼는 대로 골라요", cta:"다음 →" },
    { emoji:"✨", greeting:"STEP 3", title:<><span style={{fontSize:16, color:"var(--muted)"}}>내가 남겨뒀던 것 중</span><br/>오늘 딱 하나<br/><em>골라드려요</em></>, sub:"컨디션에 맞는 할 일을 추천해드려요\n작고 가벼운 것부터. 그게 시작이에요", cta:"시작해볼게요 🌿" },
  ];

  // 온보딩 완료 여부 체크 (persistent storage)
  useEffect(() => {
    (async () => {
      let isFirstVisit = true;
      try {
        if (window.storage && window.storage.get) {
          const result = await window.storage.get("onboarding-done");
          if (result && result.value === "true") {
            isFirstVisit = false;
          }
        }
      } catch(e) {}
      if (isFirstVisit) setShowLanding(true);
      setAppReady(true);
    })();
  }, []);

  const nextOnboard = () => {
    if (onboardPage < ONBOARD_PAGES.length - 1) {
      setOnboardPage(p => p + 1);
    } else {
      completeOnboarding();
    }
  };

  const dismissLanding = () => {
    completeOnboarding();
  };

  const completeOnboarding = async () => {
    setLandingExit(true);
    setTimeout(() => setShowLanding(false), 600);
    try {
      if (window.storage && window.storage.set) {
        await window.storage.set("onboarding-done", "true");
      }
    } catch(e) {}
  };

  const showToast = (msg) => {
    setToast({ show:true, msg });
    setTimeout(() => setToast({ show:false, msg:"" }), 2000);
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      setCurrentUser({ displayName: user.displayName, email: user.email, photoURL: user.photoURL });

      const userDocRef = doc(db, "users", user.uid);
      const existing = await getDoc(userDocRef);
      if (!existing.exists()) {
        await setDoc(userDocRef, {
          tasks, doneTasks, checkinHistory, todayCheckin,
          createdAt: serverTimestamp(),
        });
      } else {
        const serverData = existing.data();
        if (serverData.tasks) setTasks(serverData.tasks);
        if (serverData.doneTasks) setDoneTasks(serverData.doneTasks);
        if (serverData.checkinHistory) setCheckinHistory(serverData.checkinHistory);
        if (serverData.todayCheckin) setTodayCheckin(serverData.todayCheckin);
      }

      showToast("로그인됐어요 🌿");
      setShowProfile(false);
    } catch(e) {
      if (e.code !== "auth/popup-closed-by-user") showToast("로그인에 실패했어요");
    }
  };

  const handleLogout = async () => {
    try { await signOut(auth); } catch(e) {}
    setCurrentUser(null);
    showToast("로그아웃됐어요");
    setShowProfile(false);
  };

  const triggerFolderGuide = async () => {
    if (folderGuideShown) return;
    try {
      if (window.storage && window.storage.get) {
        const result = await window.storage.get("folder-guide-done");
        if (result && result.value === "true") {
          setFolderGuideShown(true);
          return;
        }
      }
    } catch(e) {}
    setShowFolderGuide(true);
    setFolderGuideShown(true);
  };

  const dismissFolderGuide = async () => {
    setShowFolderGuide(false);
    try {
      if (window.storage && window.storage.set) {
        await window.storage.set("folder-guide-done", "true");
      }
    } catch(e) {}
  };

  const addTask = () => {
    if (!newText.trim()) return;
    const newTask = { id:++uid, text:newText.trim(), folder:newFolder };
    const updated = [...tasks, newTask];
    setTasks(updated);
    setNewText("");
    showToast("추가됐어요 🌿");
    saveUserData(updated);
  };

  const delTask = (id) => {
    const updated = tasks.filter(x => x.id !== id);
    setTasks(updated);
    saveUserData(updated);
  };
  const askDelete = (task) => setConfirmModal({ task });
  const confirmDelete = () => {
    delTask(confirmModal.task.id);
    setConfirmModal(null);
    setTimeout(() => setAfterModal(true), 200);
  };

  const openDetail = (task) => {
    setSelectedTask(task);
    setDetailTab("memo");
    setDetailMemo(task.memo || "");
    setDetailLinks(task.links || []);
    setDetailDate(task.date || "");
    setShowDateInput(false);
  };

  const saveDetail = () => {
    const updated = tasks.map(t => t.id === selectedTask.id
      ? { ...t, memo: detailMemo, links: detailLinks, date: detailDate, text: selectedTask.text }
      : t
    );
    setTasks(updated);
    setSelectedTask(null);
    showToast("저장됐어요 🌿");
    saveUserData(updated);
  };

  const addLink = () => {
    let url = detailLinkInput.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
    const info = getLinkInfo(url);
    setDetailLinks(l => [...l, { url, ...info }]);
    setDetailLinkInput("");
  };

  const getLinkInfo = (url) => {
    try {
      const u = new URL(url);
      const host = u.hostname.replace("www.", "");
      const apps = [
        { match: ["youtube.com", "youtu.be"],   name:"YouTube",    emoji:"▶️",  deep:(u) => `vnd.youtube:${u.pathname.includes("watch") ? u.searchParams.get("v") || "" : u.pathname.replace("/","") }` },
        { match: ["instagram.com"],             name:"Instagram",  emoji:"📸",  deep:(u) => `instagram://` },
        { match: ["twitter.com","x.com"],       name:"X (트위터)", emoji:"𝕏",   deep:(u) => `twitter://` },
        { match: ["tiktok.com"],                name:"TikTok",     emoji:"🎵",  deep:(u) => `snssdk1233://` },
        { match: ["open.spotify.com","spotify.com"], name:"Spotify", emoji:"🎧", deep:(u) => u.href.replace("https://open.spotify.com","spotify:").replace(/\//g,":") },
        { match: ["naver.com"],                 name:"네이버",     emoji:"🟢",  deep:null },
        { match: ["kakao.com","kakaotalk.com"], name:"카카오",     emoji:"💛",  deep:null },
        { match: ["coupang.com"],               name:"쿠팡",       emoji:"🛒",  deep:null },
        { match: ["notion.so","notion.com"],    name:"Notion",     emoji:"⬜",  deep:(u) => `notion://` },
        { match: ["github.com"],                name:"GitHub",     emoji:"🐙",  deep:null },
        { match: ["apple.com"],                 name:"Apple",      emoji:"🍎",  deep:null },
      ];
      const found = apps.find(a => a.match.some(m => host.includes(m)));
      return {
        name: found ? found.name : host,
        emoji: found ? found.emoji : "🔗",
        deepLink: found?.deep ? found.deep(u) : null,
      };
    } catch { return { name: url, emoji:"🔗", deepLink: null }; }
  };

  const openLink = (link) => {
    if (link.deepLink) {
      // Try deep link first, fallback to web
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      document.body.appendChild(iframe);
      try { iframe.src = link.deepLink; } catch(e) {}
      setTimeout(() => {
        document.body.removeChild(iframe);
        window.open(link.url, "_blank");
      }, 500);
    } else {
      window.open(link.url, "_blank");
    }
  };


  const filtered = folder === "all" ? tasks : tasks.filter(t => t.folder === folder);

  // 로컬 fallback 추천 — 에너지/기분 기반으로 최적 태스크 선택
  const localRecommend = () => {
    if (tasks.length === 0) return null;

    // 에너지 낮으면 "언제든"(learn) 우선, 높으면 "지금"(todo) 우선
    const folderPriority = energy === "low"
      ? ["learn", "want", "todo"]
      : energy === "high"
      ? ["todo", "want", "learn"]
      : ["want", "todo", "learn"];

    // 날짜 설정 없는 것 우선 (부담 없는 것)
    const sorted = [...tasks].sort((a, b) => {
      const ai = folderPriority.indexOf(a.folder);
      const bi = folderPriority.indexOf(b.folder);
      if (ai !== bi) return ai - bi;
      if (!a.date && b.date) return -1;
      if (a.date && !b.date) return 1;
      return 0;
    });

    const picked = sorted[0];
    const idx = tasks.findIndex(t => t.id === picked.id);

    const QUOTES = {
      low: { quote: "쉬는 것도 생산성이다. 충전 없이는 달릴 수 없다.", author: "알렉스 수정 김 방", quoteAuthor: "알렉스 수정 김 방 · 《쉬어야 산다》", coaching: "오늘 에너지가 낮아도 괜찮아요. 아주 작은 것 하나만 건드려봐요. 시작이 전부예요." },
      mid: { quote: "완벽함보다 완성이 낫다.", author: "셰인 패리시", quoteAuthor: "셰인 패리시 · 《명확한 생각》", coaching: "지금 컨디션으로 충분히 할 수 있어요. 부담 없이 시작해봐요. 잘 될 거예요." },
      high: { quote: "행동이 두려움을 없앤다.", author: "아멜리아 에어하트", quoteAuthor: "아멜리아 에어하트", coaching: "오늘 에너지가 좋네요! 이 기회에 하나 해치워봐요. 분명 후련할 거예요." },
    };
    const q = QUOTES[energy] || QUOTES.mid;

    return { taskIndex: idx + 1, ...q };
  };

  const startAI = async () => {
    setStep(4); // 로딩
    setAiError(false);

    // 타임아웃 5초 — 넘으면 로컬 fallback
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 5000));

    try {
      const result = await Promise.race([askClaude(tasks, emoji, energy, mood, FOLDERS), timeout]);
      setAiResult(result);
    } catch(e) {
      // API 실패 시 로컬 추천으로 fallback
      const fallback = localRecommend();
      setAiResult(fallback);
    }
    setStep(5); // 결과
  };

  const [checkinHistory, setCheckinHistory] = useState([]);
  const [showCheckinHistory, setShowCheckinHistory] = useState(false);
  const [showGraphInfo, setShowGraphInfo] = useState(false);
  const [showFolderGuide, setShowFolderGuide] = useState(false);
  const [showDoneList, setShowDoneList] = useState(false);
  const [folderGuideShown, setFolderGuideShown] = useState(false);

  // 이모지 → 점수 매핑 (주간 그래프용)
  const EMOJI_SCORE = { "😴":2, "😰":2, "😶":3, "😤":5, "🙂":4, "😔":1, "🤩":5, "😡":2 };
  const EMOJI_LABEL = { "😴":"피곤", "😰":"불안", "😶":"멍함", "😤":"의욕", "🙂":"무난", "😔":"우울", "🤩":"최고", "😡":"짜증" };

  // 완료된 할일 데모 데이터
  const [doneTasks, setDoneTasks] = useState([]);

  const resetCheckin = (saveResult = false) => {
    if (saveResult && emoji) {
      const record = { emoji, energy, mood, aiResult,
        date: now.toLocaleDateString("ko-KR",{ month:"long", day:"numeric", weekday:"short" }),
        time: now.toLocaleTimeString("ko-KR",{ hour:"2-digit", minute:"2-digit" }),
      };
      setTodayCheckin(record);
      setCheckinHistory(h => {
        const filtered = h.filter(r => r.date !== record.date);
        const updated = [record, ...filtered];
        saveUserData(null, null, updated, record);
        return updated;
      });
    }
    setStep(0); setEmoji(null); setEnergy(null); setMood(null); setAiResult(null);
  };

  const recommendedTask = aiResult ? tasks[aiResult.taskIndex - 1] : null;
  const recFolder = recommendedTask ? FOLDERS.find(f => f.id === recommendedTask.folder) : null;

  // 요일 감성 + 응원 카드 데이터
  const DAY_CARDS = [
    { day:"일요일", context:"한 주의 마지막, 아니 시작이에요", emoji:"🌅" },
    { day:"월요일", context:"새로운 한 주가 시작됐어요", emoji:"🌱" },
    { day:"화요일", context:"월요일은 넘겼어요, 잘 하고 있어요", emoji:"💪" },
    { day:"수요일", context:"한 주의 딱 중간이에요", emoji:"⛰️" },
    { day:"목요일", context:"거의 다 왔어요, 조금만 더요", emoji:"🌤️" },
    { day:"금요일", context:"오늘만 버티면 주말이에요", emoji:"🎉" },
    { day:"토요일", context:"오늘은 온전히 나를 위한 날이에요", emoji:"🛋️" },
  ];
  const MOOD_CARDS = [
    { quote:"시작이 반이다.", sub:"나머지 반은 그냥 따라와요", emoji:"✨" },
    { quote:"완벽하지 않아도 충분해요.", sub:"지금 이 순간도 잘 하고 있어요", emoji:"🌿" },
    { quote:"작은 것부터 하면 돼요.", sub:"크게 시작하지 않아도 괜찮아요", emoji:"🪴" },
    { quote:"오늘 하루도 버텼잖아요.", sub:"그것만으로 충분해요", emoji:"💙" },
    { quote:"비교하지 않아도 돼요.", sub:"어제의 나보다 조금만 나아지면 돼요", emoji:"🌙" },
    { quote:"생각만 해도 절반은 한 거예요.", sub:"적어뒀다는 것 자체가 이미 시작이에요", emoji:"📝" },
    { quote:"쉬어가도 괜찮아요.", sub:"달리다 멈추는 것도 용기예요", emoji:"☁️" },
    { quote:"지금 느리다고 잘못된 게 아니에요.", sub:"나만의 속도가 있어요", emoji:"🐢" },
  ];

  const todayCard = (() => {
    const dow = now.getDay();
    // 날짜 기반 seed로 매일 같은 카드 노출
    const seed = now.getDate() + now.getMonth() * 31;
    const useMood = seed % 2 === 0;
    if (useMood) {
      return { type:"mood", ...MOOD_CARDS[seed % MOOD_CARDS.length] };
    } else {
      return { type:"day", ...DAY_CARDS[dow] };
    }
  })();

  if (!appReady) return <><style>{FONTS}{css}</style><div style={{ minHeight:"100vh", background:"#D4E4D8" }} /></>;

  return (
    <>
      <style>{FONTS}{css}</style>
      <div style={{ minHeight:"100vh", background:"#D4E4D8", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
        <div className="phone">

          {/* Status Bar */}
          <div className="status">
            <span>{String(now.getHours()).padStart(2,"0")}:{String(now.getMinutes()).padStart(2,"0")}</span>
            <span style={{fontSize:9,letterSpacing:3}}>●●●</span>
            <span style={{fontSize:13}}>🔋</span>
          </div>

          {/* Toast */}
          <div className={`toast ${toast.show?"show":""}`}>{toast.msg}</div>

          <div className="content">

            {/* ── HOME TAB ── */}
            {tab === "home" && (
              <>
                <div className="ph" style={{ position:"relative" }}>
                  <div className="ph-sub">{now.toLocaleDateString("ko-KR",{month:"long",day:"numeric",weekday:"long"})}</div>
                  <div className="ph-title">{
                    [
                      <><span style={{fontSize:15, color:"var(--muted)"}}>내일을 위해 준비해도 좋고</span><br/><em>그냥 쉬어도 좋아요</em> 🍵</>,
                      <><span style={{fontSize:15, color:"var(--muted)"}}>시작했다는 것만으로</span><br/><em>이번 주 잘 하고 있어요</em> 🌱</>,
                      <><span style={{fontSize:15, color:"var(--muted)"}}>월요일은 넘겼어요</span><br/><em>잘 하고 있어요</em> 💪</>,
                      <><span style={{fontSize:15, color:"var(--muted)"}}>한 주의 딱 중간이에요</span><br/><em>절반 왔어요</em> ⛰️</>,
                      <><span style={{fontSize:15, color:"var(--muted)"}}>거의 다 왔어요</span><br/><em>조금만 더요</em> 🌤️</>,
                      <><span style={{fontSize:15, color:"var(--muted)"}}>오늘만 버티면 주말이에요</span><br/><em>조금만 더요</em> 🎉</>,
                      <><span style={{fontSize:15, color:"var(--muted)"}}>오늘은 온전히</span><br/><em>나를 위한 날이에요</em> 🛋️</>,
                    ][now.getDay()]
                  }</div>
                  <button onClick={() => setShowProfile(true)} style={{
                    position:"absolute", top:24, right:24,
                    width:36, height:36, borderRadius:"50%",
                    background:"var(--warm)", border:"none", cursor:"pointer",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    boxShadow:"0 2px 8px rgba(74,124,111,0.2)", transition:"all 0.15s",
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </button>
                </div>

                {/* 아침 체크인 배너 */}
                <div style={{ margin:"16px 16px 0" }}>
                  {todayCheckin ? (
                    <div style={{
                      background:"linear-gradient(135deg, #4A7C6F 0%, #5E9A8A 100%)",
                      borderRadius:20, padding:"16px 18px", color:"#fff"
                    }}>
                      <div style={{ fontSize:12, opacity:0.85, marginBottom:4 }}>오늘의 체크인 완료</div>
                      <div style={{ fontFamily:"'Noto Serif KR',serif", fontSize:17, fontWeight:400, lineHeight:1.4 }}>
                        오늘도 열었잖아요. 그것만으로 충분해요 💙
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      background:"linear-gradient(135deg, #4A7C6F 0%, #5E9A8A 100%)",
                      borderRadius:20, padding:"16px 18px", color:"#fff"
                    }}>
                      <div style={{ fontFamily:"'Noto Serif KR',serif", fontSize:17, fontWeight:400, marginBottom:12, lineHeight:1.4 }}>
                        지금 기분이 어때요?<br/>오늘 딱 맞는 할 일 찾아드릴게요.
                      </div>
                      <button onClick={() => { resetCheckin(); setStep(1); }} style={{
                        background:"rgba(255,255,255,0.22)", border:"1.5px solid rgba(255,255,255,0.4)",
                        borderRadius:12, padding:"9px 20px", color:"#fff", fontFamily:"'Gaegu'", fontSize:14, cursor:"pointer"
                      }}>오늘을 체크인 →</button>
                    </div>
                  )}
                </div>

                <div style={{ margin:"24px 24px", height:1, background:"var(--border)" }} />

                {/* 빠른 입력창 */}
                <div style={{ margin:"16px 16px 0" }}>
                  <div style={{ display:"flex", gap:6, marginBottom:10 }}>
                    {FOLDERS.map((f, i) => (
                      <button key={f.id} onClick={() => setNewFolder(f.id)} style={{
                        flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:5,
                        padding:"9px 4px", borderRadius:14,
                        border: newFolder===f.id ? "2px solid transparent" : "1.5px solid var(--border)",
                        background: newFolder===f.id ? f.color : "var(--surface)",
                        color: newFolder===f.id ? "#fff" : "var(--muted)",
                        fontFamily:"'Gaegu'", fontSize:12, cursor:"pointer", transition:"all 0.15s",
                      }}>
                        <span style={{
                          width:17, height:17, borderRadius:"50%", flexShrink:0,
                          background: newFolder===f.id ? "rgba(255,255,255,0.25)" : "var(--pale)",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize:10, fontWeight:700, color: newFolder===f.id ? "#fff" : "var(--warm)",
                        }}>{i+1}</span>
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {/* 폴더 안내 온보딩 */}
                  {showFolderGuide && (
                    <div style={{
                      background:"var(--surface)", border:"2px solid var(--warm)",
                      borderRadius:18, padding:"18px 16px", marginBottom:12,
                      animation:"up 0.25s ease both", position:"relative",
                    }}>
                      <div style={{ fontSize:13, color:"var(--text)", lineHeight:1.8, marginBottom:14 }}>
                        <strong style={{ color:"var(--warm)" }}>📌 지금</strong> — 오늘·내일 해야 할 것<br/>
                        <strong style={{ color:"var(--warm)" }}>✨ 나중</strong> — 급하진 않지만 하고 싶은 것<br/>
                        <strong style={{ color:"var(--warm)" }}>🔍 언제든</strong> — 언젠가 해보고 싶은 것
                      </div>
                      <div style={{ fontSize:12, color:"var(--muted)", lineHeight:1.6, marginBottom:14 }}>
                        어디에 넣을지 고민하지 마세요.<br/>
                        부담 없이 던져두면 돼요 🌿
                      </div>
                      <button onClick={dismissFolderGuide} style={{
                        width:"100%", background:"var(--warm)", border:"none", borderRadius:14,
                        padding:"12px", color:"#fff", fontFamily:"'Gaegu'", fontSize:14, cursor:"pointer",
                      }}>알겠어요!</button>
                    </div>
                  )}

                  <div style={{ position:"relative", marginBottom:10 }}>
                    <span style={{ position:"absolute", left:18, top:18, fontSize:17, pointerEvents:"none" }}>✏️</span>
                    <textarea
                      className="add-in"
                      placeholder={`${FOLDERS.find(f=>f.id===newFolder)?.icon} ${FOLDERS.find(f=>f.id===newFolder)?.label}에 던져두기...\n떠오르는 것 뭐든 적어두세요`}
                      value={newText}
                      onChange={e => setNewText(e.target.value)}
                      onFocus={triggerFolderGuide}
                      onKeyDown={e => { if(e.key==="Enter" && !e.shiftKey && newText.trim()) { e.preventDefault(); addTask(); } }}
                      rows={3}
                      style={{ width:"100%", paddingLeft:46, paddingTop:16, paddingBottom:16, borderRadius:20, fontSize:15,
                        background:"var(--surface)", border:"1.5px solid var(--border)",
                        resize:"none", lineHeight:1.6, fontFamily:"'Gaegu'", outline:"none",
                        transition:"border-color 0.18s" }}
                    />
                    {newText.trim() && (
                      <button onClick={addTask} style={{
                        position:"absolute", right:12, bottom:12,
                        background:"var(--warm)", border:"none", borderRadius:14, padding:"8px 18px",
                        color:"#fff", fontFamily:"'Gaegu'", fontSize:14, cursor:"pointer"
                      }}>추가 +</button>
                    )}
                  </div>
                </div>

                <div style={{ margin:"24px 24px", height:1, background:"var(--border)" }} />

                {/* 조용한 카운터 */}
                <div style={{ margin:"0 20px 12px", fontSize:14, color:"var(--muted)", fontFamily:"'Noto Serif KR',serif", lineHeight:1.6, fontWeight:500 }}>
                  던져만 두세요. 기억은 제가 할게요.
                </div>
                <div style={{
                  margin:"20px 16px 0", background:"var(--surface)", border:"1.5px solid var(--border)",
                  borderRadius:18, padding:"20px", display:"flex", justifyContent:"space-around",
                  alignItems:"center",
                }}>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontFamily:"'Noto Serif KR',serif", fontSize:24, fontWeight:400, color:"var(--text)" }}>
                      {tasks.length}
                    </div>
                    <div style={{ fontSize:11, color:"var(--muted)", marginTop:4 }}>던져둔 것</div>
                  </div>
                  <div style={{ width:1, height:32, background:"var(--border)" }} />
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontFamily:"'Noto Serif KR',serif", fontSize:24, fontWeight:400, color:"var(--warm)" }}>
                      {doneTasks.length}
                    </div>
                    <div style={{ fontSize:11, color:"var(--muted)", marginTop:4 }}>해낸 것</div>
                  </div>
                </div>
                <div style={{ height:24 }} />
              </>
            )}

            {/* ── LIST TAB ── */}
            {tab === "list" && (
              <>
                <div className="ph">
                  <div className="ph-sub">쌓아둔 생각들</div>
                  <div className="ph-title">내 <em>리스트</em></div>
                </div>

                {/* 오늘의 응원 카드 */}
                <div style={{ margin:"0 16px 8px" }}>
                  <div style={{
                    background:"var(--surface)", border:"1.5px solid var(--border)",
                    borderRadius:22, padding:"18px 20px", position:"relative", overflow:"hidden",
                  }}>
                    <div style={{
                      position:"absolute", right:-8, bottom:-8, fontSize:60,
                      opacity:0.08, lineHeight:1,
                    }}>{todayCard.emoji}</div>

                    {todayCard.type === "day" ? (
                      <>
                        <div style={{ fontSize:11, color:"var(--muted)", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:8 }}>
                          {now.toLocaleDateString("ko-KR",{ month:"long", day:"numeric" })} · {todayCard.day}
                        </div>
                        <div style={{ fontFamily:"'Noto Serif KR',serif", fontSize:16, fontWeight:400, color:"var(--text)", lineHeight:1.5, marginBottom:4 }}>
                          {todayCard.context}
                        </div>
                        <div style={{ fontSize:12, color:"var(--muted)" }}>
                          오늘도 천천히 가도 돼요 {todayCard.emoji}
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize:11, color:"var(--muted)", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:8 }}>
                          {now.toLocaleDateString("ko-KR",{ month:"long", day:"numeric" })} · 오늘의 한 마디
                        </div>
                        <div style={{ fontFamily:"'Noto Serif KR',serif", fontSize:16, fontWeight:400, color:"var(--text)", lineHeight:1.5, marginBottom:6 }}>
                          "{todayCard.quote}"
                        </div>
                        <div style={{ fontSize:12, color:"var(--muted)", lineHeight:1.6 }}>
                          {todayCard.sub} {todayCard.emoji}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* 전체 비었을 때 */}
                {tasks.length === 0 ? (
                  <div className="empty-enhanced">
                    <div className="empty-enhanced-ico">🌱</div>
                    <div className="empty-enhanced-title">
                      아직 비어있어요
                    </div>
                    <div className="empty-enhanced-sub">
                      머릿속에 떠다니는 것들,<br/>
                      생각나는 대로 던져두시면<br/>
                      여기에서 기억해 둘게요 🌿
                    </div>
                  </div>
                ) : (
                  <>
                    {/* 폴더별 구역 */}
                    {FOLDERS.map(f => {
                      const folderTasks = tasks.filter(t => t.folder === f.id);
                      return (
                        <div key={f.id} style={{ marginBottom: 8 }}>
                          {/* 구역 헤더 */}
                          <div style={{
                            display:"flex", alignItems:"center", gap:10,
                            margin:"20px 16px 10px",
                          }}>
                            <div style={{
                              display:"flex", alignItems:"center", gap:7,
                              background: f.color + "18", border:`1.5px solid ${f.color}30`,
                              borderRadius:14, padding:"6px 14px",
                            }}>
                              <span style={{ fontSize:15 }}>{f.icon}</span>
                              <span style={{ fontSize:14, fontWeight:700, color: f.color, fontFamily:"'Gaegu'" }}>{f.label}</span>
                            </div>
                            <div style={{ flex:1, height:1, background:"var(--pale)" }} />
                          </div>

                          {folderTasks.length === 0 ? (
                            <div className="empty-folder-hint">
                              <div className="empty-folder-hint-arrow">↑</div>
                              <div className="empty-folder-hint-text">
                                홈에서 <strong style={{color:f.color}}>{f.icon} {f.label}</strong>에 적어보세요
                              </div>
                            </div>
                          ) : folderTasks.map((t, i) => (
                            <div className="task-card" key={t.id} style={{ animationDelay:`${i*0.04}s`, cursor:"pointer" }}
                              onClick={() => openDetail(t)}>
                              <div className="task-folder-dot" style={{ background:f.color }} />
                              <div style={{ flex:1 }}>
                                <div className="task-text">{t.text}</div>
                                {(t.memo || t.date || (t.links && t.links.length > 0)) && (
                                  <div style={{ display:"flex", gap:8, marginTop:4, flexWrap:"wrap" }}>
                                    {t.date && <span style={{ fontSize:11, color:"var(--warm)", background:"rgba(74,124,111,0.1)", padding:"2px 8px", borderRadius:8 }}>📅 {t.date}</span>}
                                    {t.memo && <span style={{ fontSize:11, color:"var(--muted)" }}>📝 메모</span>}
                                    {t.links && t.links.length > 0 && <span style={{ fontSize:11, color:"var(--sky)" }}>🔗 링크 {t.links.length}개</span>}
                                  </div>
                                )}
                              </div>
                              <button className="task-del" onClick={e => { e.stopPropagation(); askDelete(t); }}>✕</button>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </>
                )}
                {/* 해낸 것들 버튼 */}
                {doneTasks.length > 0 && (
                  <div style={{ margin:"20px 16px 0" }}>
                    <button onClick={() => setShowDoneList(true)} style={{
                      width:"100%", background:"var(--surface)", border:"1.5px solid var(--border)",
                      borderRadius:16, padding:"16px 18px", fontFamily:"'Gaegu'", fontSize:14,
                      color:"var(--text)", cursor:"pointer", display:"flex", alignItems:"center",
                      justifyContent:"space-between", transition:"all 0.15s",
                    }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <span style={{ fontSize:18 }}>🌿</span>
                        <div>
                          <div>해낸 것들 모아보기</div>
                          <div style={{ fontSize:11, color:"var(--muted)", marginTop:2 }}>{doneTasks.length}개 완료</div>
                        </div>
                      </div>
                      <span style={{ color:"var(--pale)", fontSize:14 }}>→</span>
                    </button>
                  </div>
                )}
                <div style={{ height:24 }} />
              </>
            )}

            {/* ── 해낸 것들 상세 페이지 ── */}
            {showDoneList && (
              <div className="detail-page">
                <div className="detail-header">
                  <button className="detail-back" onClick={() => setShowDoneList(false)}>← 뒤로</button>
                  <span style={{ fontFamily:"'Noto Serif KR',serif", fontSize:16, color:"var(--muted)" }}>해낸 것들</span>
                </div>
                <div className="detail-body">
                  {doneTasks.length === 0 ? (
                    <div className="empty">
                      <div className="empty-ico">🌱</div>
                      <div className="empty-txt">아직 비어있어요<br/>하나 해내면 여기에 쌓여요</div>
                    </div>
                  ) : (
                    <>
                      <div style={{
                        background:"linear-gradient(135deg, #4A7C6F 0%, #5E9A8A 100%)",
                        borderRadius:20, padding:"20px", marginBottom:20, color:"#fff",
                      }}>
                        <div style={{ fontFamily:"'Noto Serif KR',serif", fontSize:28, fontWeight:400, marginBottom:6 }}>
                          {doneTasks.length}개
                        </div>
                        <div style={{ fontSize:14, opacity:0.9, lineHeight:1.6 }}>
                          {doneTasks.length <= 3
                            ? "하나씩 해내고 있어요. 이 속도면 충분해요 🌿"
                            : doneTasks.length <= 10
                            ? "벌써 이만큼 해냈어요. 대단한 거예요 🌿"
                            : "꾸준히 쌓아왔네요. 정말 잘 하고 있어요 🌿"}
                        </div>
                      </div>
                      {doneTasks.map((t, i) => {
                        const f = FOLDERS.find(x => x.id === t.folder);
                        return (
                          <div className="done-card" key={t.id || i} style={{ animationDelay:`${i*0.04}s` }}>
                            <div className="done-check">✓</div>
                            <div className="done-info">
                              <div className="done-text">{t.text}</div>
                              <div className="done-meta">{t.doneDate || "오늘"} {t.doneAt} · {f ? `${f.icon} ${f.label}` : ""}</div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ── DETAIL PAGE ── */}
            {selectedTask && (() => {
              const f = FOLDERS.find(x => x.id === selectedTask.folder);
              return (
                <div className="detail-page">
                  <div className="detail-header">
                    <button className="detail-back" onClick={() => { saveDetail(); setSelectedTask(null); }}>← 저장하고 나가기</button>
                    <div className="detail-folder-badge" style={{ background: f?.color }}>
                      {f?.icon} {f?.label}
                    </div>
                    <button className="detail-del" onClick={() => { delTask(selectedTask.id); setSelectedTask(null); }}>삭제</button>
                  </div>

                  <div className="detail-body">
                    {/* 제목 */}
                    <textarea className="detail-title-input" rows={2}
                      value={selectedTask.text}
                      onChange={e => setSelectedTask(s => ({ ...s, text: e.target.value }))}
                    />

                    {/* ── 메모 ── */}
                    <div className="detail-section-label">📝 메모</div>
                    <textarea className="detail-memo-input"
                      placeholder={"완벽하게 쓰지 않아도 돼요.\n그냥 생각나는 대로."}
                      value={detailMemo}
                      onChange={e => setDetailMemo(e.target.value)}
                    />

                    {/* ── 링크 ── */}
                    <div className="detail-section-label">🔗 링크</div>
                    <div className="link-add-row">
                      <input className="link-input"
                        placeholder="URL 붙여넣기 (youtube.com...)"
                        value={detailLinkInput}
                        onChange={e => setDetailLinkInput(e.target.value)}
                        onKeyDown={e => e.key==="Enter" && addLink()}
                      />
                      <button className="add-btn" onClick={addLink}>+</button>
                    </div>
                    {detailLinks.map((lk, i) => (
                      <div className="link-card" key={i}>
                        <div className="link-favicon">{lk.emoji}</div>
                        <div className="link-info">
                          <div className="link-name">{lk.name}</div>
                          <div className="link-url">{lk.url}</div>
                        </div>
                        <button className="link-open" onClick={() => openLink(lk)}>열기</button>
                        <button className="link-del" onClick={() => setDetailLinks(l => l.filter((_,j)=>j!==i))}>✕</button>
                      </div>
                    ))}
                    <div style={{ fontSize:11, color:"var(--muted)", marginBottom:24, lineHeight:1.6 }}>
                      YouTube · Instagram · Spotify · Notion 등 앱이 설치된 경우 앱으로 열려요
                    </div>

                    {/* ── 일정 ── */}
                    <div className="detail-section-label">📅 일정</div>
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:12 }}>
                      {["오늘", "내일", "이번 주", "다음 주", "언젠가"].map(d => (
                        <button key={d} onClick={() => setDetailDate(detailDate===d ? "" : d)} style={{
                          padding:"9px 16px", borderRadius:16,
                          border: detailDate===d ? "2px solid var(--warm)" : "1.5px solid var(--border)",
                          background: detailDate===d ? "rgba(74,124,111,0.1)" : "var(--surface)",
                          color: detailDate===d ? "var(--warm)" : "var(--muted)",
                          fontFamily:"'Gaegu'", fontSize:14, cursor:"pointer", transition:"all 0.15s",
                        }}>{d}</button>
                      ))}
                    </div>
                    <input type="date" className="detail-date-input"
                      value={detailDate.match(/^\d{4}/) ? detailDate : ""}
                      onChange={e => setDetailDate(e.target.value)}
                      style={{ marginBottom:8 }}
                    />
                    <div style={{ fontSize:11, color:"var(--muted)", marginBottom:24, lineHeight:1.6 }}>
                      알림은 없어요. 참고용으로만 써요 🌿
                    </div>
                  </div>

                  <button className="detail-save" onClick={() => { saveDetail(); setSelectedTask(null); }}>✓ 자동저장됐어요</button>
                </div>
              );
            })()}

            {/* ── 체크인 인라인 (홈 내부) ── */}
            {tab === "home" && step > 0 && (
              <div style={{
                position:"absolute", inset:0, background:"var(--bg)", zIndex:25,
                display:"flex", flexDirection:"column", overflowY:"auto",
              }}>
                <div style={{ padding:"56px 24px 24px", display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ fontFamily:"'Noto Serif KR',serif", fontSize:16, color:"var(--muted)" }}>오늘을 체크인 중</span>
                </div>
                <div className="checkin-wrap" style={{ paddingBottom:60 }}>
                  {step < 3 && (
                    <div className="step-dots">
                      {[1,2,3].map(i => <div key={i} className={`step-dot ${step===i?"on":""}`} />)}
                    </div>
                  )}
                  {step === 1 && (
                    <>
                      <div className="ci-title">지금 기분이<br/><em>어때요?</em></div>
                      <div className="ci-sub">판단 없이 지금 느끼는 대로 골라요</div>
                      <div className="emoji-grid">
                        {EMOJIS.map(em => (
                          <div key={em.e} className={`emoji-btn ${emoji===em.e?"on":""}`}
                            onClick={() => { setEmoji(em.e); setTimeout(()=>setStep(2),300); }}>
                            <span className="e">{em.e}</span>
                            <span className="el">{em.l}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  {step === 2 && (
                    <>
                      <div className="ci-title">에너지가<br/><em>얼마나 있어요?</em></div>
                      <div className="ci-sub">솔직하게 골라도 돼요. 낮아도 괜찮아요.</div>
                      <div className="energy-opts">
                        {ENERGIES.map(en => (
                          <div key={en.id} className={`energy-btn ${energy===en.id?"on":""}`}
                            onClick={() => { setEnergy(en.id); setTimeout(()=>setStep(3),300); }}>
                            <span className="energy-ico">{en.ico}</span>
                            <div className="energy-info">
                              <div className="energy-name">{en.name}</div>
                              <div className="energy-desc">{en.desc}</div>
                            </div>
                            <div className="energy-bar">
                              {[1,2,3].map(p => <div key={p} className={`e-pip ${p<=en.pips?"filled":""}`} />)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  {step === 3 && (
                    <>
                      <div className="ci-title">감정 상태를<br/><em>더 골라봐요</em></div>
                      <div className="ci-sub">여러 개 골라도 좋아요</div>
                      <div className="mood-grid">
                        {MOODS.map(m => (
                          <div key={m} className={`mood-btn ${mood===m?"on":""}`}
                            onClick={() => setMood(m === mood ? null : m)}>
                            {m}
                          </div>
                        ))}
                      </div>
                      <button className="cta" disabled={!mood} onClick={startAI}>
                        오늘 나한테 맞는 거 골라줘 🌿
                      </button>
                    </>
                  )}
                  {step === 4 && (
                    <div className="loading-wrap" style={{ position:"relative" }}>
                      <div className="loading-title">오늘의 <em>체크인 중</em></div>
                      <div className="door-scene">
                        <div className="door-frame">
                          <div className="door-light" />
                          <div className="door-glow" />
                          <div className="door-panel">
                            <div className="door-knob" />
                          </div>
                        </div>
                        <div className="key-icon key-turn">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--warm)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="7.5" cy="7.5" r="5.5"/>
                            <path d="M11.5 11.5L22 22"/>
                            <path d="M18 18l2-2"/>
                            <path d="M15 21l2-2"/>
                          </svg>
                        </div>
                      </div>
                      <div className="loading-txt">
                        오늘의 문을 열고 있어요...<br/>잠깐만 기다려주세요 🌿
                      </div>
                    </div>
                  )}
                  {step === 5 && (() => {
                    const recTask2 = aiResult ? tasks[aiResult.taskIndex - 1] : null;
                    const recF2 = recTask2 ? FOLDERS.find(f => f.id === recTask2.folder) : null;
                    if (tasks.length === 0) return (
                      <div style={{ textAlign:"center", padding:"40px 0" }}>
                        <div style={{ fontSize:36, marginBottom:12 }}>🌱</div>
                        <div className="ci-sub">아직 리스트가 비어있어요<br/>먼저 하고 싶은 것들을 적어봐요</div>
                        <button className="cta" style={{ marginTop:20 }} onClick={() => { resetCheckin(); setTab("list"); }}>리스트 작성하러 가기</button>
                      </div>
                    );
                    return (
                      <>
                        <div style={{ fontFamily:"'Noto Serif KR',serif", fontSize:20, fontWeight:400, marginBottom:20, lineHeight:1.5 }}>
                          오늘은 이것만<br/><span style={{color:"var(--warm)"}}>해봐요 🌿</span>
                        </div>
                        {recTask2 ? (
                          <div className="result-card">
                            <div className="result-task">{recTask2.text}</div>
                            <div className="result-folder">
                              <div className="result-folder-dot" style={{ background:recF2?.color }} />
                              {recF2?.label}
                            </div>
                            <div className="result-actions">
                              <button className="ra-done" onClick={() => {
                                const newDone = [...doneTasks, { ...recTask2, doneAt: new Date().toLocaleTimeString("ko-KR",{hour:"2-digit",minute:"2-digit"}), doneDate: new Date().toLocaleDateString("ko-KR",{month:"long",day:"numeric"}) }];
                                setDoneTasks(newDone);
                                const newTasks = tasks.filter(x => x.id !== recTask2.id);
                                setTasks(newTasks);
                                saveUserData(newTasks, newDone);
                                showToast("해냈어요 🌿");
                                resetCheckin(true);
                              }}>✓ 했어요!</button>
                              <button className="ra-later" onClick={() => { showToast("괜찮아요 🌿"); resetCheckin(true); }}>나중에 할게요</button>
                            </div>
                          </div>
                        ) : null}
                        {aiResult?.quote && (
                          <div className="quote-card">
                            <div className="quote-text">"{aiResult.quote}"</div>
                            <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:10 }}>
                              <div style={{ flex:1, height:"1px", background:"rgba(74,124,111,0.15)" }} />
                              <div style={{ fontSize:12, color:"var(--warm)", fontWeight:500 }}>{aiResult.quoteAuthor}</div>
                            </div>
                          </div>
                        )}
                        {aiResult?.coaching && <div className="coach-text">{aiResult.coaching}</div>}
                        <button onClick={() => resetCheckin(false)} style={{
                          width:"100%", marginTop:16, background:"none", border:"1.5px solid var(--border)",
                          borderRadius:16, padding:"13px", fontFamily:"'Gaegu'", fontSize:14,
                          color:"var(--muted)", cursor:"pointer"
                        }}>다시 해볼게요</button>
                        <button onClick={() => resetCheckin(true)} style={{
                          width:"100%", marginTop:10, background:"var(--warm)", border:"none",
                          borderRadius:16, padding:"14px", fontFamily:"'Gaegu'", fontSize:15,
                          color:"#fff", cursor:"pointer"
                        }}>🏠 홈으로 가기</button>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* ── 오늘의 나 TAB ── */}
            {tab === "today" && (
              <>
                <div className="ph">
                  <div className="ph-sub">{now.toLocaleDateString("ko-KR",{month:"long",day:"numeric",weekday:"long"})}</div>
                  <div className="ph-title">오늘의 <em>나</em> 🌿</div>
                </div>

                {/* 체크인 상태 */}
                <div style={{ margin:"16px 16px 0" }}>
                  {todayCheckin ? (
                    <div style={{ background:"var(--surface)", border:"1.5px solid var(--border)", borderRadius:20, padding:"18px 20px" }}>
                      <div style={{ fontSize:11, color:"var(--muted)", marginBottom:10, letterSpacing:"0.08em", textTransform:"uppercase" }}>오늘의 상태</div>
                      <div style={{ display:"flex", gap:12, flexWrap:"wrap", alignItems:"center" }}>
                        <span style={{ fontSize:28 }}>{todayCheckin.emoji}</span>
                        {todayCheckin.energy && <span style={{ background:"var(--bg2)", borderRadius:12, padding:"6px 14px", fontSize:14, color:"var(--text)" }}>
                          {todayCheckin.energy === "low" ? "🪫 낮음" : todayCheckin.energy === "mid" ? "⚡ 보통" : "🔥 높음"}
                        </span>}
                        {todayCheckin.mood && <span style={{ background:"var(--bg2)", borderRadius:12, padding:"6px 14px", fontSize:14, color:"var(--text)" }}>{todayCheckin.mood}</span>}
                      </div>
                      {todayCheckin.aiResult?.quote && (
                        <div style={{ marginTop:14, paddingTop:14, borderTop:"1px solid var(--border)" }}>
                          <div style={{ fontFamily:"'Noto Serif KR',serif", fontSize:14, color:"var(--text)", lineHeight:1.6, marginBottom:4 }}>"{todayCheckin.aiResult.quote}"</div>
                          <div style={{ fontSize:11, color:"var(--warm)" }}>{todayCheckin.aiResult.quoteAuthor}</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ background:"var(--surface)", border:"1.5px dashed var(--border)", borderRadius:20, padding:"24px 20px", textAlign:"center" }}>
                      <div style={{ fontFamily:"'Noto Serif KR',serif", fontSize:14, color:"var(--text)", lineHeight:1.7 }}>
                        아직 체크인을 안 했어요.<br/>
                        홈에서 체크인을 하면<br/>
                        오늘의 상태를 여기에서 보여드릴게요 🌿
                      </div>
                    </div>
                  )}
                </div>

                {/* 주간 감정 변화 그래프 */}
                {(
                  <div className="week-graph">
                    <div className="week-graph-title" style={{ position:"relative" }}>
                      이번 주 감정 흐름
                      <button onClick={() => setShowGraphInfo(!showGraphInfo)} style={{
                        background:"none", border:"none", cursor:"pointer", padding:"2px 6px",
                        fontSize:14, color:"var(--muted)", borderRadius:8, transition:"all 0.15s",
                        marginLeft:4,
                      }}>ⓘ</button>
                    </div>
                    {showGraphInfo && (
                      <div style={{
                        background:"var(--bg2)", borderRadius:14, padding:"14px 16px",
                        fontSize:12, color:"var(--text)", lineHeight:1.7, marginBottom:16,
                        animation:"up 0.2s ease both",
                      }}>
                        <strong style={{ color:"var(--warm)" }}>바 높이</strong> = 에너지 레벨이에요<br/>
                        🪫 낮음 → 짧은 바 · ⚡ 보통 → 중간 · 🔥 높음 → 긴 바<br/>
                        <span style={{ color:"var(--muted)", fontSize:11 }}>높다고 좋은 게 아니에요. 오늘의 상태를 기록할 뿐이에요 🌿</span>
                      </div>
                    )}
                    <div className="week-bars">
                      {(() => {
                        const days = ["일","월","화","수","목","금","토"];
                        const todayIdx = now.getDay();
                        const energyScore = { "low":1, "mid":2, "high":3 };
                        return days.map((d, i) => {
                          const record = checkinHistory.find(r => {
                            const dayMatch = r.date?.match(/\((.)\)/);
                            return dayMatch && dayMatch[1] === d;
                          });
                          const score = record ? (energyScore[record.energy] || 2) : 0;
                          const height = score > 0 ? `${(score / 3) * 100}%` : "0%";
                          const isToday = i === todayIdx;
                          return (
                            <div className="week-bar-col" key={d}>
                              {record && <div className="week-bar-emoji">{record.emoji}</div>}
                              {!record && <div style={{height:16}} />}
                              <div className="week-bar-track">
                                <div className="week-bar-fill" style={{
                                  height, background: score > 0 ? "var(--warm)" : "transparent",
                                  opacity: isToday ? 1 : 0.55,
                                }} />
                              </div>
                              <div className={isToday ? "week-bar-today" : "week-bar-day"}>
                                {isToday ? "오늘" : d}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                    <div className="week-summary">
                      <div className="week-stat">
                        <div className="week-stat-val">{checkinHistory.length}일</div>
                        <div className="week-stat-lbl">체크인</div>
                      </div>
                      <div className="week-stat">
                        <div className="week-stat-val">
                          {checkinHistory.length > 0 ? checkinHistory[0].emoji : "—"}
                        </div>
                        <div className="week-stat-lbl">최근 기분</div>
                      </div>
                      <div className="week-stat">
                        <div className="week-stat-val">
                          {checkinHistory.length}일
                        </div>
                        <div className="week-stat-lbl">연속</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 오늘 한 것들 */}
                <div className="section-lbl">오늘 한 것들</div>
                {doneTasks.length === 0 ? (
                  <div style={{ margin:"0 16px", background:"var(--surface)", border:"1.5px dashed var(--border)", borderRadius:18, padding:"24px 20px", textAlign:"center" }}>
                    <div style={{ fontSize:28, marginBottom:10 }}>🌱</div>
                    <div style={{ fontSize:13, color:"var(--muted)", lineHeight:1.7 }}>
                      아직 비어있어요<br/>
                      체크인에서 하나 해보면 여기에 쌓여요
                    </div>
                  </div>
                ) : doneTasks.map((t, i) => {
                  const f = FOLDERS.find(x => x.id === t.folder);
                  return (
                    <div key={i} style={{ margin:"0 16px 8px", background:"var(--surface)", border:"1.5px solid var(--border)", borderRadius:16, padding:"14px 16px", display:"flex", alignItems:"center", gap:10, animation:"up 0.2s ease both" }}>
                      <span style={{ color:"var(--sage)", fontSize:16 }}>✓</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:14, color:"var(--text)", textDecoration:"line-through", opacity:0.6 }}>{t.text}</div>
                        <div style={{ fontSize:11, color:"var(--muted)", marginTop:2 }}>{t.doneAt} · {f?.icon} {f?.label}</div>
                      </div>
                    </div>
                  );
                })}

                {/* 모아보기 버튼 */}
                <div style={{ margin:"8px 16px 28px" }}>
                  <button onClick={() => setShowCheckinHistory(true)} style={{
                    width:"100%", background:"var(--surface)", border:"1.5px solid var(--border)",
                    borderRadius:16, padding:"14px 10px", fontFamily:"'Gaegu'", fontSize:13,
                    color:"var(--muted)", cursor:"pointer", lineHeight:1.5, transition:"all 0.15s",
                    display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                  }}>
                    <span style={{ fontSize:20 }}>🕐</span>
                    오늘의 나 모아보기
                  </button>
                </div>
              </>
            )}

          </div>

          {/* ── 삭제 확인 모달 ── */}
          {confirmModal && (
            <div className="modal-overlay" onClick={() => setConfirmModal(null)}>
              <div className="modal-sheet" onClick={e => e.stopPropagation()}>
                <div className="modal-emoji">🤔</div>
                <div className="modal-title">어떻게 할까요?</div>
                <div className="modal-task-preview">"{confirmModal.task.text}"</div>
                <div className="modal-btns">
                  <button className="modal-ok-btn" onClick={() => {
                    const task = confirmModal.task;
                    const newDone = [...doneTasks, { ...task, doneAt: new Date().toLocaleTimeString("ko-KR",{hour:"2-digit",minute:"2-digit"}), doneDate: new Date().toLocaleDateString("ko-KR",{month:"long",day:"numeric"}) }];
                    setDoneTasks(newDone);
                    const newTasks = tasks.filter(x => x.id !== task.id);
                    setTasks(newTasks);
                    saveUserData(newTasks, newDone);
                    setConfirmModal(null);
                    showToast("해냈어요 🌿");
                  }}>다 했어요! ✓</button>
                  <button className="modal-del-btn" onClick={confirmDelete}>삭제할게요</button>
                  <button className="modal-cancel-btn" onClick={() => { setConfirmModal(null); setTimeout(() => setKeepModal(true), 200); }}>아니요, 남겨둘게요</button>
                </div>
              </div>
            </div>
          )}

          {/* ── 삭제 후 모달 ── */}
          {afterModal && (
            <div className="modal-overlay" onClick={() => setAfterModal(false)}>
              <div className="modal-sheet" onClick={e => e.stopPropagation()}>
                <div className="modal-emoji">🌿</div>
                <div className="modal-title">지워졌어요</div>
                <div className="modal-sub">
                  지금 당장 못 해도 괜찮아요.<br/>
                  여유가 될 때 다시 떠오르면<br/>
                  그때 다시 적으면 되니까요 😊
                </div>
                <div className="modal-btns">
                  <button className="modal-ok-btn" onClick={() => setAfterModal(false)}>알겠어요 👍</button>
                </div>
              </div>
            </div>
          )}

          {/* ── 남겨두기 모달 ── */}
          {keepModal && (
            <div className="modal-overlay" onClick={() => setKeepModal(false)}>
              <div className="modal-sheet" onClick={e => e.stopPropagation()}>
                <div className="modal-emoji">💙</div>
                <div className="modal-title">잘 했어요</div>
                <div className="modal-sub">
                  포기하지 않고 남겨뒀다는 것,<br/>
                  그 자체가 이미 대단한 거예요.<br/>
                  하고 싶은 마음이 있다는 거잖아요 🌿
                </div>
                <div className="modal-btns">
                  <button className="modal-ok-btn" onClick={() => setKeepModal(false)}>고마워요 😊</button>
                </div>
              </div>
            </div>
          )}

          {/* ── 나의 정보 바텀시트 ── */}
          {showProfile && (
            <div className="modal-overlay" onClick={() => setShowProfile(false)}>
              <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ paddingBottom:48 }}>
                {/* 프로필 아바타 */}
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:24 }}>
                  {currentUser && currentUser.photoURL ? (
                    <img src={currentUser.photoURL} alt="" style={{
                      width:56, height:56, borderRadius:"50%", marginBottom:12, objectFit:"cover",
                      border:"2px solid var(--pale)",
                    }} />
                  ) : (
                    <div style={{
                      width:56, height:56, borderRadius:"50%", background:"var(--warm)",
                      display:"flex", alignItems:"center", justifyContent:"center", marginBottom:12,
                    }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                  )}
                  <div style={{ fontFamily:"'Noto Serif KR',serif", fontSize:18, fontWeight:400, color:"var(--text)", marginBottom:4 }}>
                    {(currentUser && currentUser.displayName) || "비로그인 사용자"}
                  </div>
                  <div style={{ fontSize:12, color:"var(--muted)" }}>
                    {(currentUser && currentUser.email) || "로그인하면 다른 기기에서도 사용할 수 있어요"}
                  </div>
                </div>

                {/* 메뉴 항목 */}
                <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                  {currentUser ? (
                    /* 로그인 상태 — 로그아웃 버튼 */
                    <button onClick={handleLogout} style={{
                      width:"100%", background:"var(--surface)", border:"1.5px solid var(--border)",
                      borderRadius:14, padding:"15px 18px", display:"flex", alignItems:"center", gap:12,
                      cursor:"pointer", transition:"all 0.15s", fontFamily:"'Gaegu'", fontSize:14, color:"var(--text)",
                      textAlign:"left",
                    }}>
                      <span style={{ fontSize:18 }}>👋</span>
                      <div style={{ flex:1 }}>
                        <div>로그아웃</div>
                        <div style={{ fontSize:11, color:"var(--muted)", marginTop:2 }}>기록은 계정에 저장되어 있어요</div>
                      </div>
                    </button>
                  ) : (
                    /* 비로그인 상태 — 구글 연결 버튼 */
                    <button onClick={handleGoogleLogin} style={{
                      width:"100%", background:"var(--surface)", border:"1.5px solid var(--border)",
                      borderRadius:14, padding:"15px 18px", display:"flex", alignItems:"center", gap:12,
                      cursor:"pointer", transition:"all 0.15s", fontFamily:"'Gaegu'", fontSize:14, color:"var(--text)",
                      textAlign:"left",
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      <div style={{ flex:1 }}>
                        <div>구글 계정 연결하기</div>
                        <div style={{ fontSize:11, color:"var(--muted)", marginTop:2 }}>다른 기기에서도 기록을 이어갈 수 있어요</div>
                      </div>
                      <span style={{ color:"var(--pale)", fontSize:14 }}>→</span>
                    </button>
                  )}

                  {/* 베타 피드백 */}
                  <button onClick={() => {
                    const FEEDBACK_URL = "GOOGLE_FORM_URL_HERE";
                    if (FEEDBACK_URL === "GOOGLE_FORM_URL_HERE") {
                      showToast("피드백 기능은 준비 중이에요 🌿");
                    } else {
                      window.open(FEEDBACK_URL, "_blank");
                    }
                  }} style={{
                    width:"100%", background:"var(--surface)", border:"1.5px solid var(--border)",
                    borderRadius:14, padding:"15px 18px", display:"flex", alignItems:"center", gap:12,
                    cursor:"pointer", transition:"all 0.15s", fontFamily:"'Gaegu'", fontSize:14, color:"var(--text)",
                    textAlign:"left", marginTop:6,
                  }}>
                    <span style={{ fontSize:18 }}>💬</span>
                    <div style={{ flex:1 }}>
                      <div>베타 피드백 보내기</div>
                      <div style={{ fontSize:11, color:"var(--muted)", marginTop:2 }}>사용하면서 느낀 점을 알려주세요</div>
                    </div>
                    <span style={{ color:"var(--pale)", fontSize:14 }}>→</span>
                  </button>
                </div>

                {/* 하단 정보 */}
                <div style={{ marginTop:24, paddingTop:16, borderTop:"1px solid var(--border)", textAlign:"center" }}>
                  <div style={{ fontSize:14, color:"var(--muted)", lineHeight:1.8 }}>
                    체크인오늘 · 베타 v1.0
                  </div>
                </div>

                <button onClick={() => setShowProfile(false)} style={{
                  width:"100%", marginTop:16, background:"var(--bg2)", border:"1.5px solid var(--border)",
                  borderRadius:16, padding:"14px", fontFamily:"'Gaegu'", fontSize:14,
                  color:"var(--muted)", cursor:"pointer",
                }}>닫기</button>
              </div>
            </div>
          )}

          {/* ── 체크인 히스토리 페이지 ── */}
          {showCheckinHistory && (
            <div className="detail-page">
              <div className="detail-header">
                <button className="detail-back" onClick={() => setShowCheckinHistory(false)}>← 뒤로</button>
                <span style={{ fontFamily:"'Noto Serif KR',serif", fontSize:16, color:"var(--muted)" }}>오늘의 나 모아보기</span>
              </div>
              <div className="detail-body">
                {checkinHistory.length === 0 ? (
                  <div className="empty">
                    <div className="empty-ico">🌱</div>
                    <div className="empty-txt">아직 기록이 없어요<br/>체크인을 하면 여기에 쌓여요</div>
                  </div>
                ) : checkinHistory.map((r, i) => (
                  <div key={i} style={{
                    display:"flex", alignItems:"center", justifyContent:"space-between",
                    padding:"14px 0", borderBottom:"1px solid var(--border)",
                    animation:"up 0.2s ease both", animationDelay:`${i*0.04}s`
                  }}>
                    <div style={{ fontSize:13, color:"var(--muted)" }}>
                      {r.date} · {r.time}
                    </div>
                    <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                      <span style={{ fontSize:18 }}>{r.emoji}</span>
                      {r.energy && (
                        <span style={{ background:"var(--bg2)", borderRadius:10, padding:"3px 10px", fontSize:11, color:"var(--text)" }}>
                          {r.energy === "low" ? "🪫" : r.energy === "mid" ? "⚡" : "🔥"}
                        </span>
                      )}
                      {r.mood && (
                        <span style={{ background:"var(--bg2)", borderRadius:10, padding:"3px 10px", fontSize:11, color:"var(--text)" }}>
                          {r.mood.split(" ")[1] || r.mood}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nav Bar */}
          <div className="nav">
            {[
              { id:"home",    lbl:"홈" },
              { id:"list",    lbl:"내 리스트" },
              { id:"today",   lbl:"오늘의 나" },
            ].map(n => {
              const isOn = tab === n.id;
              const color = isOn ? "var(--warm)" : "var(--muted)";
              return (
                <button key={n.id} className={`nav-btn ${isOn?"on":""}`}
                  onClick={() => { setTab(n.id); }}>
                  {n.id === "home" && (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 12L12 4l9 8"/>
                      <path d="M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9"/>
                    </svg>
                  )}
                  {n.id === "list" && (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="4" y="4" width="16" height="16" rx="3"/>
                      <line x1="8" y1="9" x2="16" y2="9"/>
                      <line x1="8" y1="13" x2="16" y2="13"/>
                      <line x1="8" y1="17" x2="13" y2="17"/>
                    </svg>
                  )}
                  {n.id === "today" && (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9"/>
                      <path d="M12 7v5l3 3"/>
                    </svg>
                  )}
                  <span className="lbl">{n.lbl}</span>
                </button>
              );
            })}
          </div>

          {/* ── LANDING + ONBOARDING ── */}
          {showLanding && (
            <div className={`landing ${landingExit ? "exit" : ""}`}>
              {onboardPage > 0 && (
                <button className="landing-skip" onClick={dismissLanding}>
                  건너뛰기
                </button>
              )}
              <div className="landing-inner ob-fade-enter" key={onboardPage}>
                <div className="landing-emoji">{ONBOARD_PAGES[onboardPage].emoji}</div>
                {onboardPage > 0 ? (
                  <div className="landing-step-badge">{ONBOARD_PAGES[onboardPage].greeting}</div>
                ) : (
                  <div className="landing-greeting">{ONBOARD_PAGES[onboardPage].greeting}</div>
                )}
                <div className="landing-title">
                  {ONBOARD_PAGES[onboardPage].title}
                </div>
                <div className="landing-sub">
                  {ONBOARD_PAGES[onboardPage].sub.split("\n").map((line, i) => (
                    <span key={i}>{line}{i === 0 && <br/>}</span>
                  ))}
                </div>
                {onboardPage === ONBOARD_PAGES.length - 1 ? (
                  <div style={{ display:"flex", flexDirection:"column", gap:12, width:"100%" }}>
                    <button className="landing-cta" onClick={() => {
                      handleGoogleLogin();
                      completeOnboarding();
                    }} style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, fontSize:15, padding:"16px 28px" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      구글 아이디로 로그인 시작
                    </button>
                    <button onClick={() => setNoLoginConfirm(true)} style={{
                      width:"100%", background:"none", border:"1.5px solid var(--border)",
                      borderRadius:22, padding:"16px 28px", color:"var(--muted)", fontFamily:"'Gaegu'",
                      fontSize:16, cursor:"pointer", transition:"all 0.2s",
                    }}>
                      로그인 없이 시작
                    </button>

                    {/* 로그인 없이 시작 확인 */}
                    {noLoginConfirm && (
                      <div style={{
                        marginTop:16, background:"var(--surface)", border:"1.5px solid var(--border)",
                        borderRadius:18, padding:"20px", textAlign:"center",
                        animation:"up 0.2s ease both",
                      }}>
                        <div style={{
                          fontFamily:"'Noto Serif KR',serif", fontSize:14, color:"var(--text)",
                          lineHeight:1.7, marginBottom:16,
                        }}>
                          로그인 없이 시작하면<br/>다른 기기에서는<br/>체크인 기록을 같이 볼 수 없어요.
                        </div>
                        <button onClick={completeOnboarding} style={{
                          width:"100%", background:"var(--warm)", border:"none", borderRadius:16,
                          padding:"14px", color:"#fff", fontFamily:"'Gaegu'", fontSize:15,
                          cursor:"pointer", transition:"opacity 0.15s",
                        }}>괜찮아요</button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button className="landing-cta" onClick={nextOnboard}>
                    {ONBOARD_PAGES[onboardPage].cta}
                  </button>
                )}
              </div>
              <div className="landing-dots">
                {ONBOARD_PAGES.map((_, i) => (
                  <div key={i} className={`landing-dot ${i === onboardPage ? "on" : ""}`} />
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
