'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type Lesson = { id: number; level: string; lesson_number: number; title: string; grammar_topic: string; pdf_url: string | null }
type Progress = { lesson_id: number; status: string }
type Profile = { full_name: string; email: string; streak?: number; longest_streak?: number }

const LEVEL_META: Record<string, { color: string; light: string; border: string; emoji: string; name: string; desc: string }> = {
  A: { color: '#58cc02', light: '#f0fde4', border: '#89e219', emoji: '🌱', name: 'Beginner', desc: 'Основы английского' },
  B: { color: '#1cb0f6', light: '#e8f7ff', border: '#6dcff6', emoji: '⚡', name: 'Intermediate', desc: 'Band 5.5–6.5' },
  C: { color: '#9b59b6', light: '#f5eeff', border: '#c39bd3', emoji: '🔥', name: 'Advanced', desc: 'Band 7+' },
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
    <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',background:'#fff',fontFamily:'Nunito,sans-serif',color:'#afafaf',fontSize:'1.1rem',fontWeight:700 }}>
      Загрузка...
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Syne:wght@700;800&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html, body { font-family:'Nunito',sans-serif; background:#f7f7f7; color:#3c3c3c; min-height:100vh; }
        ::-webkit-scrollbar { width:6px; }
        ::-webkit-scrollbar-thumb { background:#e5e5e5; border-radius:99px; }

        .sidebar {
          position:fixed; left:0; top:0; bottom:0; width:256px;
          background:#fff; border-right:2px solid #e5e5e5;
          display:flex; flex-direction:column; z-index:100;
        }
        .logo { padding:24px 28px 20px; font-family:'Syne',sans-serif; font-weight:800; font-size:1.6rem; color:#3c3c3c; letter-spacing:-0.5px; }
        .logo span { color:#58cc02; }

        .nav-item {
          display:flex; align-items:center; gap:14px;
          padding:13px 20px; margin:2px 12px; border-radius:14px;
          cursor:pointer; font-weight:800; font-size:0.9rem;
          color:#afafaf; transition:all 0.15s; text-decoration:none;
          border:2px solid transparent; letter-spacing:0.3px;
          text-transform:uppercase;
        }
        .nav-item:hover { background:#f7f7f7; color:#3c3c3c; }
        .nav-item.on { background:#ddf4c1; color:#58cc02; border-color:#b8e87a; }
        .nav-icon { font-size:1.3rem; width:28px; text-align:center; flex-shrink:0; }

        .topbar {
          position:fixed; top:0; left:256px; right:0; height:60px;
          background:#fff; border-bottom:2px solid #e5e5e5;
          display:flex; align-items:center; justify-content:flex-end;
          padding:0 32px; gap:28px; z-index:99;
        }
        .top-stat { display:flex; align-items:center; gap:6px; font-weight:800; font-size:1rem; }

        .main { margin-left:256px; padding-top:60px; }
        .center { max-width:640px; margin:0 auto; padding:32px 20px 80px; }
        .right { position:fixed; top:60px; right:0; bottom:0; width:320px; padding:24px 20px; overflow-y:auto; border-left:2px solid #e5e5e5; background:#fff; }

        .level-tabs { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:24px; }
        .level-tab {
          padding:16px 12px; border-radius:18px; cursor:pointer;
          border:3px solid #e5e5e5; text-align:center;
          background:#fff; transition:all 0.2s; font-weight:800;
        }
        .level-tab:hover { border-color:#c8c8c8; transform:translateY(-1px); }
        .level-tab.on { transform:translateY(-2px); box-shadow:0 4px 0 rgba(0,0,0,0.08); }

        .unit-banner {
          border-radius:18px; padding:20px 24px; margin-bottom:28px;
          border-bottom:4px solid rgba(0,0,0,0.12);
          display:flex; align-items:center; gap:16px;
        }

        .path { display:flex; flex-direction:column; align-items:center; padding-bottom:48px; }
        .node-wrap { display:flex; flex-direction:column; align-items:center; }
        .connector-line { width:3px; height:24px; border-radius:99px; }

        .bubble {
          width:76px; height:76px; border-radius:50%;
          display:flex; align-items:center; justify-content:center;
          font-size:1.8rem; cursor:pointer; transition:all 0.18s;
          border:4px solid transparent; position:relative;
          text-decoration:none; border-bottom:6px solid transparent;
        }
        .bubble:hover:not(.locked) { transform:scale(1.08); }
        .bubble.current { animation:bob 1.8s ease-in-out infinite; }
        .bubble.locked { cursor:default; filter:grayscale(1); opacity:0.4; }
        .bubble.locked:hover { transform:none !important; }

        .start-tag {
          position:absolute; top:-40px; left:50%; transform:translateX(-50%);
          background:#fff; color:#3c3c3c; font-weight:900; font-size:0.75rem;
          padding:5px 14px; border-radius:99px; white-space:nowrap;
          border:2px solid #e5e5e5; box-shadow:0 2px 8px rgba(0,0,0,0.1);
          letter-spacing:1px;
        }
        .node-label { margin-top:10px; text-align:center; max-width:110px; }
        .node-label .num { font-size:0.7rem; font-weight:800; letter-spacing:1px; text-transform:uppercase; margin-bottom:2px; }
        .node-label .topic { font-size:0.78rem; font-weight:700; color:#afafaf; line-height:1.3; }
        .node-label.current .topic { color:#3c3c3c; }

        .rcard { background:#fff; border:2px solid #e5e5e5; border-radius:16px; padding:18px; margin-bottom:14px; border-bottom:4px solid #e5e5e5; }
        .rcard-title { font-size:0.68rem; font-weight:800; letter-spacing:1.5px; text-transform:uppercase; color:#afafaf; margin-bottom:12px; }
        .bar-wrap { background:#f0f0f0; border-radius:99px; height:10px; overflow:hidden; }
        .bar-fill { height:100%; border-radius:99px; transition:width 0.5s ease; }

        .sidebar-bottom { margin-top:auto; padding:16px; }
        .streak-card { background:#fff7e6; border:2px solid #ffd080; border-radius:16px; padding:14px 16px; display:flex; align-items:center; gap:12px; border-bottom:4px solid #ffd080; }

        @keyframes bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .fade { animation:fadeUp 0.3s ease both; }

        @media (max-width:1100px) { .right { display:none; } }
        @media (max-width:768px) { .sidebar{display:none} .main{margin-left:0} .topbar{left:0} }
      `}</style>

      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="logo">Ato<span>C</span></div>

        <nav style={{ flex:1 }}>
          {[
            { icon:'🏠', label:'Обучение', on:true },
            { icon:'🏆', label:'Рейтинги', on:false },
            { icon:'📚', label:'Словарь', on:false },
            { icon:'👤', label:'Профиль', on:false },
          ].map(item => (
            <div key={item.label} className={`nav-item ${item.on?'on':''}`}>
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </div>
          ))}

          <div style={{ margin:'12px 12px 0',height:2,background:'#f0f0f0',borderRadius:99 }}/>

          <div className="nav-item" style={{ marginTop:4 }} onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            Выйти
          </div>
        </nav>

        <div className="sidebar-bottom">
          <div className="streak-card">
            <span style={{ fontSize:'2rem' }}>🔥</span>
            <div>
              <div style={{ fontWeight:900,fontSize:'1.3rem',color:'#ff9600',fontFamily:'Syne,sans-serif' }}>{streak} дней</div>
              <div style={{ fontSize:'0.75rem',color:'#afafaf',fontWeight:700 }}>Streak подряд</div>
            </div>
          </div>
        </div>
      </div>

      {/* TOPBAR */}
      <div className="topbar">
        <div className="top-stat" style={{ color:'#ff9600' }}>🔥 <span>{streak}</span></div>
        <div className="top-stat" style={{ color:'#1cb0f6' }}>⚡ <span>{xp} XP</span></div>
        <div className="top-stat" style={{ color:'#ff4757' }}>❤️ <span>5</span></div>
        <div style={{ width:2,height:24,background:'#e5e5e5' }}/>
        <span style={{ fontSize:'0.88rem',color:'#afafaf',fontWeight:800 }}>{profile?.full_name?.split(' ')[0] || 'Студент'}</span>
      </div>

      {/* MAIN */}
      <div className="main">
        <div className="center">

          {/* Level tabs */}
          <div className="level-tabs fade">
            {(['A','B','C'] as const).map(lvl => {
              const m = LEVEL_META[lvl]
              const lvlLes = lessons.filter(l => l.level === lvl)
              const done = lvlLes.filter(l => getStatus(l.id) === 'completed').length
              const isOn = activeLevel === lvl
              return (
                <div key={lvl} className={`level-tab ${isOn?'on':''}`}
                  onClick={() => setActiveLevel(lvl)}
                  style={{ borderColor:isOn?m.border:'#e5e5e5', background:isOn?m.light:'#fff', boxShadow:isOn?`0 4px 0 ${m.border}`:'0 4px 0 #e5e5e5' }}>
                  <div style={{ fontSize:'1.6rem',marginBottom:6 }}>{m.emoji}</div>
                  <div style={{ fontSize:'0.85rem',fontWeight:900,color:isOn?m.color:'#afafaf' }}>Уровень {lvl}</div>
                  <div style={{ fontSize:'0.7rem',color:'#afafaf',marginTop:2,fontWeight:700 }}>{m.name}</div>
                  <div style={{ fontSize:'0.72rem',fontWeight:800,color:isOn?m.color:'#c8c8c8',marginTop:6 }}>{done}/{lvlLes.length}</div>
                </div>
              )
            })}
          </div>

          {/* Unit banner */}
          <div className="unit-banner fade" style={{ background:meta.light, borderColor:meta.border, borderBottom:`4px solid ${meta.border}` }}>
            <div style={{ width:52,height:52,borderRadius:16,background:meta.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.8rem',flexShrink:0,boxShadow:`0 4px 0 ${meta.border}` }}>
              {meta.emoji}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'0.7rem',fontWeight:900,letterSpacing:1.5,textTransform:'uppercase',color:meta.color,marginBottom:4 }}>
                УРОВЕНЬ {activeLevel} · {meta.name.toUpperCase()}
              </div>
              <div style={{ fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'1.1rem',color:'#3c3c3c' }}>{meta.desc}</div>
              <div style={{ fontSize:'0.8rem',color:'#afafaf',marginTop:3,fontWeight:700 }}>
                {levelLessons.filter(l=>getStatus(l.id)==='completed').length} из {levelLessons.length} уроков
              </div>
            </div>
            {/* Mini ring */}
            <svg width="48" height="48" style={{ flexShrink:0, transform:'rotate(-90deg)' }}>
              <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="4"/>
              <circle cx="24" cy="24" r="20" fill="none" stroke={meta.color} strokeWidth="4"
                strokeDasharray={`${2*Math.PI*20}`}
                strokeDashoffset={`${2*Math.PI*20*(1-levelLessons.filter(l=>getStatus(l.id)==='completed').length/Math.max(levelLessons.length,1))}`}
                strokeLinecap="round" style={{ transition:'stroke-dashoffset 0.6s ease' }}/>
            </svg>
          </div>

          {/* PATH */}
          <div className="path fade">
            {levelLessons.map((lesson, i) => {
              const status = getStatus(lesson.id)
              const isCurrent = i === nextLessonIdx
              const isDone = status === 'completed'
              const isLocked = !isDone && i > nextLessonIdx

              // Zigzag
              const pattern = [0, 70, 110, 70, 0, -70, -110, -70]
              const offset = pattern[i % 8]

              return (
                <div key={lesson.id} className="node-wrap" style={{ marginLeft:offset }}>
                  {i > 0 && (
                    <div className="connector-line" style={{ background: isDone ? meta.color : '#e5e5e5', opacity: isDone ? 0.5 : 1 }}/>
                  )}

                  <div style={{ position:'relative', marginTop:4 }}>
                    {isCurrent && <div className="start-tag" style={{ color:meta.color, borderColor:meta.border }}>НАЧАТЬ</div>}

                    <Link href={isLocked ? '#' : `/lesson/${lesson.id}`}
                      className={`bubble ${isCurrent?'current':''} ${isDone?'done':''} ${isLocked?'locked':''}`}
                      onClick={e => isLocked && e.preventDefault()}
                      style={{
                        background: isDone ? meta.color : isCurrent ? meta.color : '#e5e5e5',
                        borderColor: isDone ? meta.border : isCurrent ? meta.border : '#d0d0d0',
                        borderBottomColor: isDone ? meta.border : isCurrent ? meta.border : '#c0c0c0',
                        boxShadow: isCurrent ? `0 0 0 6px ${meta.light}, 0 0 0 8px ${meta.border}` : 'none',
                      }}>
                      {isDone ? '⭐' : isCurrent ? '▶' : isLocked ? '🔒' : '⬤'}
                    </Link>
                  </div>

                  <div className={`node-label ${isCurrent?'current':''}`}>
                    <div className="num" style={{ color: isDone || isCurrent ? meta.color : '#c8c8c8' }}>
                      {lesson.level}{lesson.lesson_number}
                    </div>
                    <div className="topic">{lesson.grammar_topic?.split('·')[0]?.trim() || lesson.title}</div>
                  </div>
                </div>
              )
            })}

            {levelLessons.length > 0 && levelLessons.every(l => getStatus(l.id) === 'completed') && (
              <div style={{ textAlign:'center',marginTop:32 }}>
                <div style={{ fontSize:'3rem',marginBottom:10 }}>🏆</div>
                <div style={{ fontFamily:'Syne,sans-serif',fontWeight:900,fontSize:'1.2rem',color:meta.color }}>Уровень {activeLevel} завершён!</div>
                <div style={{ color:'#afafaf',fontSize:'0.85rem',marginTop:4,fontWeight:700 }}>Переходи на следующий уровень</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="right">

        {/* XP goal */}
        <div className="rcard">
          <div className="rcard-title">Дневная цель</div>
          <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:10 }}>
            <span style={{ fontSize:'1.8rem' }}>⚡</span>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex',justifyContent:'space-between',marginBottom:6 }}>
                <span style={{ fontWeight:800,fontSize:'0.88rem' }}>{xp % 50} / 50 XP</span>
                <span style={{ fontSize:'0.75rem',color:'#afafaf',fontWeight:700 }}>сегодня</span>
              </div>
              <div className="bar-wrap">
                <div className="bar-fill" style={{ width:`${Math.min((xp%50)/50*100,100)}%`, background:'linear-gradient(90deg,#ffc107,#ff8800)' }}/>
              </div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="rcard">
          <div className="rcard-title">Мой прогресс</div>
          <div style={{ display:'flex',justifyContent:'space-between',marginBottom:6 }}>
            <span style={{ fontWeight:800,fontSize:'0.88rem' }}>Весь курс</span>
            <span style={{ fontSize:'0.8rem',color:'#afafaf',fontWeight:700 }}>{completedCount}/{totalLessons}</span>
          </div>
          <div className="bar-wrap" style={{ marginBottom:18 }}>
            <div className="bar-fill" style={{ width:`${totalLessons>0?completedCount/totalLessons*100:0}%`, background:'linear-gradient(90deg,#58cc02,#1cb0f6)' }}/>
          </div>
          {(['A','B','C'] as const).map(lvl => {
            const m = LEVEL_META[lvl]
            const lvlLes = lessons.filter(l=>l.level===lvl)
            const done = lvlLes.filter(l=>getStatus(l.id)==='completed').length
            const pct = lvlLes.length > 0 ? done/lvlLes.length*100 : 0
            return (
              <div key={lvl} style={{ marginBottom:12 }}>
                <div style={{ display:'flex',justifyContent:'space-between',marginBottom:5 }}>
                  <span style={{ fontSize:'0.8rem',fontWeight:800,color:m.color }}>{m.emoji} Уровень {lvl}</span>
                  <span style={{ fontSize:'0.73rem',color:'#afafaf',fontWeight:700 }}>{done}/{lvlLes.length}</span>
                </div>
                <div className="bar-wrap" style={{ height:8 }}>
                  <div className="bar-fill" style={{ width:`${pct}%`, background:m.color }}/>
                </div>
              </div>
            )
          })}
        </div>

        {/* Streak */}
        <div className="rcard" style={{ background:'#fff7e6',borderColor:'#ffd080',borderBottomColor:'#ffc107' }}>
          <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:10 }}>
            <span style={{ fontSize:'2.2rem' }}>🔥</span>
            <div>
              <div style={{ fontFamily:'Syne,sans-serif',fontWeight:900,fontSize:'1.5rem',color:'#ff9600' }}>{streak} дней</div>
              <div style={{ fontSize:'0.75rem',color:'#afafaf',fontWeight:700 }}>Streak подряд</div>
            </div>
          </div>
          <div style={{ fontSize:'0.8rem',color:'#afafaf',lineHeight:1.55,fontWeight:600 }}>
            Учись каждый день и не теряй streak!<br/>
            Рекорд: <span style={{ color:'#ff9600',fontWeight:800 }}>{profile?.longest_streak || 0} дней</span>
          </div>
        </div>

      </div>
    </>
  )
}
