<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AtoC · IELTS from Zero — Dashboard</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
/* ============================================================
   DESIGN TOKENS
   ============================================================ */
:root {
  --bg-base:        #0A0F1E;
  --bg-sidebar:     #0D1321;
  --bg-card:        #141C33;
  --bg-card-hover:  #192040;
  --border:         rgba(255,255,255,0.05);
  --border-subtle:  rgba(255,255,255,0.03);
  --accent-blue:    #3B82F6;
  --accent-blue-dim:#1D4ED8;
  --accent-gold:    #F59E0B;
  --accent-gold-dim:#B45309;
  --accent-green:   #10B981;
  --accent-red:     #EF4444;
  --text-primary:   #FFFFFF;
  --text-secondary: #94A3B8;
  --text-muted:     #4B5563;
  --font-heading:   'Sora', sans-serif;
  --font-body:      'DM Sans', sans-serif;
  --font-mono:      'JetBrains Mono', monospace;
  --sidebar-w:      240px;
  --radius-sm:      8px;
  --radius-md:      12px;
  --radius-lg:      16px;
  --radius-xl:      20px;
  --shadow-card:    0 4px 20px rgba(0,0,0,0.4);
  --shadow-glow:    0 0 20px rgba(59,130,246,0.15);
  --transition:     all 0.2s cubic-bezier(0.4,0,0.2,1);
}

/* ============================================================
   RESET & BASE
   ============================================================ */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  font-family: var(--font-body);
  background-color: var(--bg-base);
  color: var(--text-primary);
  min-height: 100vh;
  display: flex;
  overflow: hidden;
  background-image:
    linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px);
  background-size: 40px 40px;
}

/* ============================================================
   SCROLLBAR
   ============================================================ */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.3); border-radius: 2px; }

/* ============================================================
   SIDEBAR
   ============================================================ */
aside.sidebar {
  width: var(--sidebar-w);
  min-width: var(--sidebar-w);
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow-y: auto;
  position: fixed;
  left: 0; top: 0;
  z-index: 100;
  padding: 24px 0 20px;
}

/* Sidebar Header */
.sidebar-header {
  padding: 0 20px 20px;
  border-bottom: 1px solid var(--border);
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}
.brand-icon {
  width: 34px; height: 34px;
  background: linear-gradient(135deg, var(--accent-blue), #6366F1);
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-heading);
  font-weight: 800; font-size: 14px;
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 0 16px rgba(59,130,246,0.4);
}
.brand-text { font-family: var(--font-heading); font-size: 16px; font-weight: 700; color: var(--text-primary); }
.brand-sub { font-size: 10px; color: var(--text-secondary); letter-spacing: 0.08em; }

/* Profile Unit */
.profile-unit {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(59,130,246,0.06);
  border: 1px solid rgba(59,130,246,0.12);
  border-radius: var(--radius-md);
}
.avatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3B82F6, #8B5CF6);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-heading);
  font-weight: 700; font-size: 14px;
  color: #fff;
  flex-shrink: 0;
  border: 2px solid rgba(59,130,246,0.4);
}
.profile-info { flex: 1; min-width: 0; }
.profile-name { font-size: 12px; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.band-badge {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 9px; font-weight: 600;
  background: rgba(245,158,11,0.15);
  color: var(--accent-gold);
  border: 1px solid rgba(245,158,11,0.3);
  border-radius: 20px;
  padding: 2px 7px;
  margin-top: 2px;
  letter-spacing: 0.04em;
}

/* Progress Ring */
.ring-section {
  padding: 20px;
  border-bottom: 1px solid var(--border);
  text-align: center;
}
.ring-label { font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 14px; }
.ring-wrapper { position: relative; width: 100px; height: 100px; margin: 0 auto; }
.ring-wrapper svg { transform: rotate(-90deg); }
.ring-bg { fill: none; stroke: rgba(255,255,255,0.05); stroke-width: 8; }
.ring-fill {
  fill: none;
  stroke: url(#ringGrad);
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: 251.2;
  stroke-dashoffset: 251.2;
  transition: stroke-dashoffset 1.2s ease-out;
}
.ring-center {
  position: absolute;
  inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.ring-target { font-family: var(--font-mono); font-size: 9px; color: var(--text-secondary); }
.ring-score { font-family: var(--font-heading); font-size: 22px; font-weight: 800; color: var(--text-primary); line-height: 1; }
.ring-sub { font-size: 8px; color: var(--text-secondary); margin-top: 1px; }

/* Nav */
nav.sidebar-nav { padding: 12px 0; flex: 1; }
.nav-section-label { font-size: 9px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-muted); padding: 6px 20px 6px; }
.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 20px;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  transition: var(--transition);
  border-radius: 0;
  text-decoration: none;
  user-select: none;
}
.nav-item::before {
  content: '';
  position: absolute;
  left: 0; top: 50%;
  transform: translateY(-50%) scaleY(0);
  width: 3px; height: 60%;
  background: var(--accent-blue);
  border-radius: 0 2px 2px 0;
  transition: transform 0.2s ease;
}
.nav-item:hover { color: var(--text-primary); background: rgba(59,130,246,0.05); }
.nav-item.active { color: var(--text-primary); background: rgba(59,130,246,0.08); }
.nav-item.active::before { transform: translateY(-50%) scaleY(1); }
.nav-icon { width: 16px; height: 16px; flex-shrink: 0; opacity: 0.7; }
.nav-item.active .nav-icon, .nav-item:hover .nav-icon { opacity: 1; }
.nav-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--accent-blue); margin-left: auto; flex-shrink: 0; }
.nav-dot.gold { background: var(--accent-gold); }

