'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type Lesson = { id: number; level: string; lesson_number: number; title: string; grammar_topic: string; pdf_url: string | null }
type Progress = { lesson_id: number; status: string }
type Profile = { full_name: string; email: string; streak?: number; longest_streak?: number }

const LEVEL_META: Record<string, { color: string; dark: string; light: string; border: string; emoji: string; name: string; desc: string; gradient: string }> = {
  A: { color: '#58cc02', dark: '#46a302', light: '#f0fde4', border: '#89e219', emoji: '🌱', name: 'Beginner', desc: 'Основы английского', gradient: 'linear-gradient(135deg, #58cc02, #89e219)' },
  B: { color: '#1cb0f6', dark: '#0d96d6', light: '#e8f7ff', border: '#6dcff6', emoji: '⚡', name: 'Intermediate', desc: 'Band 5.5–6.5', gradient: 'linear-gradient(135deg, #1cb0f6, #6dcff6)' },
  C: { color: '#ce82ff', dark: '#a854e6', light: '#f5eeff', border: '#d8a4ff', emoji: '🔥', name: 'Advanced', desc: 'Band 7+', gradient: 'linear-gradient(135deg, #ce82ff, #a854e6)' },
}

export default function Dashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [progress, setProgress] = useState<Progress[]>([])
  const [activeLevel, setActiveLevel] = useState('A')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }
      const [{ data: prof }, { data: les }, { data: prog }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('lessons').select('*').order('order_index'),
        supabase.from('progress').select('lesson_id, status').eq('student_id', user.id),
      ])
      setProfile(prof); setLessons(les || []); setProgress(prog || [])
      setLoading(false)
    }
    load()
  }, [router])

  const getStatus = (id: number) => progress.find(p => p.lesson_id === id)?.status || 'not_started'
  const completedCount = progress.filter(p => p.status === 'completed').length
  const totalLessons = lessons.length
  const xp = completedCount * 10
  const streak = profile?.streak || 0
  const levelLessons = lessons.filter(l => l.level === activeLevel)
  const nextLessonIdx = levelLessons.findIndex(l => getStatus(l.id) !== 'completed')
  const meta = LEVEL_META[activeLevel]

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth')
  }

  if (loading) return (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',background:'#131f24',fontFamily:'DM Rounded,Nunito,sans-serif',color:'#4b9e6e',fontSize:'1.1rem',fontWeight:700,letterSpacing:1 }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:'2.5rem',marginBottom:16 }}>🦉</div>
        <div>Загрузка...</div>
      </div>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html, body { font-family:'Nunito',sans-serif; background:#f9f9f9; color:#1f1f1f; min-height:100vh; }

        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:#ddd; border-radius:99px; }

        /* SIDEBAR */
        .sidebar {
          position:fixed; left:0; top:0; bottom:0; width:240px;
          background:#fff;
          border-right:2px solid #e5e5e5;
          display:flex; flex-direction:column;
          z-index:100;
        }
        .logo {
          padding:22px 24px 18px;
          font-weight:900;
          font-size:1.75rem;
          color:#1f1f1f;
          letter-spacing:-1px;
        }
        .logo span { color:#58cc02; }

        .nav-section { padding:0 12px; flex:1; }
        .nav-item {
          display:flex; align-items:center; gap:16px;
          padding:14px 16px; border-radius:16px;
          cursor:pointer; font-weight:800; font-size:0.82rem;
          color:#afafaf; transition:all 0.15s;
          text-decoration:none; letter-spacing:1.5px;
          text-transform:uppercase; margin-bottom:2px;
          border:2px solid transparent;
        }
        .nav-item:hover { background:#f7f7f7; color:#4b4b4b; }
        .nav-item.active { background:#ddf4c1; color:#58cc02; border-color:#c7eb8b; }
        .nav-item.active .nav-icon-wrap { background:#58cc02; }
        .nav-item.active .nav-icon-wrap svg { color:#fff; }
        .nav-icon-wrap {
          width:36px; height:36px; border-radius:10px;
          background:#f0f0f0; display:flex; align-items:center;
          justify-content:center; flex-shrink:0; font-size:1.1rem;
          transition:background 0.15s;
        }

        .sidebar-bottom { padding:16px; border-top:2px solid #f0f0f0; }
        .streak-pill {
          display:flex; align-items:center; gap:12px;
          background:linear-gradient(135deg, #fff7e6, #fff0d0);
          border:2px solid #ffd080; border-bottom:4px solid #ffc700;
          border-radius:16px; padding:14px 16px; cursor:pointer;
          transition:transform 0.15s;
        }
        .streak-pill:hover { transform:translateY(-1px); }

        /* TOPBAR */
        .topbar {
          position:fixed; top:0; left:240px; right:0; height:64px;
          background:#fff; border-bottom:2px solid #e5e5e5;
          display:flex; align-items:center; justify-content:flex-end;
          padding:0 32px; gap:24px; z-index:99;
        }
        .stat-chip {
          display:flex; align-items:center; gap:7px;
          padding:8px 16px; border-radius:99px;
          font-weight:900; font-size:0.95rem;
          border:2px solid transparent; cursor:pointer;
          transition:all 0.15s; user-select:none;
        }
        .stat-chip:hover { transform:scale(1.04); }
        .stat-chip.fire { color:#ff9600; border-color:#ffd080; background:#fff7e6; }
        .stat-chip.xp   { color:#1cb0f6; border-color:#b5e8fc; background:#e8f7ff; }
        .stat-chip.heart{ color:#ff4b4b; border-color:#ffc0c0; background:#fff0f0; }
        .stat-divider { width:2px; height:28px; background:#e5e5e5; border-radius:99px; }
        .user-chip {
          display:flex; align-items:center; gap:10px;
          padding:6px 14px 6px 8px; border:2px solid #e5e5e5;
          border-radius:99px; cursor:pointer; font-weight:800; font-size:0.85rem; color:#4b4b4b;
          transition:border-color 0.15s;
        }
        .user-chip:hover { border-color:#c8c8c8; }
        .avatar {
          width:32px; height:32px; border-radius:50%;
          background:linear-gradient(135deg,#58cc02,#1cb0f6);
          display:flex; align-items:center; justify-content:center;
          font-size:0.9rem; color:#fff; font-weight:900; flex-shrink:0;
        }

        /* MAIN LAYOUT */
        .main { margin-left:240px; padding-top:64px; min-height:100vh; }
        .content-grid { display:grid; grid-template-columns:1fr 300px; max-width:980px; margin:0 auto; }
        .center-col { padding:32px 24px 80px; }
        .right-col { padding:24px 20px 24px 0; border-left:2px solid #e5e5e5; }

        /* LEVEL HEADER */
        .level-header {
          background:linear-gradient(135deg, #131f24 0%, #1a3040 100%);
          border-radius:24px; padding:24px 28px; margin-bottom:24px;
          display:flex; align-items:center; gap:20px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.12);
        }
        .level-icon-big {
          width:64px; height:64px; border-radius:20px;
          display:flex; align-items:center; justify-content:center;
          font-size:2.2rem; flex-shrink:0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        .level-ring { position:relative; flex-shrink:0; }

        /* LEVEL TABS */
        .level-tabs { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:24px; }
        .level-tab {
          padding:16px 12px; border-radius:20px; cursor:pointer;
          border:2.5px solid #e5e5e5; text-align:center;
          background:#fff; transition:all 0.2s;
          font-weight:800;
        }
        .level-tab:hover { transform:translateY(-2px); border-color:#c8c8c8; box-shadow:0 4px 12px rgba(0,0,0,0.08); }
        .level-tab.active { transform:translateY(-2px); }

        /* UNIT BANNER */
        .unit-banner {
          border-radius:20px; padding:20px 24px; margin-bottom:32px;
          display:flex; align-items:center; gap:16px;
          border:2.5px solid transparent; border-bottom-width:5px;
        }
        .unit-icon {
          width:54px; height:54px; border-radius:16px;
          display:flex; align-items:center; justify-content:center;
          font-size:2rem; flex-shrink:0; border-bottom:4px solid rgba(0,0,0,0.12);
        }

        /* PATH */
        .path { display:flex; flex-direction:column; align-items:center; padding-bottom:48px; }
        .node-wrap { display:flex; flex-direction:column; align-items:center; }
        .connector { width:4px; height:28px; border-radius:99px; }

        .bubble {
          width:80px; height:80px; border-radius:50%;
          display:flex; align-items:center; justify-content:center;
          font-size:2rem; cursor:pointer; transition:all 0.18s;
          border:4px solid rgba(0,0,0,0.08); position:relative;
          text-decoration:none; border-bottom:6px solid rgba(0,0,0,0.18);
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .bubble:hover:not(.locked) { transform:scale(1.08) translateY(-2px); box-shadow:0 8px 20px rgba(0,0,0,0.15); }
        .bubble.current { animation:bob 2s ease-in-out infinite; }
        .bubble.locked { cursor:default; filter:grayscale(1); opacity:0.35; }
        .bubble.locked:hover { transform:none !important; box-shadow:none !important; }

        .current-label {
          position:absolute; top:-44px; left:50%; transform:translateX(-50%);
          font-weight:900; font-size:0.7rem;
          padding:6px 16px; border-radius:99px;
          white-space:nowrap; letter-spacing:1.5px;
          box-shadow: 0 3px 12px rgba(0,0,0,0.12);
        }
        .current-label::after {
          content:''; position:absolute; bottom:-6px; left:50%; transform:translateX(-50%);
          width:10px; height:10px; border-radius:2px; rotate:45deg;
        }

        .node-label { margin-top:12px; text-align:center; max-width:100px; }
        .node-num { font-size:0.65rem; font-weight:900; letter-spacing:2px; text-transform:uppercase; margin-bottom:3px; }
        .node-topic { font-size:0.75rem; font-weight:700; color:#b0b0b0; line-height:1.4; }
        .node-label.current .node-topic { color:#3c3c3c; }

        /* RIGHT PANEL CARDS */
        .rcard {
          background:#fff; border:2px solid #e5e5e5;
          border-radius:20px; padding:20px;
          margin-bottom:14px; border-bottom:4px solid #e5e5e5;
        }
        .rcard-title {
          font-size:0.65rem; font-weight:900; letter-spacing:2px;
          text-transform:uppercase; color:#b0b0b0; margin-bottom:14px;
        }
        .bar-track { background:#f0f0f0; border-radius:99px; height:10px; overflow:hidden; margin-top:6px; }
        .bar-fill { height:100%; border-radius:99px; transition:width 0.6s cubic-bezier(.4,0,.2,1); }

        .progress-row {
          display:flex; justify-content:space-between; align-items:center;
          margin-bottom:4px;
        }
        .progress-label { font-size:0.82rem; font-weight:800; }
        .progress-count { font-size:0.75rem; font-weight:700; color:#b0b0b0; }

        .level-prog-item { margin-bottom:14px; }

        /* STREAK CARD */
        .streak-rcard {
          background:linear-gradient(135deg, #fff7e6, #fff0d0);
          border:2px solid #ffd080; border-radius:20px;
          padding:20px; border-bottom:4px solid #ffc700;
        }

        /* ANIMATIONS */
        @keyframes bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scaleIn { from{opacity:0;transform:scale(0.94)} to{opacity:1;transform:scale(1)} }
        .fade { animation:fadeUp 0.35s ease both; }
        .scale-in { animation:scaleIn 0.3s ease both; }

        /* RESPONSIVE */
        @media (max-width:1100px) { .right-col { display:none; } .content-grid { grid-template-columns:1fr; } }
        @media (max-width:768px) { .sidebar{display:none} .main{margin-left:0} .topbar{left:0} .center-col{padding:20px 16px 80px} }
      `}</style>

      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="logo">Ato<span>C</span></div>

        <nav className="nav-section">
          {[
            { icon:'🎓', label:'Обучение', active:true },
            { icon:'🏆', label:'Рейтинги', active:false },
            { icon:'📖', label:'Словарь', active:false },
            { icon:'👤', label:'Профиль', active:false },
          ].map(item => (
            <div key={item.label} className={`nav-item ${item.active?'active':''}`}>
              <div className="nav-icon-wrap">{item.icon}</div>
              {item.label}
            </div>
          ))}
        </nav>

        <div className="nav-section" style={{ flex:'none', paddingBottom:8 }}>
          <div className="nav-item" style={{ color:'#ff4b4b' }} onClick={handleLogout}>
            <div className="nav-icon-wrap" style={{ background:'#fff0f0' }}>🚪</div>
            Выйти
          </div>
        </div>

        <div className="sidebar-bottom">
          <div className="streak-pill">
            <span style={{ fontSize:'2rem' }}>🔥</span>
            <div>
              <div style={{ fontWeight:900, fontSize:'1.4rem', color:'#ff9600', lineHeight:1 }}>{streak}</div>
              <div style={{ fontSize:'0.72rem', color:'#b08030', fontWeight:700, marginTop:2 }}>дней подряд</div>
            </div>
          </div>
        </div>
      </div>

      {/* TOPBAR */}
      <div className="topbar">
        <div className="stat-chip fire">🔥 <span>{streak}</span></div>
        <div className="stat-chip xp">⚡ <span>{xp} XP</span></div>
        <div className="stat-chip heart">❤️ <span>5</span></div>
        <div className="stat-divider"/>
        <div className="user-chip">
          <div className="avatar">{(profile?.full_name?.[0] || 'Y').toUpperCase()}</div>
          <span>{profile?.full_name?.split(' ')[0] || 'Студент'}</span>
        </div>
      </div>

      {/* MAIN */}
      <div className="main">
        <div className="content-grid">

          {/* CENTER */}
          <div className="center-col">

            {/* Level Tabs */}
            <div className="level-tabs fade">
              {(['A','B','C'] as const).map((lvl, i) => {
                const m = LEVEL_META[lvl]
                const lvlLes = lessons.filter(l => l.level === lvl)
                const done = lvlLes.filter(l => getStatus(l.id) === 'completed').length
                const isOn = activeLevel === lvl
                const pct = lvlLes.length > 0 ? done/lvlLes.length*100 : 0
                return (
                  <div key={lvl} className={`level-tab ${isOn?'active':''}`}
                    onClick={() => setActiveLevel(lvl)}
                    style={{
                      borderColor: isOn ? m.color : '#e5e5e5',
                      background: isOn ? m.light : '#fff',
                      boxShadow: isOn ? `0 5px 0 ${m.border}` : '0 4px 0 #e5e5e5',
                    }}>
                    <div style={{ fontSize:'2rem', marginBottom:6 }}>{m.emoji}</div>
                    <div style={{ fontSize:'0.8rem', fontWeight:900, color: isOn ? m.color : '#afafaf', marginBottom:2 }}>Уровень {lvl}</div>
                    <div style={{ fontSize:'0.68rem', color:'#c8c8c8', fontWeight:700, marginBottom:8 }}>{m.name}</div>
                    {/* mini bar */}
                    <div style={{ background:'#f0f0f0', borderRadius:99, height:6, overflow:'hidden' }}>
                      <div style={{ height:'100%', borderRadius:99, background:m.color, width:`${pct}%`, transition:'width 0.4s ease' }}/>
                    </div>
                    <div style={{ fontSize:'0.68rem', fontWeight:800, color: isOn ? m.color : '#c8c8c8', marginTop:6 }}>{done}/{lvlLes.length}</div>
                  </div>
                )
              })}
            </div>

            {/* Unit Banner */}
            <div className="unit-banner fade" style={{
              background: meta.light,
              borderColor: meta.border,
              borderBottomColor: meta.border,
              animationDelay: '0.05s'
            }}>
              <div className="unit-icon" style={{ background: meta.gradient, borderBottomColor: meta.dark }}>
                {meta.emoji}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:'0.65rem', fontWeight:900, letterSpacing:2, textTransform:'uppercase', color:meta.color, marginBottom:5 }}>
                  Уровень {activeLevel} · {meta.name}
                </div>
                <div style={{ fontWeight:900, fontSize:'1.1rem', color:'#1f1f1f', marginBottom:4 }}>{meta.desc}</div>
                <div style={{ fontSize:'0.78rem', color:'#b0b0b0', fontWeight:700 }}>
                  {levelLessons.filter(l=>getStatus(l.id)==='completed').length} из {levelLessons.length} уроков
                </div>
              </div>
              {/* Ring */}
              <svg width="52" height="52" style={{ flexShrink:0, transform:'rotate(-90deg)' }}>
                <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="4.5"/>
                <circle cx="26" cy="26" r="22" fill="none" stroke={meta.color} strokeWidth="4.5"
                  strokeDasharray={`${2*Math.PI*22}`}
                  strokeDashoffset={`${2*Math.PI*22*(1-levelLessons.filter(l=>getStatus(l.id)==='completed').length/Math.max(levelLessons.length,1))}`}
                  strokeLinecap="round" style={{ transition:'stroke-dashoffset 0.6s ease' }}/>
              </svg>
            </div>

            {/* PATH */}
            <div className="path fade" style={{ animationDelay:'0.1s' }}>
              {levelLessons.map((lesson, i) => {
                const status = getStatus(lesson.id)
                const isCurrent = i === nextLessonIdx
                const isDone = status === 'completed'
                const isLocked = !isDone && i > nextLessonIdx

                const pattern = [0, 80, 120, 80, 0, -80, -120, -80]
                const offset = pattern[i % 8]

                let bubbleBg = '#e5e5e5'
                let bubbleBorder = '#d0d0d0'
                let bubbleIcon = '⬤'
                if (isDone) { bubbleBg = meta.gradient; bubbleBorder = meta.dark; bubbleIcon = '⭐' }
                else if (isCurrent) { bubbleBg = meta.gradient; bubbleBorder = meta.dark; bubbleIcon = '▶' }

                return (
                  <div key={lesson.id} className="node-wrap" style={{ marginLeft:offset }}>
                    {i > 0 && (
                      <div className="connector" style={{
                        background: isDone ? meta.color : '#e5e5e5',
                      }}/>
                    )}

                    <div style={{ position:'relative', marginTop:6 }}>
                      {isCurrent && (
                        <div className="current-label" style={{
                          background: meta.color,
                          color: '#fff',
                        }}>
                          НАЧАТЬ
                          <div style={{
                            content:'', position:'absolute', bottom:-6, left:'50%', transform:'translateX(-50%)',
                            width:10, height:10, background:meta.color, borderRadius:2, rotate:'45deg'
                          }}/>
                        </div>
                      )}

                      <Link href={isLocked ? '#' : `/lesson/${lesson.id}`}
                        className={`bubble ${isCurrent?'current':''} ${isDone?'done':''} ${isLocked?'locked':''}`}
                        onClick={e => isLocked && e.preventDefault()}
                        style={{
                          background: bubbleBg,
                          borderColor: bubbleBorder,
                          borderBottomColor: isLocked ? '#c0c0c0' : meta.dark,
                          boxShadow: isCurrent ? `0 0 0 8px ${meta.light}, 0 0 0 10px ${meta.border}` : undefined,
                          color: isDone || isCurrent ? '#fff' : '#c0c0c0',
                        }}>
                        <span style={{ fontSize: bubbleIcon === '▶' ? '1.5rem' : '1.8rem', marginLeft: bubbleIcon === '▶' ? 4 : 0 }}>
                          {isLocked ? '🔒' : bubbleIcon}
                        </span>
                      </Link>
                    </div>

                    <div className={`node-label ${isCurrent?'current':''}`}>
                      <div className="node-num" style={{ color: isDone || isCurrent ? meta.color : '#d0d0d0' }}>
                        {lesson.level}{lesson.lesson_number}
                      </div>
                      <div className="node-topic">{lesson.grammar_topic?.split('·')[0]?.trim() || lesson.title}</div>
                    </div>
                  </div>
                )
              })}

              {levelLessons.length > 0 && levelLessons.every(l => getStatus(l.id) === 'completed') && (
                <div className="scale-in" style={{ textAlign:'center', marginTop:40 }}>
                  <div style={{ width:100,height:100,borderRadius:50%,background:meta.gradient,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'3rem',margin:'0 auto 16px',boxShadow:`0 8px 24px ${meta.color}40`,border:`4px solid ${meta.dark}`,borderBottom:`6px solid ${meta.dark}` }}>🏆</div>
                  <div style={{ fontWeight:900, fontSize:'1.3rem', color:meta.color, marginBottom:6 }}>Уровень {activeLevel} завершён!</div>
                  <div style={{ color:'#b0b0b0', fontSize:'0.85rem', fontWeight:700 }}>Переходи на следующий уровень</div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="right-col">

            {/* Daily Goal */}
            <div className="rcard">
              <div className="rcard-title">Дневная цель</div>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:48,height:48,borderRadius:14,background:'linear-gradient(135deg,#ff9600,#ff6b00)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.5rem',flexShrink:0,boxShadow:'0 3px 0 #cc5200' }}>
                  ⚡
                </div>
                <div style={{ flex:1 }}>
                  <div className="progress-row">
                    <span style={{ fontWeight:900, fontSize:'0.9rem' }}>{xp % 50} / 50 XP</span>
                    <span style={{ fontSize:'0.72rem', color:'#b0b0b0', fontWeight:700 }}>сегодня</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width:`${Math.min((xp%50)/50*100,100)}%`, background:'linear-gradient(90deg,#ffc107,#ff8800)' }}/>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="rcard">
              <div className="rcard-title">Мой прогресс</div>

              <div className="progress-row" style={{ marginBottom:4 }}>
                <span className="progress-label">Весь курс</span>
                <span className="progress-count">{completedCount}/{totalLessons}</span>
              </div>
              <div className="bar-track" style={{ marginBottom:20 }}>
                <div className="bar-fill" style={{ width:`${totalLessons>0?completedCount/totalLessons*100:0}%`, background:'linear-gradient(90deg,#58cc02,#1cb0f6)' }}/>
              </div>

              {(['A','B','C'] as const).map(lvl => {
                const m = LEVEL_META[lvl]
                const lvlLes = lessons.filter(l=>l.level===lvl)
                const done = lvlLes.filter(l=>getStatus(l.id)==='completed').length
                const pct = lvlLes.length > 0 ? done/lvlLes.length*100 : 0
                return (
                  <div key={lvl} className="level-prog-item">
                    <div className="progress-row">
                      <span className="progress-label" style={{ color:m.color }}>{m.emoji} Уровень {lvl}</span>
                      <span className="progress-count">{done}/{lvlLes.length}</span>
                    </div>
                    <div className="bar-track" style={{ height:8 }}>
                      <div className="bar-fill" style={{ width:`${pct}%`, background:m.gradient }}/>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Streak */}
            <div className="streak-rcard">
              <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:12 }}>
                <div style={{ width:52,height:52,borderRadius:16,background:'linear-gradient(135deg,#ff9600,#ff6b00)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.8rem',boxShadow:'0 3px 0 #cc5200',flexShrink:0 }}>
                  🔥
                </div>
                <div>
                  <div style={{ fontWeight:900, fontSize:'1.8rem', color:'#ff9600', lineHeight:1 }}>{streak}</div>
                  <div style={{ fontSize:'0.72rem', color:'#b08030', fontWeight:700, marginTop:2 }}>дней подряд</div>
                </div>
              </div>
              <div style={{ fontSize:'0.8rem', color:'#907040', lineHeight:1.6, fontWeight:600 }}>
                Учись каждый день и не теряй streak!<br/>
                Рекорд: <span style={{ color:'#ff9600', fontWeight:900 }}>{profile?.longest_streak || 0} дней</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
