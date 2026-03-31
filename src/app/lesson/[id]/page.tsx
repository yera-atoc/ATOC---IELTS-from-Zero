'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type Lesson = { id: number; level: string; lesson_number: number; title: string; grammar_topic: string; pdf_url: string | null; order_index: number }
type Submission = { id: number; task_type: string; content: string; status: string; submitted_at: string; feedback?: { comment: string; score: number | null }[] }

const TIMER_SECONDS = 60 * 60

function formatTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
}

function countWords(text: string) {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length
}

const LESSON_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
  
  .lb { font-family: 'DM Sans', sans-serif; color: #cccce0; line-height: 1.85; font-size: 1rem; }
  
  /* Hide ugly docx header table (first table = A to C / IELTS FROM ZERO) */
  .lb table:first-of-type { display: none !important; }
  
  .lb p { margin: 12px 0; }
  .lb strong { color: #eeeeff; font-weight: 600; }
  .lb em { color: #a8a4d8; font-style: italic; }
  
  /* Section headers (Grammar 1, Grammar 2 etc) */
  .lb > p > strong:only-child,
  .lb > p strong { color: #f0f0ff; }
  
  .lb p strong:only-child {
    display: block;
    font-family: 'Syne', sans-serif;
    font-size: 1.05rem;
    font-weight: 800;
    color: #e8e8ff;
    margin: 28px 0 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }
  
  /* Tables */
  .lb table { width: 100%; border-collapse: collapse; margin: 20px 0; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.07); }
  .lb td, .lb th { padding: 12px 16px; border: 1px solid rgba(255,255,255,0.05); vertical-align: top; font-size: 0.9rem; line-height: 1.6; }
  
  /* Header row of tables */
  .lb tr:first-child td, .lb thead td, .lb th {
    background: rgba(124,111,255,0.14) !important;
    font-weight: 700;
    color: #c8c4ff;
    font-size: 0.82rem;
    letter-spacing: 0.4px;
    text-transform: uppercase;
  }
  .lb tr.odd td { background: rgba(255,255,255,0.02); }
  .lb tr.even td { background: rgba(255,255,255,0.045); }
  .lb tr:hover td { background: rgba(124,111,255,0.06) !important; }
  
  /* Single-column tables = tip/exercise boxes */
  .lb table:not(:first-of-type) colgroup col[style*="100%"] ~ col:not(:first-child),
  .lb table:has(colgroup col[style*="100%"]):not(:first-of-type) {
    border: none;
  }
  .lb table:not(:first-of-type):has(colgroup:only-child col[style*="100%"]) {
    background: rgba(0,212,170,0.04);
    border-color: rgba(0,212,170,0.15);
    border-radius: 12px;
  }
  .lb table:not(:first-of-type):has(colgroup:only-child col[style*="100%"]) td {
    border: none;
    padding: 16px 20px;
  }
  
  /* Lists */
  .lb ul, .lb ol { padding-left: 24px; margin: 12px 0; }
  .lb li { margin: 8px 0; line-height: 1.7; }
  
  /* Blockquotes */
  .lb blockquote { 
    border-left: 3px solid #7c6fff; 
    padding: 14px 20px; 
    background: rgba(124,111,255,0.06); 
    border-radius: 0 12px 12px 0; 
    margin: 20px 0; 
    color: #b8b4e8;
    font-style: italic;
  }
  
  /* Horizontal rules */
  .lb hr { border: none; border-top: 1px solid rgba(255,255,255,0.06); margin: 24px 0; }
`

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const lessonId = params.id as string

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [allLessons, setAllLessons] = useState<Lesson[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [userId, setUserId] = useState('')
  const [lessonHtml, setLessonHtml] = useState<string | null>(null)
  const [htmlLoading, setHtmlLoading] = useState(true)
  const [essay, setEssay] = useState('')
  const [taskType, setTaskType] = useState('task2')
  const [taskPrompt, setTaskPrompt] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [progressStatus, setProgressStatus] = useState('not_started')
  const [timerActive, setTimerActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS)
  const [activeTab, setActiveTab] = useState<'lesson' | 'submit' | 'works'>('lesson')

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }
      setUserId(user.id)

      const [{ data: les }, { data: allLes }, { data: subs }, { data: prog }] = await Promise.all([
        supabase.from('lessons').select('*').eq('id', lessonId).single(),
        supabase.from('lessons').select('id,order_index,level,lesson_number').order('order_index'),
        supabase.from('submissions').select('*, feedback(comment, score)')
          .eq('lesson_id', lessonId).eq('student_id', user.id).order('submitted_at', { ascending: false }),
        supabase.from('progress').select('status').eq('lesson_id', lessonId).eq('student_id', user.id).single(),
      ])
      setLesson(les)
      setAllLessons(allLes || [])
      setSubmissions(subs || [])
      setProgressStatus(prog?.status || 'not_started')
      setLoading(false)

      if (les) {
        const htmlKey = `${les.level}${les.lesson_number}`
        try {
          const { data: htmlData } = supabase.storage.from('lessons').getPublicUrl(`${htmlKey}.html`)
          const res = await fetch(htmlData.publicUrl)
          if (res.ok) {
            const html = await res.text()
            setLessonHtml(html)
          } else setLessonHtml(null)
        } catch { setLessonHtml(null) }
        setHtmlLoading(false)
      }
    }
    load()
  }, [lessonId, router])

  useEffect(() => {
    if (!timerActive) return
    if (timeLeft <= 0) { setTimerActive(false); return }
    const t = setInterval(() => setTimeLeft(p => p - 1), 1000)
    return () => clearInterval(t)
  }, [timerActive, timeLeft])

  const currentIndex = allLessons.findIndex(l => l.id === parseInt(lessonId))
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

  const updateProgress = async (status: string) => {
    const supabase = createClient()
    await supabase.from('progress').upsert({
      student_id: userId, lesson_id: parseInt(lessonId), status,
      ...(status === 'completed' ? { completed_at: new Date().toISOString() } : {})
    })
    setProgressStatus(status)
  }

  const submitEssay = async () => {
    if (!essay.trim()) return
    setSubmitting(true)
    const supabase = createClient()
    const fullContent = taskPrompt ? `[Тема: ${taskPrompt}]\n\n${essay.trim()}` : essay.trim()
    await supabase.from('submissions').insert({
      student_id: userId, lesson_id: parseInt(lessonId),
      task_type: taskType, content: fullContent
    })
    const { data: subs } = await supabase.from('submissions')
      .select('*, feedback(comment, score)')
      .eq('lesson_id', lessonId).eq('student_id', userId)
      .order('submitted_at', { ascending: false })
    setSubmissions(subs || [])
    setEssay(''); setTaskPrompt('')
    setSuccess(true)
    setTimerActive(false); setTimeLeft(TIMER_SECONDS)
    setSubmitting(false)
    setActiveTab('works')
    setTimeout(() => setSuccess(false), 5000)
  }

  const timerClass = timeLeft < 300 ? 'danger' : timeLeft < 900 ? 'warning' : ''
  const wordCount = countWords(essay)
  const minWords = taskType === 'task1' ? 150 : taskType === 'task2' ? 250 : 0
  const wordProgress = minWords > 0 ? Math.min(wordCount / minWords * 100, 100) : 0
  const levelColor = lesson?.level === 'A' ? '#4fc3f7' : lesson?.level === 'B' ? '#81c784' : '#ce93d8'

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#0a0a0f' }}>
      <div style={{ textAlign:'center', color:'#9090a8' }}>
        <div style={{ fontSize:'2rem', marginBottom:12, animation:'spin 1s linear infinite' }}>⟳</div>
        <p>Загрузка урока...</p>
      </div>
    </div>
  )
  if (!lesson) return <div style={{ textAlign:'center', padding:80, color:'#666' }}>Урок не найден</div>

  return (
    <>
      <style>{LESSON_CSS}</style>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .fade-in { animation: fadeIn 0.3s ease; }
        .word-bar { height:4px; border-radius:99px; background:#1a1a24; overflow:hidden; margin-top:8px; }
        .word-bar-fill { height:100%; border-radius:99px; transition:width 0.3s, background 0.3s; }
        .task-card { background:#13131e; border:1px solid rgba(255,255,255,0.07); border-radius:14px; padding:24px; margin-bottom:14px; }
        .task-card:hover { border-color:rgba(124,111,255,0.25); }
        .submit-btn { width:100%; padding:16px; background:linear-gradient(135deg,#7c6fff,#5a4fd4); color:white; border:none; border-radius:12px; font-family:'DM Sans',sans-serif; font-size:1rem; font-weight:700; cursor:pointer; transition:all 0.2s; letter-spacing:0.3px; }
        .submit-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 24px rgba(124,111,255,0.4); }
        .submit-btn:disabled { opacity:0.4; cursor:not-allowed; }
        .nav-tab { flex:1; padding:12px 8px; cursor:pointer; border:none; background:transparent; font-family:'DM Sans',sans-serif; font-size:0.88rem; font-weight:600; color:#5a5a72; border-radius:10px; transition:all 0.2s; position:relative; }
        .nav-tab.active { background:#1e1e2e; color:#f0f0ff; }
        .nav-tab.active::after { content:''; position:absolute; bottom:0; left:20%; right:20%; height:2px; background:linear-gradient(90deg,#7c6fff,#00d4aa); border-radius:99px; }
        .progress-ring { transition:stroke-dashoffset 0.5s ease; }
        .lesson-html-wrap { max-width:720px; margin:0 auto; }
      `}</style>

      {/* NAVBAR */}
      <nav style={{ position:'sticky', top:0, zIndex:100, background:'rgba(10,10,15,0.92)', backdropFilter:'blur(24px)', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'0 24px', height:58, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <Link href="/dashboard" style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:'1.1rem', color:'#f0f0f8', textDecoration:'none' }}>
          Ato<span style={{ color:'#7c6fff' }}>C</span>
        </Link>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <Link href="/dashboard" style={{ padding:'7px 14px', background:'#1a1a24', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, color:'#9090a8', textDecoration:'none', fontSize:'0.83rem', fontWeight:600 }}>
            ← Уроки
          </Link>
          {prevLesson && (
            <Link href={`/lesson/${prevLesson.id}`} style={{ padding:'7px 14px', background:'#1a1a24', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, color:'#9090a8', textDecoration:'none', fontSize:'0.83rem', fontWeight:600 }}>
              ← {prevLesson.level}{prevLesson.lesson_number}
            </Link>
          )}
          {nextLesson && (
            <Link href={`/lesson/${nextLesson.id}`} style={{ padding:'7px 14px', background:'#7c6fff', borderRadius:8, color:'white', textDecoration:'none', fontSize:'0.83rem', fontWeight:700 }}>
              {nextLesson.level}{nextLesson.lesson_number} →
            </Link>
          )}
        </div>
      </nav>

      <div style={{ maxWidth:860, margin:'0 auto', padding:'0 20px' }}>

        {/* HERO HEADER */}
        <div style={{ padding:'28px 0 20px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10, flexWrap:'wrap' }}>
            <span style={{ fontSize:'0.7rem', fontWeight:800, letterSpacing:2.5, textTransform:'uppercase', color:levelColor, background:`${levelColor}18`, padding:'4px 12px', borderRadius:99 }}>
              Уровень {lesson.level} · Урок {lesson.lesson_number}
            </span>
            <span style={{ fontSize:'0.75rem', fontWeight:700, padding:'4px 12px', borderRadius:99,
              background: progressStatus === 'completed' ? 'rgba(0,212,170,0.12)' : progressStatus === 'in_progress' ? 'rgba(255,193,7,0.12)' : 'rgba(255,255,255,0.05)',
              color: progressStatus === 'completed' ? '#00d4aa' : progressStatus === 'in_progress' ? '#ffc107' : '#5a5a72'
            }}>
              {progressStatus === 'completed' ? '✓ Пройден' : progressStatus === 'in_progress' ? '↻ В процессе' : '○ Не начат'}
            </span>
          </div>

          <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:'1.7rem', fontWeight:800, color:'#f0f0f8', marginBottom:6 }}>
            {lesson.title}
          </h1>
          <p style={{ color:'#7070a0', fontSize:'0.9rem', marginBottom:16 }}>{lesson.grammar_topic}</p>

          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {progressStatus === 'not_started' && (
              <button onClick={() => { updateProgress('in_progress'); setActiveTab('lesson') }}
                style={{ padding:'9px 20px', background:'#1a1a2e', border:'1px solid rgba(124,111,255,0.3)', borderRadius:9, color:'#a0a0ff', fontWeight:700, cursor:'pointer', fontSize:'0.88rem' }}>
                ▶ Начать урок
              </button>
            )}
            {progressStatus === 'in_progress' && (
              <button onClick={() => updateProgress('completed')}
                style={{ padding:'9px 20px', background:'rgba(0,212,170,0.12)', border:'1px solid rgba(0,212,170,0.25)', borderRadius:9, color:'#00d4aa', fontWeight:700, cursor:'pointer', fontSize:'0.88rem' }}>
                ✓ Отметить пройденным
              </button>
            )}
            {progressStatus === 'completed' && (
              <button onClick={() => updateProgress('in_progress')}
                style={{ padding:'9px 20px', background:'#1a1a24', border:'1px solid rgba(255,255,255,0.1)', borderRadius:9, color:'#7070a0', fontWeight:600, cursor:'pointer', fontSize:'0.88rem' }}>
                ↩ Повторить
              </button>
            )}
            {lesson.pdf_url && (
              <a href={lesson.pdf_url} target="_blank" rel="noopener noreferrer"
                style={{ padding:'9px 20px', background:'#1a1a24', border:'1px solid rgba(255,255,255,0.08)', borderRadius:9, color:'#7070a0', fontWeight:600, fontSize:'0.88rem', textDecoration:'none' }}>
                📄 PDF
              </a>
            )}
          </div>
        </div>

        {/* TABS */}
        <div style={{ display:'flex', gap:4, background:'#0f0f18', borderRadius:14, padding:4, border:'1px solid rgba(255,255,255,0.06)', marginBottom:24 }}>
          {([
            { key: 'lesson', label: '📖 Урок' },
            { key: 'submit', label: '✍️ Задание' },
            { key: 'works', label: `📋 Работы${submissions.length > 0 ? ` (${submissions.length})` : ''}` },
          ] as const).map(t => (
            <button key={t.key} className={`nav-tab ${activeTab === t.key ? 'active' : ''}`}
              onClick={() => setActiveTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── LESSON TAB ── */}
        {activeTab === 'lesson' && (
          <div className="fade-in">
            <div style={{ background:'#0f0f1a', border:'1px solid rgba(255,255,255,0.06)', borderRadius:16, padding:'32px 36px', marginBottom:16 }}>
              {htmlLoading ? (
                <div style={{ textAlign:'center', padding:48, color:'#5a5a72' }}>
                  <div style={{ fontSize:'1.5rem', marginBottom:10 }}>⟳</div>
                  Загружаю материал...
                </div>
              ) : lessonHtml ? (
                <div className="lb lesson-html-wrap" dangerouslySetInnerHTML={{ __html: lessonHtml }} />
              ) : (
                <div style={{ textAlign:'center', padding:48 }}>
                  <div style={{ fontSize:'3rem', marginBottom:16 }}>📄</div>
                  <p style={{ color:'#7070a0', marginBottom:20 }}>HTML версия загружается. Пока используй PDF:</p>
                  {lesson.pdf_url && (
                    <a href={lesson.pdf_url} target="_blank" rel="noopener noreferrer"
                      style={{ padding:'12px 24px', background:'#7c6fff', borderRadius:10, color:'white', textDecoration:'none', fontWeight:700 }}>
                      Открыть PDF урока →
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Bottom nav */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 0 32px', gap:12 }}>
              {prevLesson ? (
                <Link href={`/lesson/${prevLesson.id}`}
                  style={{ padding:'11px 20px', background:'#1a1a24', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, color:'#9090a8', textDecoration:'none', fontWeight:600, fontSize:'0.88rem' }}>
                  ← {prevLesson.level}{prevLesson.lesson_number}
                </Link>
              ) : <div/>}
              <button onClick={() => setActiveTab('submit')}
                style={{ padding:'11px 24px', background:'linear-gradient(135deg,#7c6fff,#5a4fd4)', border:'none', borderRadius:10, color:'white', fontWeight:700, cursor:'pointer', fontSize:'0.9rem' }}>
                Перейти к заданию →
              </button>
            </div>
          </div>
        )}

        {/* ── SUBMIT TAB ── */}
        {activeTab === 'submit' && (
          <div className="fade-in">

            {/* Timer bar */}
            <div style={{ background:'#0f0f1a', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14, padding:'16px 20px', marginBottom:16, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ fontSize:'0.82rem', color:'#5a5a72', fontWeight:600 }}>ТАЙМЕР ЭКЗАМЕНА</span>
                <span style={{
                  fontFamily:'Syne,sans-serif', fontSize:'1.4rem', fontWeight:800,
                  color: timeLeft < 300 ? '#ff6b6b' : timeLeft < 900 ? '#ffc107' : '#f0f0f8',
                  letterSpacing:2
                }}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={() => { setTimerActive(false); setTimeLeft(TIMER_SECONDS) }}
                  style={{ padding:'7px 14px', background:'#1a1a24', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, color:'#7070a0', cursor:'pointer', fontSize:'0.82rem', fontWeight:600 }}>
                  Сброс
                </button>
                <button onClick={() => setTimerActive(!timerActive)}
                  style={{ padding:'7px 16px', background: timerActive ? 'rgba(255,107,107,0.15)' : 'rgba(0,212,170,0.15)', border:`1px solid ${timerActive ? 'rgba(255,107,107,0.3)' : 'rgba(0,212,170,0.3)'}`, borderRadius:8, color: timerActive ? '#ff8a8a' : '#00d4aa', cursor:'pointer', fontSize:'0.88rem', fontWeight:700 }}>
                  {timerActive ? '⏸ Пауза' : '▶ Старт'}
                </button>
              </div>
            </div>

            {/* Task type */}
            <div className="task-card">
              <div style={{ fontSize:'0.75rem', fontWeight:800, letterSpacing:1.5, color:'#5a5a72', textTransform:'uppercase', marginBottom:14 }}>ТИП ЗАДАНИЯ</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                {[
                  { v:'task1', label:'Task 1', desc:'Граф/диаграмма', min:150 },
                  { v:'task2', label:'Task 2', desc:'Эссе', min:250 },
                  { v:'exercise', label:'Упражнение', desc:'Грамматика', min:0 },
                ].map(t => (
                  <button key={t.v} onClick={() => setTaskType(t.v)}
                    style={{ padding:'14px 10px', background: taskType === t.v ? 'rgba(124,111,255,0.15)' : '#0d0d1a', border:`2px solid ${taskType === t.v ? '#7c6fff' : 'rgba(255,255,255,0.06)'}`, borderRadius:10, cursor:'pointer', transition:'all 0.15s', textAlign:'center' }}>
                    <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, color: taskType === t.v ? '#b0aaff' : '#7070a0', fontSize:'0.9rem' }}>{t.label}</div>
                    <div style={{ fontSize:'0.75rem', color:'#5a5a72', marginTop:3 }}>{t.desc}</div>
                    {t.min > 0 && <div style={{ fontSize:'0.7rem', color: taskType === t.v ? '#7c6fff' : '#3a3a52', marginTop:3 }}>мин. {t.min} слов</div>}
                  </button>
                ))}
              </div>
            </div>

            {/* Task prompt */}
            <div className="task-card">
              <div style={{ fontSize:'0.75rem', fontWeight:800, letterSpacing:1.5, color:'#5a5a72', textTransform:'uppercase', marginBottom:10 }}>
                ТЕМА / ВОПРОС <span style={{ color:'#3a3a52', fontWeight:400 }}>(необязательно)</span>
              </div>
              <input
                style={{ width:'100%', padding:'12px 16px', background:'#0a0a12', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, color:'#d0d0e8', fontFamily:'DM Sans,sans-serif', fontSize:'0.9rem', outline:'none' }}
                placeholder="Например: Should social media be banned for children under 16?"
                value={taskPrompt}
                onChange={e => setTaskPrompt(e.target.value)}
              />
            </div>

            {/* Essay textarea */}
            <div className="task-card">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <div style={{ fontSize:'0.75rem', fontWeight:800, letterSpacing:1.5, color:'#5a5a72', textTransform:'uppercase' }}>ТВОЙ ОТВЕТ</div>
                <div style={{ display:'flex', gap:16, fontSize:'0.8rem' }}>
                  <span style={{ color: wordCount >= minWords && minWords > 0 ? '#00d4aa' : '#7070a0' }}>
                    <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:'1rem', color: wordCount >= minWords && minWords > 0 ? '#00d4aa' : '#f0f0f8' }}>{wordCount}</span> слов
                  </span>
                  <span style={{ color:'#5a5a72' }}>{essay.length} симв.</span>
                </div>
              </div>
              <textarea
                style={{ width:'100%', minHeight:220, padding:'16px', background:'#0a0a12', border:'1px solid rgba(255,255,255,0.06)', borderRadius:10, color:'#d8d8f0', fontFamily:'DM Sans,sans-serif', fontSize:'0.95rem', lineHeight:1.75, resize:'vertical', outline:'none', transition:'border-color 0.2s' }}
                placeholder={taskType === 'task2' ? "Введение: парафраз темы + твоя позиция...\n\nBody 1: первый аргумент...\n\nBody 2: второй аргумент...\n\nЗаключение: вывод..." : taskType === 'task1' ? "The chart/graph shows...\n\nOverall, it is clear that..." : "Начни писать ответ на упражнение..."}
                value={essay}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(124,111,255,0.4)'; if (!timerActive && essay.length === 0) setTimerActive(true) }}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
                onChange={e => setEssay(e.target.value)}
              />

              {/* Word progress */}
              {minWords > 0 && (
                <div style={{ marginTop:10 }}>
                  <div className="word-bar">
                    <div className="word-bar-fill" style={{
                      width:`${wordProgress}%`,
                      background: wordCount >= minWords ? 'linear-gradient(90deg,#00d4aa,#00bfa5)' : wordCount >= minWords * 0.6 ? 'linear-gradient(90deg,#ffc107,#ff9800)' : 'linear-gradient(90deg,#7c6fff,#5a4fd4)'
                    }}/>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginTop:6, fontSize:'0.78rem', color:'#5a5a72' }}>
                    <span>{wordCount >= minWords ? `✓ Минимум достигнут (${minWords} слов)` : `Ещё ${minWords - wordCount} слов до минимума`}</span>
                    <span>{minWords} минимум</span>
                  </div>
                </div>
              )}
            </div>

            {success && (
              <div style={{ background:'rgba(0,212,170,0.08)', border:'1px solid rgba(0,212,170,0.2)', borderRadius:12, padding:'14px 20px', marginBottom:14, color:'#00d4aa', fontSize:'0.9rem', fontWeight:600 }}>
                ✓ Отправлено! Учитель получил работу и скоро оставит фидбэк.
              </div>
            )}

            <button className="submit-btn" onClick={submitEssay} disabled={submitting || !essay.trim()}>
              {submitting ? '⟳ Отправляю...' : '📤 Отправить на проверку'}
            </button>

            <p style={{ textAlign:'center', fontSize:'0.78rem', color:'#3a3a52', marginTop:12 }}>
              Учитель проверит работу и оставит комментарий с оценкой Band
            </p>
          </div>
        )}

        {/* ── WORKS TAB ── */}
        {activeTab === 'works' && (
          <div className="fade-in">
            {submissions.length === 0 ? (
              <div style={{ textAlign:'center', padding:'60px 20px', color:'#5a5a72' }}>
                <div style={{ fontSize:'3rem', marginBottom:16, filter:'grayscale(0.5)' }}>📭</div>
                <p style={{ fontSize:'1rem', fontWeight:600, color:'#7070a0', marginBottom:8 }}>Пока нет работ</p>
                <p style={{ fontSize:'0.85rem', marginBottom:24 }}>Сдай первое задание по этому уроку</p>
                <button onClick={() => setActiveTab('submit')}
                  style={{ padding:'11px 24px', background:'#7c6fff', border:'none', borderRadius:10, color:'white', fontWeight:700, cursor:'pointer' }}>
                  Перейти к заданию →
                </button>
              </div>
            ) : (
              <div>
                {submissions.map((sub, idx) => (
                  <div key={sub.id} style={{ background:'#0f0f1a', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14, padding:'20px 24px', marginBottom:12 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12, flexWrap:'wrap', gap:8 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:'0.88rem', color:'#d0d0e8' }}>
                          {sub.task_type === 'task1' ? 'Task 1' : sub.task_type === 'task2' ? 'Task 2' : 'Упражнение'}
                        </span>
                        <span style={{ fontSize:'0.75rem', color:'#3a3a52' }}>#{submissions.length - idx}</span>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:'0.78rem', color:'#5a5a72' }}>{new Date(sub.submitted_at).toLocaleDateString('ru-RU', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}</span>
                        <span style={{ fontSize:'0.73rem', fontWeight:700, padding:'3px 10px', borderRadius:99,
                          background: sub.status === 'reviewed' ? 'rgba(0,212,170,0.1)' : 'rgba(255,193,7,0.1)',
                          color: sub.status === 'reviewed' ? '#00d4aa' : '#ffc107'
                        }}>
                          {sub.status === 'reviewed' ? '✓ Проверено' : '⏳ Ожидает'}
                        </span>
                      </div>
                    </div>

                    <div style={{ background:'#08080f', borderRadius:10, padding:'14px 18px', fontSize:'0.88rem', lineHeight:1.75, color:'#9090a8', whiteSpace:'pre-wrap', border:'1px solid rgba(255,255,255,0.04)', maxHeight:200, overflow:'auto' }}>
                      {sub.content}
                    </div>

                    {sub.feedback?.map((fb, i) => (
                      <div key={i} style={{ marginTop:12, background:'rgba(124,111,255,0.06)', border:'1px solid rgba(124,111,255,0.15)', borderRadius:12, padding:'16px 20px' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                          <span style={{ fontSize:'0.75rem', fontWeight:800, letterSpacing:1, color:'#7c6fff', textTransform:'uppercase' }}>
                            💬 Фидбэк учителя
                          </span>
                          {fb.score && (
                            <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:'1.1rem', color:'#ffc107', background:'rgba(255,193,7,0.1)', padding:'4px 14px', borderRadius:99 }}>
                              Band {fb.score}
                            </span>
                          )}
                        </div>
                        <p style={{ color:'#c0c0d8', lineHeight:1.75, fontSize:'0.9rem' }}>{fb.comment}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ height:48 }} />
      </div>
    </>
  )
}