/* Sidebar Bottom */
.sidebar-bottom {
  padding: 16px 20px 0;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.exam-countdown {
  background: linear-gradient(135deg, rgba(59,130,246,0.1), rgba(99,102,241,0.08));
  border: 1px solid rgba(59,130,246,0.2);
  border-radius: var(--radius-md);
  padding: 12px;
  text-align: center;
}
.exam-label { font-size: 9px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 4px; }
.exam-days { font-family: var(--font-mono); font-size: 28px; font-weight: 700; color: var(--accent-blue); line-height: 1; }
.exam-unit { font-size: 10px; color: var(--text-secondary); }

.streak-widget {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(245,158,11,0.07);
  border: 1px solid rgba(245,158,11,0.15);
  border-radius: var(--radius-sm);
  padding: 8px 12px;
}
.flame-icon { font-size: 18px; animation: flicker 1.5s ease-in-out infinite; }
@keyframes flicker {
  0%,100% { transform: scale(1) rotate(-2deg); filter: brightness(1); }
  25% { transform: scale(1.08) rotate(2deg); filter: brightness(1.3); }
  50% { transform: scale(0.95) rotate(-1deg); filter: brightness(0.9); }
  75% { transform: scale(1.05) rotate(3deg); filter: brightness(1.2); }
}
.streak-text { font-family: var(--font-mono); font-size: 13px; font-weight: 700; color: var(--accent-gold); }
.streak-label { font-size: 10px; color: var(--text-secondary); }

/* ============================================================
   MAIN CONTENT
   ============================================================ */
main.dashboard {
  margin-left: var(--sidebar-w);
  flex: 1;
  height: 100vh;
  overflow-y: auto;
  padding: 32px 40px;
}

/* ============================================================
   ENTRANCE ANIMATIONS
   ============================================================ */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.anim { opacity: 0; animation: fadeUp 0.5s ease-out forwards; }
.d1 { animation-delay: 0ms; }
.d2 { animation-delay: 80ms; }
.d3 { animation-delay: 160ms; }
.d4 { animation-delay: 240ms; }
.d5 { animation-delay: 320ms; }
.d6 { animation-delay: 400ms; }
.d7 { animation-delay: 480ms; }
.d8 { animation-delay: 560ms; }

/* ============================================================
   1. HERO BANNER
   ============================================================ */
.hero-section {
  margin-bottom: 28px;
}
.hero-inner {
  background: linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(99,102,241,0.08) 50%, rgba(20,28,51,0) 100%);
  border: 1px solid rgba(59,130,246,0.15);
  border-radius: var(--radius-xl);
  padding: 28px 32px;
  position: relative;
  overflow: hidden;
}
.hero-inner::before {
  content: '';
  position: absolute;
  right: -60px; top: -60px;
  width: 220px; height: 220px;
  background: radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%);
  pointer-events: none;
}
.hero-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
.hero-greeting { font-family: var(--font-heading); font-size: 26px; font-weight: 800; color: var(--text-primary); line-height: 1.2; }
.hero-date { font-size: 12px; color: var(--text-secondary); font-weight: 500; }
.daily-goal-card {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 10px 14px;
  font-size: 12px;
  color: var(--text-secondary);
}
.goal-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent-blue); box-shadow: 0 0 6px var(--accent-blue); }
.hero-progress-wrap { }
.hero-progress-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.hero-progress-label { font-size: 12px; color: var(--text-secondary); }
.hero-progress-pct { font-family: var(--font-mono); font-size: 13px; font-weight: 600; color: var(--accent-blue); }
.progress-track {
  width: 100%;
  height: 8px;
  background: rgba(255,255,255,0.06);
  border-radius: 100px;
  overflow: hidden;
  position: relative;
}
.progress-fill {
  height: 100%;
  border-radius: 100px;
  background: linear-gradient(90deg, var(--accent-blue), #818CF8);
  box-shadow: 0 0 12px rgba(59,130,246,0.5);
  width: 0%;
  transition: width 1.2s ease-out;
  position: relative;
}
.progress-fill::after {
  content: '';
  position: absolute;
  right: 0; top: 0;
  width: 20px; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3));
  border-radius: 100px;
  animation: shimmer 2s infinite;
}
@keyframes shimmer {
  0% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 0; }
}
.hero-micro { margin-top: 8px; font-size: 11px; color: var(--text-secondary); }
.hero-micro span { color: var(--accent-gold); font-weight: 600; }

/* ============================================================
   2. SCORE TRACKER
   ============================================================ */
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.section-title { font-family: var(--font-heading); font-size: 16px; font-weight: 700; color: var(--text-primary); }
.section-action { font-size: 11px; color: var(--accent-blue); cursor: pointer; font-weight: 500; }
.section-action:hover { text-decoration: underline; }

.scores-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 28px; }

