'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type Lesson = { id: number; level: string; lesson_number: number; title: string; grammar_topic: string; pdf_url: string | null }
type Progress = { lesson_id: number; status: string }
type Profile = { full_name: string; email: string }

const LEVEL_COLORS: Record<string, string> = { A: '#4fc3f7', B: '#81c784', C: '#ce93d8' }
const LEVEL_DESC: Record<string, string> = { A: 'Beginner → Pre-Intermediate', B: 'Intermediate', C: 'Upper-Intermediate → Advanced' }

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
      setProfile(prof)
      setLessons(les || [])
      setProgress(prog || [])
      setLoading(false)
    }
    load()
  }, [router])

  const getStatus = (id: number) => progress.find(p => p.lesson_id === id)?.status || 'not_started'
  const completedCount = progress.filter(p => p.status === 'completed').length
  const inProgressCount = progress.filter(p => p.status === 'in_progress').length
  const totalLessons = lessons.length
  const levelLessons = lessons.filter(l => l.level === activeLevel)
  const pct = totalLessons > 0 ? Math.round(completedCount / totalLessons * 100) : 0

  // Find next lesson to continue
  const nextLesson = lessons.find(l => getStatus(l.id) === 'in_progress') ||
    lessons.find(l => getStatus(l.id) === 'not_started')

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth')
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#0a0a0f' }}>
      <div style={{ textAlign:'center', color:'#5a5a72' }}>
        <div style={{ fontSize:'2rem', marginBottom:12 }}>⟳</div>
        <p>Загрузка...</p>
      </div>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin:0; padding:0; }
        body { font-family:'DM Sans',sans-serif; background:#0a0a0f; color:#f0f0f8; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .fade { animation: fadeUp 0.35s ease both; }
        .lesson-card { background:#0f0f18; border:1px solid rgba(255,255,255,0.06); border-radius:14px; padding:18px 20px; text-decoration:none; color:inherit; display:block; transition:all 0.2s; position:relative; overflow:hidden; }
        .lesson-card:hover { background:#141422; border-color:rgba(255,255,255,0.12); transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,0.3); }
        .level-tab { flex:1; padding:13px 8px; cursor:pointer; border:none; background:transparent; font-family:'DM Sans',sans-serif; font-size:0.85rem; font-weight:600; color:#5a5a72; border-radius:10px; transition:all 0.2s; text-align:center; }
        .level-tab.active { background:#1a1a28; color:#f0f0f8; }
      `}</style>

      {/* NAVBAR */}
      <nav style={{ position:'sticky', top:0, zIndex:100, background:'rgba(10,10,15,0.92)', backdropFilter:'blur(24px)', borderBottom:'1px solid rgba(255,255,255,0.05)', padding:'0 24px', height:58, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:'1.15rem', color:'#f0f0f8' }}>
          Ato<span style={{ color:'#7c6fff' }}>C</span> · IELTS
        </span>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:'0.83rem', color:'#5a5a72' }}>{profile?.full_name || profile?.email}</span>
          <button onClick={handleLogout} style={{ padding:'7px 14px', background:'#1a1a24', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, color:'#7070a0', cursor:'pointer', fontSize:'0.82rem', fontWeight:600 }}>
            Выйти
          </button>
        </div>
      </nav>

      <div style={{ maxWidth:960, margin:'0 auto', padding:'0 20px' }}>

        {/* HERO */}
        <div style={{ padding:'32px 0 24px' }} className="fade">
          <p style={{ fontSize:'0.8rem', fontWeight:700, letterSpacing:2, color:'#5a5a72', textTransform:'uppercase', marginBottom:8 }}>
            ДОБРО ПОЖАЛОВАТЬ
          </p>
          <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:'2rem', fontWeight:800, marginBottom:6 }}>
            {profile?.full_name?.split(' ')[0] || 'Студент'} 👋
          </h1>
          <p style={{ color:'#5a5a72', fontSize:'0.9rem' }}>
            {pct === 0 ? 'Начни первый урок — путь к IELTS Band 7+ начинается здесь' :
             pct < 50 ? `Отличный старт! Продолжай — ты уже прошёл ${pct}% курса` :
             pct < 100 ? `Ты почти у цели — осталось ${totalLessons - completedCount} уроков!` :
             '🏆 Курс пройден! Ты готов к IELTS!'}
          </p>

          {/* Continue button */}
          {nextLesson && (
            <Link href={`/lesson/${nextLesson.id}`}
              style={{ display:'inline-flex', alignItems:'center', gap:10, marginTop:18, padding:'12px 22px', background:'linear-gradient(135deg,#7c6fff,#5a4fd4)', borderRadius:12, color:'white', textDecoration:'none', fontWeight:700, fontSize:'0.9rem', boxShadow:'0 4px 20px rgba(124,111,255,0.35)' }}>
              {getStatus(nextLesson.id) === 'in_progress' ? '↻ Продолжить' : '▶ Начать'}
              &nbsp; {nextLesson.level}{nextLesson.lesson_number} · {nextLesson.title}
              <span style={{ opacity:0.7 }}>→</span>
            </Link>
          )}
        </div>

        {/* STATS */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }} className="fade">
          {[
            { n: completedCount, label:'Пройдено', color:'#7c6fff' },
            { n: inProgressCount, label:'В процессе', color:'#ffc107' },
            { n: totalLessons - completedCount - inProgressCount, label:'Не начато', color:'#3a3a52' },
            { n: `${pct}%`, label:'Прогресс', color:'#00d4aa' },
          ].map((s, i) => (
            <div key={i} style={{ background:'#0f0f18', border:'1px solid rgba(255,255,255,0.05)', borderRadius:14, padding:'18px 16px', textAlign:'center' }}>
              <div style={{ fontFamily:'Syne,sans-serif', fontSize:'1.8rem', fontWeight:800, color:s.color }}>{s.n}</div>
              <div style={{ fontSize:'0.75rem', color:'#5a5a72', marginTop:4, fontWeight:600 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* OVERALL PROGRESS */}
        <div style={{ background:'#0f0f18', border:'1px solid rgba(255,255,255,0.05)', borderRadius:14, padding:'18px 22px', marginBottom:24 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
            <span style={{ fontWeight:700, fontSize:'0.88rem', color:'#d0d0e8' }}>Общий прогресс курса</span>
            <span style={{ fontSize:'0.82rem', color:'#5a5a72' }}>{completedCount} / {totalLessons} уроков</span>
          </div>
          <div style={{ background:'#1a1a28', borderRadius:99, height:8, overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${pct}%`, background:'linear-gradient(90deg,#7c6fff,#00d4aa)', borderRadius:99, transition:'width 0.8s cubic-bezier(0.4,0,0.2,1)' }}/>
          </div>

          {/* Level breakdown */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginTop:16 }}>
            {['A','B','C'].map(lvl => {
              const lvlLes = lessons.filter(l => l.level === lvl)
              const lvlDone = lvlLes.filter(l => getStatus(l.id) === 'completed').length
              const lvlPct = lvlLes.length > 0 ? Math.round(lvlDone / lvlLes.length * 100) : 0
              return (
                <div key={lvl}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                    <span style={{ fontSize:'0.75rem', fontWeight:700, color:LEVEL_COLORS[lvl] }}>Уровень {lvl}</span>
                    <span style={{ fontSize:'0.72rem', color:'#3a3a52' }}>{lvlDone}/{lvlLes.length}</span>
                  </div>
                  <div style={{ background:'#1a1a28', borderRadius:99, height:4, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${lvlPct}%`, background:LEVEL_COLORS[lvl], borderRadius:99, transition:'width 0.6s ease' }}/>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* LEVEL TABS */}
        <div style={{ display:'flex', gap:4, background:'#0c0c16', borderRadius:14, padding:4, border:'1px solid rgba(255,255,255,0.05)', marginBottom:20 }}>
          {['A','B','C'].map(lvl => {
            const lvlLes = lessons.filter(l => l.level === lvl)
            const lvlDone = lvlLes.filter(l => getStatus(l.id) === 'completed').length
            return (
              <button key={lvl} className={`level-tab ${activeLevel === lvl ? 'active' : ''}`}
                onClick={() => setActiveLevel(lvl)}>
                <div style={{ color: activeLevel === lvl ? LEVEL_COLORS[lvl] : undefined, fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:'0.9rem' }}>
                  Уровень {lvl}
                </div>
                <div style={{ fontSize:'0.72rem', opacity:0.6, marginTop:2 }}>{LEVEL_DESC[lvl]}</div>
                <div style={{ fontSize:'0.7rem', color: activeLevel === lvl ? LEVEL_COLORS[lvl] : '#3a3a52', marginTop:1, fontWeight:700 }}>
                  {lvlDone}/{lvlLes.length}
                </div>
              </button>
            )
          })}
        </div>

        {/* LESSONS GRID */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))', gap:12 }}>
          {levelLessons.map((lesson, i) => {
            const status = getStatus(lesson.id)
            const color = LEVEL_COLORS[lesson.level]
            return (
              <Link key={lesson.id} href={`/lesson/${lesson.id}`} className="lesson-card fade"
                style={{ animationDelay:`${i * 0.03}s`, opacity: status === 'completed' ? 0.6 : 1 }}>

                {/* Left border accent */}
                <div style={{ position:'absolute', top:0, left:0, width:3, height:'100%', background:color, borderRadius:'14px 0 0 14px' }}/>

                <div style={{ paddingLeft:8 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                    <span style={{ fontSize:'0.7rem', fontWeight:800, letterSpacing:2, color:`${color}99`, textTransform:'uppercase' }}>
                      {lesson.level}{lesson.lesson_number}
                    </span>
                    <span style={{ fontSize:'0.7rem', fontWeight:700, padding:'3px 8px', borderRadius:99,
                      background: status === 'completed' ? 'rgba(0,212,170,0.1)' : status === 'in_progress' ? 'rgba(255,193,7,0.1)' : 'rgba(255,255,255,0.04)',
                      color: status === 'completed' ? '#00d4aa' : status === 'in_progress' ? '#ffc107' : '#3a3a52'
                    }}>
                      {status === 'completed' ? '✓' : status === 'in_progress' ? '↻' : '○'}
                    </span>
                  </div>

                  <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:'0.92rem', color:'#e8e8f8', marginBottom:5, lineHeight:1.3 }}>
                    {lesson.title.replace(/^[A-C]\d+\s*·\s*/, '')}
                  </div>
                  <div style={{ fontSize:'0.78rem', color:'#5a5a72', lineHeight:1.4 }}>
                    {lesson.grammar_topic}
                  </div>

                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:14 }}>
                    <span style={{ fontSize:'0.72rem', color: status === 'completed' ? '#00d4aa' : status === 'in_progress' ? '#ffc107' : '#3a3a52', fontWeight:600 }}>
                      {status === 'completed' ? '✓ Пройден' : status === 'in_progress' ? '↻ В процессе' : '○ Не начат'}
                    </span>
                    {lesson.pdf_url && <span style={{ fontSize:'0.7rem', color:'#3a3a52' }}>PDF ✓</span>}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        <div style={{ height:48 }} />
      </div>
    </>
  )
}
