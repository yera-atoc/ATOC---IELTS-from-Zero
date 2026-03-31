'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type Lesson = { id: number; level: string; lesson_number: number; title: string; grammar_topic: string; pdf_url: string | null }
type Progress = { lesson_id: number; status: string }
type Profile = { full_name: string; email: string; streak?: number; longest_streak?: number }

const LEVEL_META: Record<string, { color: string; bg: string; emoji: string; name: string }> = {
  A: { color: '#58cc02', bg: '#1a2e0a', emoji: '🌱', name: 'Beginner' },
  B: { color: '#1cb0f6', bg: '#0a1e2e', emoji: '⚡', name: 'Intermediate' },
  C: { color: '#ce93d8', bg: '#1e0a2e', emoji: '🔥', name: 'Advanced' },
}

export default function Dashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [progress, setProgress] = useState<Progress[]>([])
  const [activeLevel, setActiveLevel] = useState('A')
  const [loading, setLoading] = useState(true)
  const [xp, setXp] = useState(0)

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
      setProfile(prof)
      setLessons(les || [])
      setProgress(prog || [])
      const done = (prog || []).filter((p: any) => p.status === 'completed').length
      setXp(done * 10)
      setLoading(false)
    }
    load()
  }, [router])

  const getStatus = (id: number) => progress.find(p => p.lesson_id === id)?.status || 'not_started'
  const completedCount = progress.filter(p => p.status === 'completed').length
  const totalLessons = lessons.length
  const pct = totalLessons > 0 ? Math.round(completedCount / totalLessons * 100) : 0
  const levelLessons = lessons.filter(l => l.level === activeLevel)
  const streak = profile?.streak || 0

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth')
  }

  // Find first non-completed lesson in active level
  const nextLessonIdx = levelLessons.findIndex(l => getStatus(l.id) !== 'completed')

  if (loading) return (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',background:'#0a0a0f',fontFamily:'Nunito,sans-serif',color:'#5a5a7a',fontSize:'1.1rem' }}>
      Загрузка...
    </div>
  )

  const meta = LEVEL_META[activeLevel]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Syne:wght@700;800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        html,body { font-family:'Nunito',sans-serif; background:#111827; color:#f9fafb; min-height:100vh; }
        ::-webkit-scrollbar { width:6px; }
        ::-webkit-scrollbar-thumb { background:#2a2a40; border-radius:99px; }
        
        /* SIDEBAR */
        .sidebar { position:fixed; left:0; top:0; bottom:0; width:260px; background:#131f2e; border-right:2px solid rgba(255,255,255,0.06); display:flex; flex-direction:column; z-index:100; }
        .sidebar-logo { padding:24px 24px 20px; font-family:'Syne',sans-serif; font-size:1.5rem; font-weight:800; }
        .sidebar-logo span { color:#58cc02; }
        .nav-item { display:flex; align-items:center; gap:14px; padding:14px 20px; margin:2px 12px; border-radius:14px; cursor:pointer; font-weight:700; font-size:0.95rem; color:#9ca3af; transition:all 0.15s; text-decoration:none; border:2px solid transparent; }
        .nav-item:hover { background:rgba(255,255,255,0.05); color:#f9fafb; }
        .nav-item.active { background:rgba(88,204,2,0.12); color:#58cc02; border-color:rgba(88,204,2,0.2); }
        .nav-icon { width:32px; height:32px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1.1rem; flex-shrink:0; }
        .sidebar-bottom { margin-top:auto; padding:16px; }
        .streak-widget { background:rgba(255,136,0,0.1); border:2px solid rgba(255,136,0,0.2); border-radius:16px; padding:14px 16px; display:flex; align-items:center; gap:12px; }
        
        /* TOP BAR */
        .topbar { position:fixed; top:0; left:260px; right:0; height:64px; background:#111827; border-bottom:2px solid rgba(255,255,255,0.06); display:flex; align-items:center; justify-content:flex-end; padding:0 32px; gap:24px; z-index:99; }
        .xp-badge { display:flex; align-items:center; gap:6px; font-weight:800; font-size:0.95rem; color:#ffc107; }
        .streak-badge { display:flex; align-items:center; gap:6px; font-weight:800; font-size:0.95rem; color:#ff8800; }
        .hearts { display:flex; align-items:center; gap:4px; font-weight:800; color:#ff4757; }
        
        /* MAIN */
        .main { margin-left:260px; padding-top:64px; min-height:100vh; }
        .content { max-width:680px; margin:0 auto; padding:32px 24px; }
        
        /* LEVEL TABS */
        .level-tabs { display:flex; gap:10px; margin-bottom:28px; }
        .level-tab { flex:1; padding:14px 12px; border-radius:16px; cursor:pointer; border:2px solid transparent; text-align:center; transition:all 0.2s; }
        .level-tab.active { transform:scale(1.03); }
        
        /* PATH */
        .path { display:flex; flex-direction:column; align-items:center; gap:0; padding-bottom:48px; }
        .path-section { text-align:center; width:100%; margin-bottom:8px; padding:12px 20px; border-radius:14px; font-weight:800; font-size:0.82rem; letter-spacing:1px; text-transform:uppercase; }
        
        .lesson-node { position:relative; display:flex; flex-direction:column; align-items:center; margin:6px 0; }
        .lesson-bubble { width:72px; height:72px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.6rem; cursor:pointer; transition:all 0.2s; border:4px solid transparent; position:relative; text-decoration:none; }
        .lesson-bubble:hover { transform:scale(1.1); }
        .lesson-bubble.current { animation:bounce-soft 2s ease-in-out infinite; box-shadow:0 0 0 6px rgba(88,204,2,0.2); }
        .lesson-bubble.done { opacity:0.75; }
        .lesson-bubble.locked { cursor:default; opacity:0.4; filter:grayscale(0.5); }
        .lesson-bubble.locked:hover { transform:none; }
        
        .lesson-label { margin-top:8px; font-size:0.78rem; font-weight:700; color:#6b7280; text-align:center; max-width:100px; line-height:1.3; }
        .lesson-label.current { color:#f9fafb; font-weight:800; }
        
        .connector { width:3px; height:28px; background:rgba(255,255,255,0.08); border-radius:99px; }
        .connector.done { background:rgba(88,204,2,0.3); }
        
        /* START BANNER */
        .start-banner { background:linear-gradient(135deg,#1a3a0a,#0f2a05); border:2px solid #58cc02; border-radius:20px; padding:20px 24px; margin-bottom:28px; display:flex; align-items:center; gap:16px; }
        
        /* RIGHT PANEL */
        .right-panel { position:fixed; right:0; top:64px; bottom:0; width:340px; padding:24px; overflow-y:auto; border-left:2px solid rgba(255,255,255,0.06); background:#111827; }
        
        @keyframes bounce-soft { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .fade { animation:fadeUp 0.3s ease both; }
        
        @media (max-width:1100px) { .right-panel { display:none; } }
        @media (max-width:768px) { .sidebar{display:none} .main{margin-left:0} .topbar{left:0} }
      `}</style>

      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="sidebar-logo">Ato<span>C</span> · IELTS</div>

        <nav style={{ flex:1, padding:'0 0 16px' }}>
          {[
            { icon:'🏠', label:'Обучение', active:true },
            { icon:'📊', label:'Рейтинги', active:false },
            { icon:'📚', label:'Словарь', active:false },
            { icon:'👤', label:'Профиль', active:false },
          ].map(item => (
            <div key={item.label} className={`nav-item ${item.active?'active':''}`}>
              <div className="nav-icon" style={{ background:item.active?'rgba(88,204,2,0.15)':'rgba(255,255,255,0.05)' }}>{item.icon}</div>
              {item.label}
            </div>
          ))}

          <div style={{ margin:'16px 12px 8px',height:1,background:'rgba(255,255,255,0.06)'}}/>

          <div className="nav-item" onClick={handleLogout} style={{ color:'#6b7280' }}>
            <div className="nav-icon" style={{ background:'rgba(255,255,255,0.04)' }}>🚪</div>
            Выйти
          </div>
        </nav>

        <div className="sidebar-bottom">
          <div className="streak-widget">
            <span style={{ fontSize:'1.8rem' }}>🔥</span>
            <div>
              <div style={{ fontWeight:900,fontSize:'1.2rem',color:'#ff8800' }}>{streak} дней</div>
              <div style={{ fontSize:'0.75rem',color:'#9ca3af',fontWeight:600 }}>Streak подряд</div>
            </div>
          </div>
        </div>
      </div>

      {/* TOPBAR */}
      <div className="topbar">
        <div className="streak-badge">🔥 {streak}</div>
        <div className="xp-badge">⚡ {xp} XP</div>
        <div className="hearts">❤️ {Math.max(0, 5 - Math.floor((totalLessons - completedCount) / 10))}</div>
        <div style={{ width:1,height:24,background:'rgba(255,255,255,0.1)',margin:'0 4px'}}/>
        <span style={{ fontSize:'0.85rem',color:'#6b7280',fontWeight:700 }}>{profile?.full_name || 'Студент'}</span>
      </div>

      {/* MAIN */}
      <div className="main">
        <div className="content">

          {/* Level tabs */}
          <div className="level-tabs fade">
            {(['A','B','C'] as const).map(lvl => {
              const m = LEVEL_META[lvl]
              const lvlLes = lessons.filter(l => l.level === lvl)
              const lvlDone = lvlLes.filter(l => getStatus(l.id) === 'completed').length
              const isActive = activeLevel === lvl
              return (
                <div key={lvl} className={`level-tab ${isActive?'active':''}`}
                  onClick={() => setActiveLevel(lvl)}
                  style={{ background:isActive?m.bg:'rgba(255,255,255,0.03)', borderColor:isActive?m.color:'rgba(255,255,255,0.06)', color:isActive?m.color:'#6b7280' }}>
                  <div style={{ fontSize:'1.4rem',marginBottom:4 }}>{m.emoji}</div>
                  <div style={{ fontWeight:900,fontSize:'0.9rem' }}>Уровень {lvl}</div>
                  <div style={{ fontSize:'0.72rem',marginTop:2,opacity:0.7 }}>{m.name}</div>
                  <div style={{ fontSize:'0.72rem',fontWeight:700,marginTop:4 }}>{lvlDone}/{lvlLes.length}</div>
                </div>
              )
            })}
          </div>

          {/* Section banner */}
          <div className="start-banner fade" style={{ background:`linear-gradient(135deg,${meta.bg},rgba(0,0,0,0.3))`, borderColor:meta.color }}>
            <span style={{ fontSize:'2.5rem' }}>{meta.emoji}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'0.72rem',fontWeight:800,letterSpacing:1.5,textTransform:'uppercase',color:meta.color,marginBottom:4 }}>
                УРОВЕНЬ {activeLevel} · {meta.name.toUpperCase()}
              </div>
              <div style={{ fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'1.1rem',color:'#f9fafb' }}>
                {activeLevel === 'A' ? 'Основы английского для IELTS' : activeLevel === 'B' ? 'Средний уровень — Band 5.5–6.5' : 'Продвинутый — Band 7+'}
              </div>
              <div style={{ fontSize:'0.8rem',color:'#9ca3af',marginTop:4 }}>
                {levelLessons.filter(l=>getStatus(l.id)==='completed').length} из {levelLessons.length} уроков пройдено
              </div>
            </div>
            {/* Progress circle */}
            <div style={{ position:'relative',width:52,height:52,flexShrink:0 }}>
              <svg width="52" height="52" style={{ transform:'rotate(-90deg)' }}>
                <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4"/>
                <circle cx="26" cy="26" r="22" fill="none" stroke={meta.color} strokeWidth="4"
                  strokeDasharray={`${2*Math.PI*22}`}
                  strokeDashoffset={`${2*Math.PI*22*(1-levelLessons.filter(l=>getStatus(l.id)==='completed').length/Math.max(levelLessons.length,1))}`}
                  strokeLinecap="round" style={{ transition:'stroke-dashoffset 0.6s ease' }}/>
              </svg>
              <div style={{ position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'0.75rem',color:meta.color }}>
                {Math.round(levelLessons.filter(l=>getStatus(l.id)==='completed').length/Math.max(levelLessons.length,1)*100)}%
              </div>
            </div>
          </div>

          {/* PATH */}
          <div className="path fade">
            {levelLessons.map((lesson, i) => {
              const status = getStatus(lesson.id)
              const isCurrent = i === nextLessonIdx
              const isDone = status === 'completed'
              const isLocked = !isDone && !isCurrent && i > nextLessonIdx

              // Zigzag offset
              const offsets = [0, 60, 100, 60, 0, -60, -100, -60]
              const offset = offsets[i % 8]

              const bubbleStyle = isDone
                ? { background:`linear-gradient(135deg,${meta.color},${meta.color}cc)`, borderColor:`${meta.color}80` }
                : isCurrent
                ? { background:`linear-gradient(135deg,${meta.color},${meta.color}aa)`, borderColor:meta.color, boxShadow:`0 0 24px ${meta.color}60` }
                : { background:'#1f2937', borderColor:'rgba(255,255,255,0.1)' }

              return (
                <div key={lesson.id} className="lesson-node" style={{ marginLeft:offset }}>
                  {i > 0 && <div className={`connector ${isDone?'done':''}`}/>}

                  <Link href={isLocked ? '#' : `/lesson/${lesson.id}`}
                    className={`lesson-bubble ${isCurrent?'current':''} ${isDone?'done':''} ${isLocked?'locked':''}`}
                    style={bubbleStyle}
                    onClick={e => isLocked && e.preventDefault()}>
                    {isDone ? '⭐' : isCurrent ? '▶' : isLocked ? '🔒' : '○'}

                    {/* Current indicator */}
                    {isCurrent && (
                      <div style={{ position:'absolute',top:-36,left:'50%',transform:'translateX(-50%)',background:meta.color,color:'#000',fontWeight:900,fontSize:'0.72rem',padding:'4px 10px',borderRadius:99,whiteSpace:'nowrap',letterSpacing:0.5 }}>
                        НАЧАТЬ
                      </div>
                    )}
                  </Link>

                  <div className={`lesson-label ${isCurrent?'current':''}`}>
                    <div style={{ fontSize:'0.7rem',color:meta.color,fontWeight:800,marginBottom:2 }}>{lesson.level}{lesson.lesson_number}</div>
                    {lesson.grammar_topic?.split('·')[0]?.trim() || lesson.title}
                  </div>
                </div>
              )
            })}

            {/* Level complete */}
            {levelLessons.every(l => getStatus(l.id) === 'completed') && levelLessons.length > 0 && (
              <div style={{ marginTop:24, textAlign:'center' }}>
                <div style={{ fontSize:'3rem',marginBottom:8 }}>🏆</div>
                <div style={{ fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'1.2rem',color:meta.color }}>Уровень {activeLevel} пройден!</div>
                <div style={{ color:'#6b7280',fontSize:'0.85rem',marginTop:4 }}>Переходи на следующий уровень</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="right-panel">

        {/* Daily goal */}
        <div style={{ background:'#1f2937',borderRadius:16,padding:'18px',marginBottom:16,border:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize:'0.72rem',fontWeight:800,letterSpacing:1.5,color:'#6b7280',textTransform:'uppercase',marginBottom:12 }}>ДНЕВНАЯ ЦЕЛЬ</div>
          <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:10 }}>
            <span style={{ fontSize:'1.5rem' }}>⚡</span>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex',justifyContent:'space-between',marginBottom:4 }}>
                <span style={{ fontSize:'0.82rem',fontWeight:700 }}>{xp % 50} / 50 XP</span>
                <span style={{ fontSize:'0.75rem',color:'#6b7280' }}>сегодня</span>
              </div>
              <div style={{ background:'rgba(255,255,255,0.08)',borderRadius:99,height:8,overflow:'hidden' }}>
                <div style={{ height:'100%',width:`${Math.min((xp%50)/50*100,100)}%`,background:'linear-gradient(90deg,#ffc107,#ff8800)',borderRadius:99,transition:'width 0.4s' }}/>
              </div>
            </div>
          </div>
        </div>

        {/* Overall progress */}
        <div style={{ background:'#1f2937',borderRadius:16,padding:'18px',marginBottom:16,border:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize:'0.72rem',fontWeight:800,letterSpacing:1.5,color:'#6b7280',textTransform:'uppercase',marginBottom:14 }}>МОЙ ПРОГРЕСС</div>
          <div style={{ display:'flex',justifyContent:'space-between',marginBottom:6 }}>
            <span style={{ fontSize:'0.88rem',fontWeight:700 }}>Общий курс</span>
            <span style={{ fontSize:'0.82rem',color:'#6b7280' }}>{completedCount}/{totalLessons}</span>
          </div>
          <div style={{ background:'rgba(255,255,255,0.08)',borderRadius:99,height:10,overflow:'hidden',marginBottom:16 }}>
            <div style={{ height:'100%',width:`${pct}%`,background:'linear-gradient(90deg,#58cc02,#00d4aa)',borderRadius:99,transition:'width 0.6s' }}/>
          </div>
          {['A','B','C'].map(lvl => {
            const m = LEVEL_META[lvl]
            const lvlLes = lessons.filter(l => l.level === lvl)
            const done = lvlLes.filter(l => getStatus(l.id) === 'completed').length
            return (
              <div key={lvl} style={{ marginBottom:10 }}>
                <div style={{ display:'flex',justifyContent:'space-between',marginBottom:4 }}>
                  <span style={{ fontSize:'0.78rem',fontWeight:700,color:m.color }}>{m.emoji} Уровень {lvl}</span>
                  <span style={{ fontSize:'0.72rem',color:'#6b7280' }}>{done}/{lvlLes.length}</span>
                </div>
                <div style={{ background:'rgba(255,255,255,0.06)',borderRadius:99,height:6,overflow:'hidden' }}>
                  <div style={{ height:'100%',width:`${lvlLes.length>0?done/lvlLes.length*100:0}%`,background:m.color,borderRadius:99,transition:'width 0.5s' }}/>
                </div>
              </div>
            )
          })}
        </div>

        {/* Streak */}
        <div style={{ background:'linear-gradient(135deg,#2d1a00,#1a0f00)',borderRadius:16,padding:'18px',border:'2px solid rgba(255,136,0,0.2)' }}>
          <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:8 }}>
            <span style={{ fontSize:'2rem' }}>🔥</span>
            <div>
              <div style={{ fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'1.4rem',color:'#ff8800' }}>{streak} дней</div>
              <div style={{ fontSize:'0.75rem',color:'#9ca3af' }}>Streak подряд</div>
            </div>
          </div>
          <div style={{ fontSize:'0.78rem',color:'#9ca3af',lineHeight:1.5 }}>
            Учись каждый день чтобы не потерять streak! Лучший результат: <span style={{ color:'#ff8800',fontWeight:700 }}>{profile?.longest_streak || 0} дней</span>
          </div>
        </div>
      </div>
    </>
  )
}