.score-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 18px 16px;
  cursor: pointer;
  transition: var(--transition);
  position: relative;
  overflow: hidden;
}
.score-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  opacity: 0;
  transition: opacity 0.2s;
}
.score-card.listening::before { background: linear-gradient(90deg, #3B82F6, #6366F1); }
.score-card.reading::before  { background: linear-gradient(90deg, #10B981, #06B6D4); }
.score-card.writing::before  { background: linear-gradient(90deg, #F59E0B, #EF4444); }
.score-card.speaking::before { background: linear-gradient(90deg, #8B5CF6, #EC4899); }
.score-card:hover { transform: translateY(-3px); box-shadow: 0 10px 25px -5px rgba(59,130,246,0.2); background: var(--bg-card-hover); }
.score-card:hover::before { opacity: 1; }

.score-skill { font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 8px; }
.score-row { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 10px; }
.score-value { font-family: var(--font-heading); font-size: 34px; font-weight: 800; color: var(--text-primary); line-height: 1; }
.score-badge {
  display: flex; align-items: center; gap: 3px;
  background: rgba(245,158,11,0.12);
  border: 1px solid rgba(245,158,11,0.25);
  border-radius: 20px;
  padding: 3px 8px;
  font-family: var(--font-mono);
  font-size: 10px; font-weight: 600;
  color: var(--accent-gold);
  margin-bottom: 4px;
}
.sparkline-wrap { height: 32px; margin-bottom: 12px; }
.sparkline-wrap svg { width: 100%; height: 100%; overflow: visible; }

.btn-practice {
  width: 100%;
  padding: 7px;
  background: rgba(59,130,246,0.08);
  border: 1px solid rgba(59,130,246,0.2);
  border-radius: var(--radius-sm);
  color: var(--accent-blue);
  font-family: var(--font-body);
  font-size: 11px; font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  letter-spacing: 0.02em;
}
.btn-practice:hover {
  background: rgba(59,130,246,0.16);
  box-shadow: 0 0 14px rgba(59,130,246,0.25);
}

/* ============================================================
   3. LEARNING PATH
   ============================================================ */
.learning-path-section { margin-bottom: 28px; }
.roadmap-container {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 28px 32px;
  position: relative;
  overflow: hidden;
}
.roadmap-container::before {
  content: '';
  position: absolute;
  bottom: -40px; right: -40px;
  width: 200px; height: 200px;
  background: radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%);
  pointer-events: none;
}

.roadmap-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  position: relative;
}

/* SVG connector lines */
.roadmap-svg {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none;
  z-index: 0;
}

.roadmap-row {
  display: contents;
}

.node-wrap {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px 20px;
}

/* Node circles */
.node {
  width: 52px; height: 52px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: var(--transition);
  position: relative;
  flex-shrink: 0;
}
.node.completed {
  background: linear-gradient(135deg, var(--accent-blue), #6366F1);
  box-shadow: 0 0 16px rgba(59,130,246,0.35);
}
.node.completed:hover { transform: scale(1.08); box-shadow: 0 0 24px rgba(59,130,246,0.55); }
.node.current {
  background: linear-gradient(135deg, #F59E0B, #EF4444);
  box-shadow: 0 0 20px rgba(245,158,11,0.4);
}
.node.current::after {
  content: '';
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  border: 2px solid rgba(245,158,11,0.4);
  animation: pulse-ring 2s cubic-bezier(0.4,0,0.6,1) infinite;
}
@keyframes pulse-ring {
  0%   { transform: scale(0.9); opacity: 1; }
  50%  { transform: scale(1.15); opacity: 0.3; }
  100% { transform: scale(0.9); opacity: 1; }
}
.node.locked {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  opacity: 0.45;
  cursor: not-allowed;
}
.node-icon { width: 20px; height: 20px; color: #fff; }
.node-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-secondary);
  text-align: center;
  margin-top: 8px;
  line-height: 1.3;
  max-width: 80px;
}
.node-label.active-label { color: var(--text-primary); }

/* Expansion panel */
.node-panel {
  display: none;
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  width: 220px;
  background: #1A2444;
  border: 1px solid rgba(59,130,246,0.25);
  border-radius: var(--radius-md);
  padding: 14px;
  z-index: 200;
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
}
.node-panel.open { display: block; animation: fadeUp 0.2s ease-out; }
.panel-title { font-size: 12px; font-weight: 700; color: var(--text-primary); margin-bottom: 10px; }
.panel-lesson {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid var(--border-subtle);
  font-size: 11px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition);
}
.panel-lesson:last-child { border: none; }
.panel-lesson:hover { color: var(--text-primary); }
.lesson-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.lesson-dot.done { background: var(--accent-blue); }
.lesson-dot.next { background: var(--accent-gold); }
.lesson-dot.lock { background: var(--text-muted); }

/* ============================================================
   4. PERFORMANCE STATS
   ============================================================ */
.stats-row { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; margin-bottom: 28px; }
.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px;
  transition: var(--transition);
}
.stat-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-glow); }
.stat-icon-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.stat-icon-wrap {
  width: 36px; height: 36px;
  border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
}
.stat-icon-wrap.blue { background: rgba(59,130,246,0.12); }
.stat-icon-wrap.gold { background: rgba(245,158,11,0.12); }
.stat-icon-wrap.green { background: rgba(16,185,129,0.12); }
.stat-tag { font-size: 10px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-muted); }
.stat-value { font-family: var(--font-mono); font-size: 28px; font-weight: 700; color: var(--text-primary); line-height: 1; margin-bottom: 4px; }
.stat-sub { font-size: 11px; color: var(--text-secondary); }
.mini-progress-track { height: 4px; background: rgba(255,255,255,0.06); border-radius: 100px; overflow: hidden; margin-top: 10px; }
.mini-progress-fill { height: 100%; border-radius: 100px; background: linear-gradient(90deg, var(--accent-green), #06B6D4); }

/* ============================================================
   5. ACTIVITY FEED + CTA
   ============================================================ */
.bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 28px; }
.activity-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px;
}
.timeline { list-style: none; }
.timeline-item {
  display: flex;
  gap: 12px;
  padding-bottom: 16px;
  position: relative;
}
.timeline-item:last-child { padding-bottom: 0; }
.timeline-item::before {
  content: '';
  position: absolute;
  left: 5px; top: 18px;
  width: 1px;
  height: calc(100% - 8px);
  background: var(--border);
}
.timeline-item:last-child::before { display: none; }
.tl-dot {
  width: 12px; height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 3px;
  position: relative;
  z-index: 1;
}
.tl-dot.blue { background: var(--accent-blue); box-shadow: 0 0 8px rgba(59,130,246,0.5); }
.tl-dot.gold { background: var(--accent-gold); box-shadow: 0 0 8px rgba(245,158,11,0.5); }
.tl-dot.green { background: var(--accent-green); box-shadow: 0 0 8px rgba(16,185,129,0.5); }
.tl-dot.muted { background: var(--text-muted); }
.tl-content { flex: 1; }
.tl-title { font-size: 12px; font-weight: 600; color: var(--text-primary); margin-bottom: 2px; }
.tl-meta { font-size: 11px; color: var(--text-secondary); }
.tl-feedback {
  margin-top: 6px;
  background: rgba(16,185,129,0.08);
  border: 1px solid rgba(16,185,129,0.15);
  border-radius: 6px;
  padding: 6px 8px;
  font-size: 10px;
  color: var(--accent-green);
}

.resume-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.resume-title { font-family: var(--font-heading); font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px; }
.resume-lesson { font-size: 12px; color: var(--text-secondary); margin-bottom: 4px; }
.resume-progress-info { display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted); margin-bottom: 8px; }
.resume-track { height: 4px; background: rgba(255,255,255,0.06); border-radius: 100px; overflow: hidden; margin-bottom: 20px; }
.resume-fill { height: 100%; border-radius: 100px; background: linear-gradient(90deg, var(--accent-gold), var(--accent-blue)); width: 60%; }

.btn-resume {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, var(--accent-blue), #6366F1);
  border: none;
  border-radius: var(--radius-md);
  color: #fff;
  font-family: var(--font-body);
  font-size: 13px; font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  position: relative;
  overflow: hidden;
  letter-spacing: 0.02em;
}
.btn-resume::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
  opacity: 0;
  transition: opacity 0.2s;
}
.btn-resume:hover::before { opacity: 1; }
.btn-resume:hover { transform: translateY(-1px); box-shadow: 0 8px 25px rgba(59,130,246,0.4); }
.resume-stats { display: flex; gap: 12px; margin-bottom: 16px; }
.rstat {
  flex: 1;
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 10px;
  text-align: center;
}
.rstat-val { font-family: var(--font-mono); font-size: 16px; font-weight: 700; color: var(--text-primary); }
.rstat-key { font-size: 9px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; margin-top: 2px; }

/* ============================================================
   6. VOCAB WIDGET
   ============================================================ */
.vocab-mock-section { margin-bottom: 28px; display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.vocab-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px;
}
.vocab-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.band-tag {
  background: rgba(245,158,11,0.1);
  border: 1px solid rgba(245,158,11,0.2);
  color: var(--accent-gold);
  font-size: 10px; font-weight: 600;
  letter-spacing: 0.06em;
  padding: 3px 8px;
  border-radius: 20px;
  font-family: var(--font-mono);
}

/* 3D Flip Card */
.flip-card-wrapper {
  perspective: 1000px;
  height: 160px;
  margin-bottom: 14px;
  cursor: pointer;
}
.flip-card {
  width: 100%; height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4,0,0.2,1);
}
.flip-card.flipped { transform: rotateY(180deg); }
.flip-front, .flip-back {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  text-align: center;
  border: 1px solid rgba(59,130,246,0.12);
}
.flip-front {
  background: linear-gradient(135deg, rgba(59,130,246,0.08), rgba(99,102,241,0.05));
}
.flip-back {
  background: linear-gradient(135deg, rgba(245,158,11,0.08), rgba(239,68,68,0.04));
  transform: rotateY(180deg);
}
.flip-word { font-family: var(--font-heading); font-size: 26px; font-weight: 800; color: var(--text-primary); margin-bottom: 6px; }
.flip-part { font-size: 11px; color: var(--text-secondary); font-style: italic; }
.flip-hint { font-size: 10px; color: var(--text-muted); margin-top: 10px; display: flex; align-items: center; gap: 4px; }
.flip-def { font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 8px; }
.flip-example { font-size: 11px; color: var(--text-muted); font-style: italic; line-height: 1.4; padding: 8px; background: rgba(255,255,255,0.03); border-radius: 6px; }

.btn-add-deck {
  width: 100%;
  padding: 9px;
  background: rgba(245,158,11,0.08);
  border: 1px solid rgba(245,158,11,0.2);
  border-radius: var(--radius-sm);
  color: var(--accent-gold);
  font-family: var(--font-body);
  font-size: 12px; font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  display: flex; align-items: center; justify-content: center; gap: 6px;
}
.btn-add-deck:hover { background: rgba(245,158,11,0.14); box-shadow: 0 0 14px rgba(245,158,11,0.2); }
.btn-add-deck.added { background: rgba(16,185,129,0.1); border-color: rgba(16,185,129,0.25); color: var(--accent-green); }

/* ============================================================
   7. UPCOMING MOCK TEST WIDGET
   ============================================================ */
.mock-banner {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px;
}
.mock-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.mock-badge {
  background: rgba(239,68,68,0.1);
  border: 1px solid rgba(239,68,68,0.25);
  color: #EF4444;
  font-size: 9px; font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 20px;
}
.mock-title { font-family: var(--font-heading); font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; }
.mock-duration { font-size: 11px; color: var(--text-secondary); }
.countdown-display {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 16px;
}
.countdown-unit {
  text-align: center;
  flex: 1;
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 10px 6px;
}
.countdown-num {
  font-family: var(--font-mono);
  font-size: 22px; font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
}
.countdown-lbl { font-size: 9px; color: var(--text-muted); margin-top: 3px; text-transform: uppercase; letter-spacing: 0.08em; }
.countdown-sep { font-family: var(--font-mono); font-size: 20px; color: var(--text-muted); line-height: 1; margin-top: -6px; }

.btn-exam {
  width: 100%;
  padding: 13px;
  background: transparent;
  border: 2px solid var(--accent-blue);
  border-radius: var(--radius-md);
  color: var(--accent-blue);
  font-family: var(--font-body);
  font-size: 13px; font-weight: 700;
  cursor: pointer;
  transition: var(--transition);
  position: relative;
  overflow: hidden;
  animation: pulse-border 2.5s ease-in-out infinite;
  letter-spacing: 0.03em;
}
@keyframes pulse-border {
  0%,100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.4); }
  50% { box-shadow: 0 0 0 6px rgba(59,130,246,0); }
}
.btn-exam:hover {
  background: var(--accent-blue);
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 8px 25px rgba(59,130,246,0.4);
}

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 1200px) {
  .scores-grid { grid-template-columns: repeat(2,1fr); }
  .roadmap-grid { grid-template-columns: repeat(3,1fr); }
}
@media (max-width: 900px) {
  .bottom-grid, .vocab-mock-section { grid-template-columns: 1fr; }
  .stats-row { grid-template-columns: repeat(2,1fr); }
  main.dashboard { padding: 20px 20px 80px; }
}
@media (max-width: 768px) {
  aside.sidebar {
    width: 100%;
    height: auto;
    position: fixed;
    bottom: 0; top: auto;
    left: 0; right: 0;
    flex-direction: row;
    align-items: center;
    border-right: none;
    border-top: 1px solid var(--border);
    padding: 0;
    z-index: 200;
    overflow-x: auto;
    overflow-y: hidden;
  }
  .sidebar-header, .ring-section, .sidebar-bottom { display: none; }
  nav.sidebar-nav {
    display: flex;
    flex-direction: row;
    padding: 0;
    overflow-x: auto;
    width: 100%;
  }
  .nav-section-label { display: none; }
  .nav-item { flex-direction: column; gap: 2px; padding: 10px 14px; font-size: 9px; white-space: nowrap; }
  .nav-item::before { display: none; }
  main.dashboard { margin-left: 0; padding: 20px 16px 80px; }
  .scores-grid { grid-template-columns: repeat(2,1fr); }
  .stats-row { grid-template-columns: 1fr; }
  .roadmap-grid { grid-template-columns: repeat(2,1fr); }
  .hero-inner { padding: 20px; }
  .hero-greeting { font-size: 20px; }
}
</style>
</head>
<body>

<!-- ============================================================
     SIDEBAR
     ============================================================ -->
<aside class="sidebar">
  <div class="sidebar-header">
    <div class="brand">
      <div class="brand-icon">A↗C</div>
      <div>
        <div class="brand-text">AtoC</div>
        <div class="brand-sub">IELTS FROM ZERO</div>
      </div>
    </div>
    <div class="profile-unit">
      <div class="avatar">BY</div>
      <div class="profile-info">
        <div class="profile-name">Belgibayev Yernar</div>
        <div class="band-badge">Band 6.0</div>
      </div>
    </div>
  </div>

  <!-- Progress Ring -->
  <div class="ring-section">
    <div class="ring-label">Target Score</div>
    <div class="ring-wrapper">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#3B82F6"/>
            <stop offset="100%" style="stop-color:#F59E0B"/>
          </linearGradient>
        </defs>
        <circle class="ring-bg" cx="50" cy="50" r="40"/>
        <circle class="ring-fill" id="ringFill" cx="50" cy="50" r="40"/>
      </svg>
      <div class="ring-center">
        <div class="ring-target">Target</div>
        <div class="ring-score">7.5</div>
        <div class="ring-sub">Current: 6.0</div>
      </div>
    </div>
  </div>

  <!-- Nav -->
  <nav class="sidebar-nav">
    <div class="nav-section-label">Main</div>
    <div class="nav-item active">
      <svg class="nav-icon" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></svg>
      Dashboard
      <span class="nav-dot"></span>
    </div>
    <div class="nav-item">
      <svg class="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 2h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/><path d="M5 6h6M5 9h4"/></svg>
      Lessons
      <span class="nav-dot"></span>
    </div>
    <div class="nav-item">
      <svg class="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 4v4l2.5 2.5"/></svg>
      Practice Tests
    </div>
    <div class="nav-item">
      <svg class="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 12V4l6-2 6 2v8l-6 2-6-2z"/><path d="M8 2v12M2 6l6 2 6-2"/></svg>
      Writing
      <span class="nav-dot gold"></span>
    </div>
    <div class="nav-item">
      <svg class="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="5" r="3"/><path d="M4 13c0-2.2 1.8-4 4-4s4 1.8 4 4"/></svg>
      Speaking
    </div>
    <div class="nav-item">
      <svg class="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 5h12M2 8h9M2 11h6"/></svg>
      Vocabulary
    </div>
    <div class="nav-item">
      <svg class="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="2,12 5,7 8,9 11,5 14,3"/></svg>
      Analytics
    </div>
  </nav>

  <!-- Bottom -->
  <div class="sidebar-bottom">
    <div class="exam-countdown">
      <div class="exam-label">Days Until Exam</div>
      <div class="exam-days" id="examDays">14</div>
      <div class="exam-unit">days remaining</div>
    </div>
    <div class="streak-widget">
      <span class="flame-icon">🔥</span>
      <div>
        <div class="streak-text">14 Days</div>
        <div class="streak-label">Current Streak</div>
      </div>
    </div>
  </div>
</aside>

<!-- ============================================================
     MAIN DASHBOARD
     ============================================================ -->
<main class="dashboard">

  <!-- 1. HERO BANNER -->
  <section class="hero-section anim d1">
    <div class="hero-inner">
      <div class="hero-top">
        <div>
          <h1 class="hero-greeting">Welcome back, Yernar! 🎯</h1>
        </div>
        <div style="text-align:right">
          <div class="hero-date" id="heroDate"></div>
          <div class="daily-goal-card" style="margin-top:8px">
            <span class="goal-dot"></span>
            Complete 2 lessons · 1 practice test
          </div>
        </div>
      </div>
      <div class="hero-progress-wrap">
        <div class="hero-progress-info">
          <span class="hero-progress-label">Daily Goal Progress</span>
          <span class="hero-progress-pct">73%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" id="heroProg" style="width:0%"></div>
        </div>
        <div class="hero-micro">You're <span>73% of the way to Band 7.0</span> — keep going!</div>
      </div>
    </div>
  </section>

  <!-- 2. LIVE SCORE TRACKER -->
  <section class="anim d2">
    <div class="section-header">
      <span class="section-title">📊 Live Band Scores</span>
      <span class="section-action">View full report →</span>
    </div>
    <div class="scores-grid">
      <!-- Listening -->
      <div class="score-card listening anim d2">
        <div class="score-skill">Listening</div>
        <div class="score-row">
          <div class="score-value" data-target="6.5" data-prefix="" data-suffix="">0.0</div>
          <div class="score-badge">↑ +0.5</div>
        </div>
        <div class="sparkline-wrap">
          <svg viewBox="0 0 100 30" preserveAspectRatio="none">
            <defs><linearGradient id="spL" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#3B82F6" stop-opacity="0.3"/><stop offset="100%" stop-color="#3B82F6" stop-opacity="0"/></linearGradient></defs>
            <path d="M0,22 L25,18 L50,20 L75,12 L100,8" fill="none" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M0,22 L25,18 L50,20 L75,12 L100,8 L100,30 L0,30Z" fill="url(#spL)"/>
            <circle cx="25" cy="18" r="2" fill="#3B82F6"/>
            <circle cx="50" cy="20" r="2" fill="#3B82F6"/>
            <circle cx="75" cy="12" r="2" fill="#3B82F6"/>
            <circle cx="100" cy="8" r="3" fill="#3B82F6"/>
          </svg>
        </div>
        <button class="btn-practice">▶ Start Practice</button>
      </div>
      <!-- Reading -->
      <div class="score-card reading anim d3">
        <div class="score-skill">Reading</div>
        <div class="score-row">
          <div class="score-value" data-target="6.0">0.0</div>
          <div class="score-badge">↑ +0.5</div>
        </div>
        <div class="sparkline-wrap">
          <svg viewBox="0 0 100 30" preserveAspectRatio="none">
            <defs><linearGradient id="spR" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#10B981" stop-opacity="0.3"/><stop offset="100%" stop-color="#10B981" stop-opacity="0"/></linearGradient></defs>
            <path d="M0,24 L25,20 L50,22 L75,14 L100,10" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M0,24 L25,20 L50,22 L75,14 L100,10 L100,30 L0,30Z" fill="url(#spR)"/>
            <circle cx="100" cy="10" r="3" fill="#10B981"/>
          </svg>
        </div>
        <button class="btn-practice">▶ Start Practice</button>
      </div>
      <!-- Writing -->
      <div class="score-card writing anim d4">
        <div class="score-skill">Writing</div>
        <div class="score-row">
          <div class="score-value" data-target="5.5">0.0</div>
          <div class="score-badge" style="background:rgba(239,68,68,0.1);border-color:rgba(239,68,68,0.25);color:#EF4444;">↑ +0.5</div>
        </div>
        <div class="sparkline-wrap">
          <svg viewBox="0 0 100 30" preserveAspectRatio="none">
            <defs><linearGradient id="spW" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#F59E0B" stop-opacity="0.3"/><stop offset="100%" stop-color="#F59E0B" stop-opacity="0"/></linearGradient></defs>
            <path d="M0,26 L25,24 L50,20 L75,18 L100,14" fill="none" stroke="#F59E0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M0,26 L25,24 L50,20 L75,18 L100,14 L100,30 L0,30Z" fill="url(#spW)"/>
            <circle cx="100" cy="14" r="3" fill="#F59E0B"/>
          </svg>
        </div>
        <button class="btn-practice" style="color:#F59E0B;border-color:rgba(245,158,11,0.3);background:rgba(245,158,11,0.08)">▶ Start Practice</button>
      </div>
      <!-- Speaking -->
      <div class="score-card speaking anim d5">
        <div class="score-skill">Speaking</div>
        <div class="score-row">
          <div class="score-value" data-target="6.0">0.0</div>
          <div class="score-badge" style="background:rgba(139,92,246,0.1);border-color:rgba(139,92,246,0.25);color:#8B5CF6;">↑ +1.0</div>
        </div>
        <div class="sparkline-wrap">
          <svg viewBox="0 0 100 30" preserveAspectRatio="none">
            <defs><linearGradient id="spS" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#8B5CF6" stop-opacity="0.3"/><stop offset="100%" stop-color="#8B5CF6" stop-opacity="0"/></linearGradient></defs>
            <path d="M0,28 L25,22 L50,18 L75,14 L100,8" fill="none" stroke="#8B5CF6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M0,28 L25,22 L50,18 L75,14 L100,8 L100,30 L0,30Z" fill="url(#spS)"/>
            <circle cx="100" cy="8" r="3" fill="#8B5CF6"/>
          </svg>
        </div>
        <button class="btn-practice" style="color:#8B5CF6;border-color:rgba(139,92,246,0.3);background:rgba(139,92,246,0.08)">▶ Start Practice</button>
      </div>
    </div>
  </section>

  <!-- 3. LEARNING PATH -->
  <section class="learning-path-section anim d3">
    <div class="section-header">
      <span class="section-title">🗺️ Learning Roadmap</span>
      <span class="section-action">See all modules →</span>
    </div>
    <div class="roadmap-container">
      <div class="roadmap-grid" id="roadmapGrid">
        <!-- Row 1 -->
        <div class="node-wrap" data-node="foundation">
          <div class="node completed" onclick="togglePanel('foundation')">
            <svg class="node-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
          </div>
          <div class="node-label">Foundation</div>
          <div class="node-panel" id="panel-foundation">
            <div class="panel-title">📚 Foundation</div>
            <div class="panel-lesson"><span class="lesson-dot done"></span>IELTS Overview</div>
            <div class="panel-lesson"><span class="lesson-dot done"></span>Band Descriptors</div>
            <div class="panel-lesson"><span class="lesson-dot done"></span>Test Format</div>
          </div>
        </div>
        <div class="node-wrap" data-node="grammar">
          <div class="node completed" onclick="togglePanel('grammar')">
            <svg class="node-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
          </div>
          <div class="node-label">Grammar</div>
          <div class="node-panel" id="panel-grammar">
            <div class="panel-title">✏️ Grammar</div>
            <div class="panel-lesson"><span class="lesson-dot done"></span>Tense Review</div>
            <div class="panel-lesson"><span class="lesson-dot done"></span>Conditionals</div>
            <div class="panel-lesson"><span class="lesson-dot done"></span>Complex Sentences</div>
          </div>
        </div>
        <div class="node-wrap" data-node="listening">
          <div class="node completed" onclick="togglePanel('listening')">
            <svg class="node-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
          </div>
          <div class="node-label">Listening Skills</div>
          <div class="node-panel" id="panel-listening">
            <div class="panel-title">🎧 Listening</div>
            <div class="panel-lesson"><span class="lesson-dot done"></span>Note-Taking</div>
            <div class="panel-lesson"><span class="lesson-dot done"></span>Section 1–4</div>
            <div class="panel-lesson"><span class="lesson-dot next"></span>Academic Lectures</div>
          </div>
        </div>
        <div class="node-wrap" data-node="reading">
          <div class="node current" onclick="togglePanel('reading')">
            <svg class="node-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <div class="node-label active-label">Reading Strategies</div>
          <div class="node-panel" id="panel-reading">
            <div class="panel-title">📖 Reading — Current</div>
            <div class="panel-lesson"><span class="lesson-dot done"></span>Skimming & Scanning</div>
            <div class="panel-lesson"><span class="lesson-dot next"></span>T/F/NG Questions ← Now</div>
            <div class="panel-lesson"><span class="lesson-dot lock"></span>Summary Completion</div>
          </div>
        </div>
        <!-- Row 2 -->
        <div class="node-wrap" data-node="wt1">
          <div class="node locked">
            <svg class="node-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/></svg>
          </div>
          <div class="node-label">Writing Task 1</div>
        </div>
        <div class="node-wrap" data-node="wt2">
          <div class="node locked">
            <svg class="node-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/></svg>
          </div>
          <div class="node-label">Writing Task 2</div>
        </div>
        <div class="node-wrap" data-node="speaking">
          <div class="node locked">
            <svg class="node-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/></svg>
          </div>
          <div class="node-label">Speaking Fluency</div>
        </div>
        <div class="node-wrap" data-node="mock">
          <div class="node locked">
            <svg class="node-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/></svg>
          </div>
          <div class="node-label">Full Mock Test</div>
        </div>
        <!-- Final -->
        <div class="node-wrap" style="grid-column: 2 / 4; align-items: center;" data-node="exam">
          <div class="node locked" style="width:60px;height:60px;font-size:22px;">🏆</div>
          <div class="node-label" style="font-size:12px;font-weight:700;color:var(--accent-gold)">Exam Ready</div>
        </div>
      </div>
    </div>
  </section>

  <!-- 4. PERFORMANCE STATS -->
  <section class="anim d4" style="margin-bottom:28px">
    <div class="section-header">
      <span class="section-title">⚡ Performance Stats</span>
    </div>
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon-row">
          <div class="stat-icon-wrap gold">🔥</div>
          <div class="stat-tag">Streak</div>
        </div>
        <div class="stat-value" data-target="14" data-int="true">0</div>
        <div class="stat-sub">Days consecutive study</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-row">
          <div class="stat-icon-wrap blue">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke="#3B82F6" stroke-width="1.5"/><path d="M9 5v4l2.5 2.5" stroke="#3B82F6" stroke-width="1.5" stroke-linecap="round"/></svg>
          </div>
          <div class="stat-tag">Study Time</div>
        </div>
        <div class="stat-value" data-target="47.5">0</div>
        <div class="stat-sub" style="font-size:10px">hours total logged</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-row">
          <div class="stat-icon-wrap green">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="14" height="14" rx="3" stroke="#10B981" stroke-width="1.5"/><path d="M5.5 9l2.5 2.5 4.5-4.5" stroke="#10B981" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <div class="stat-tag">Tests</div>
        </div>
        <div class="stat-value" data-target="12" data-int="true">0</div>
        <div class="stat-sub">of 30 tests completed</div>
        <div class="mini-progress-track">
          <div class="mini-progress-fill" style="width:40%"></div>
        </div>
      </div>
    </div>
  </section>

  <!-- 5. ACTIVITY FEED + RESUME -->
  <div class="bottom-grid anim d5">
    <div class="activity-card">
      <div class="section-header" style="margin-bottom:14px">
        <span class="section-title" style="font-size:14px">📋 Recent Activity</span>
      </div>
      <ul class="timeline">
        <li class="timeline-item">
          <span class="tl-dot gold"></span>
          <div class="tl-content">
            <div class="tl-title">Writing Task 1 Submitted</div>
            <div class="tl-meta">2 hours ago</div>
            <div class="tl-feedback">Coherence &amp; Cohesion improved → Band 6.5</div>
          </div>
        </li>
        <li class="timeline-item">
          <span class="tl-dot blue"></span>
          <div class="tl-content">
            <div class="tl-title">Reading Practice — Section 3</div>
            <div class="tl-meta">Yesterday at 7:30 PM · 34/40 correct</div>
          </div>
        </li>
        <li class="timeline-item">
          <span class="tl-dot green"></span>
          <div class="tl-content">
            <div class="tl-title">Vocabulary Deck — Academic Word List</div>
            <div class="tl-meta">Yesterday · 25 new words mastered</div>
          </div>
        </li>
        <li class="timeline-item">
          <span class="tl-dot muted"></span>
          <div class="tl-content">
            <div class="tl-title">Listening Mock Test #7</div>
            <div class="tl-meta">2 days ago · Band 6.5</div>
          </div>
        </li>
      </ul>
    </div>
    <div class="resume-card">
      <div>
        <div class="section-title" style="font-size:14px;margin-bottom:14px">▶ Resume Learning</div>
        <div class="resume-stats">
          <div class="rstat">
            <div class="rstat-val" style="color:var(--accent-blue)">T/F</div>
            <div class="rstat-key">Current</div>
          </div>
          <div class="rstat">
            <div class="rstat-val">60%</div>
            <div class="rstat-key">Complete</div>
          </div>
          <div class="rstat">
            <div class="rstat-val" style="color:var(--accent-gold)">~12m</div>
            <div class="rstat-key">Left</div>
          </div>
        </div>
        <div class="resume-title">Reading Strategies</div>
        <div class="resume-lesson">Lesson 3 of 5 — True/False/Not Given</div>
        <div class="resume-progress-info">
          <span>Progress</span><span>60%</span>
        </div>
        <div class="resume-track">
          <div class="resume-fill"></div>
        </div>
      </div>
      <button class="btn-resume">⚡ Resume where you left off</button>
    </div>
  </div>

  <!-- 6. VOCAB + 7. MOCK TEST -->
  <div class="vocab-mock-section anim d6">

    <!-- Vocabulary Widget -->
    <div class="vocab-card">
      <div class="vocab-header">
        <div class="section-title" style="font-size:14px">💬 Word of the Day</div>
        <div class="band-tag">Band 8.0</div>
      </div>
      <div class="flip-card-wrapper" onclick="flipCard()">
        <div class="flip-card" id="flipCard">
          <div class="flip-front">
            <div class="flip-word">Idiosyncrasy</div>
            <div class="flip-part">noun /ˌɪdiəˈsɪŋkrəsi/</div>
            <div class="flip-hint">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v5l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="6" cy="6" r="5" stroke="currentColor" stroke-width="1.2"/></svg>
              Tap to reveal definition
            </div>
          </div>
          <div class="flip-back">
            <div class="flip-def">A mode of behaviour or way of thought peculiar to an individual.</div>
            <div class="flip-example">"One of his idiosyncrasies was turning the volume on the television to an odd number."</div>
          </div>
        </div>
      </div>
      <button class="btn-add-deck" id="addDeckBtn" onclick="addToDeck()">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        Add to my deck
      </button>
    </div>

    <!-- Mock Test Countdown -->
    <div class="mock-banner">
      <div class="mock-top">
        <div>
          <div class="mock-title">Full IELTS Mock Examination</div>
          <div class="mock-duration">Duration: 2h 45min · All 4 Sections</div>
        </div>
        <div class="mock-badge">⚠ Upcoming</div>
      </div>
      <div style="font-size:10px;color:var(--text-muted);margin-bottom:10px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase">Time Until Exam</div>
      <div class="countdown-display">
        <div class="countdown-unit">
          <div class="countdown-num" id="cdDays">00</div>
          <div class="countdown-lbl">Days</div>
        </div>
        <div class="countdown-sep">:</div>
        <div class="countdown-unit">
          <div class="countdown-num" id="cdHours">00</div>
          <div class="countdown-lbl">Hours</div>
        </div>
        <div class="countdown-sep">:</div>
        <div class="countdown-unit">
          <div class="countdown-num" id="cdMins">00</div>
          <div class="countdown-lbl">Mins</div>
        </div>
        <div class="countdown-sep">:</div>
        <div class="countdown-unit">
          <div class="countdown-num" id="cdSecs">00</div>
          <div class="countdown-lbl">Secs</div>
        </div>
      </div>
      <button class="btn-exam">🎯 Register for Mock Test Now</button>
    </div>
  </div>

  <!-- spacer -->
  <div style="height:40px"></div>

</main>

<script>
/* ============================================================
   DATE
   ============================================================ */
const dateEl = document.getElementById('heroDate');
const now = new Date();
dateEl.textContent = now.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });

/* ============================================================
   PROGRESS BAR (hero)
   ============================================================ */
setTimeout(() => {
  document.getElementById('heroProg').style.width = '73%';
}, 400);

/* ============================================================
   SVG RING ANIMATION
   ============================================================ */
setTimeout(() => {
  const ring = document.getElementById('ringFill');
  const radius = 40;
  const circumference = 2 * Math.PI * radius; // 251.2
  // 6.0 / 7.5 = 0.8 progress  
  const progress = 6.0 / 9.0; // normalized relative to 9 (max IELTS)
  const offset = circumference * (1 - progress);
  ring.style.strokeDashoffset = offset;
}, 300);

/* ============================================================
   COUNTER ANIMATION
   ============================================================ */
function animateCounter(el, target, isInt, duration) {
  const start = performance.now();
  function update(time) {
    const elapsed = time - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = eased * target;
    el.textContent = isInt ? Math.round(current) : current.toFixed(1);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = isInt ? target : target.toFixed(1);
  }
  requestAnimationFrame(update);
}

// Trigger when page loads
window.addEventListener('load', () => {
  setTimeout(() => {
    document.querySelectorAll('[data-target]').forEach(el => {
      const target = parseFloat(el.dataset.target);
      const isInt = el.dataset.int === 'true';
      animateCounter(el, target, isInt, 1400);
    });
  }, 300);
});

/* ============================================================
   COUNTDOWN TIMER
   ============================================================ */
function updateCountdown() {
  const examDate = new Date();
  examDate.setDate(examDate.getDate() + 14);
  examDate.setHours(9, 0, 0, 0);
  const diff = examDate - new Date();
  if (diff <= 0) return;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  document.getElementById('cdDays').textContent  = String(d).padStart(2,'0');
  document.getElementById('cdHours').textContent = String(h).padStart(2,'0');
  document.getElementById('cdMins').textContent  = String(m).padStart(2,'0');
  document.getElementById('cdSecs').textContent  = String(s).padStart(2,'0');
  document.getElementById('examDays').textContent = d;
}
updateCountdown();
setInterval(updateCountdown, 1000);

/* ============================================================
   NODE PANELS
   ============================================================ */
function togglePanel(id) {
  const panel = document.getElementById('panel-' + id);
  if (!panel) return;
  const isOpen = panel.classList.contains('open');
  document.querySelectorAll('.node-panel.open').forEach(p => p.classList.remove('open'));
  if (!isOpen) panel.classList.add('open');
}
// Close on outside click
document.addEventListener('click', e => {
  if (!e.target.closest('.node-wrap')) {
    document.querySelectorAll('.node-panel.open').forEach(p => p.classList.remove('open'));
  }
});

/* ============================================================
   FLIP CARD
   ============================================================ */
function flipCard() {
  document.getElementById('flipCard').classList.toggle('flipped');
}

/* ============================================================
   ADD TO DECK
   ============================================================ */
function addToDeck() {
  const btn = document.getElementById('addDeckBtn');
  btn.classList.add('added');
  btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5L12 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg> Added to deck!';
  setTimeout(() => {
    btn.classList.remove('added');
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg> Add to my deck';
  }, 2500);
}

/* ============================================================
   NAV CLICK HANDLER
   ============================================================ */
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
  });
});

/* ============================================================
   SCORE CARD HOVER GLOW COLORS
   ============================================================ */
document.querySelectorAll('.score-card').forEach(card => {
  let color = 'rgba(59,130,246,0.2)';
  if (card.classList.contains('reading'))  color = 'rgba(16,185,129,0.2)';
  if (card.classList.contains('writing'))  color = 'rgba(245,158,11,0.2)';
  if (card.classList.contains('speaking')) color = 'rgba(139,92,246,0.2)';
  card.addEventListener('mouseenter', () => {
    card.style.boxShadow = `0 10px 25px -5px ${color}`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.boxShadow = '';
  });
});
</script>
</body>
</html>
