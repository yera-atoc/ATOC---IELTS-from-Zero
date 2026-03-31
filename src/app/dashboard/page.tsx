'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type Lesson = { id: number; level: string; lesson_number: number; title: string; grammar_topic: string; pdf_url: string | null; order_index: number }
type Submission = { id: number; task_type: string; content: string; status: string; submitted_at: string; feedback?: { comment: string; score: number | null }[] }
type Checklist = { grammar_done: boolean; reading_done: boolean; essay_done: boolean }
type AIFeedback = { band: string; grammar: string; lexical: string; coherence: string; task: string; overall: string } | null

const TIMER_SECONDS = 60 * 60
const fmt = (s: number) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`
const wc = (t: string) => t.trim() === '' ? 0 : t.trim().split(/\s+/).length

const LESSON_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap');
  
  .lb { 
    font-family: 'Nunito', sans-serif; 
    color: #d0d0e4; 
    line-height: 1.9; 
    font-size: 1.02rem; 
    letter-spacing: 0.01em;
  }
  
  /* Hide docx header table */
  .lb table:first-of-type { display: none !important; }
  
  .lb p { margin: 13px 0; }
  .lb strong { color: #eeeeff; font-weight: 800; }
  .lb em { color: #a8a8d8; }
  
  /* Section headers */
  .lb p > strong:only-child {
    display: block;
    font-family: 'Nunito', sans-serif;
    font-size: 1.15rem;
    font-weight: 900;
    color: #ffffff;
    margin: 32px 0 10px;
    padding: 0 0 10px 0;
    border-bottom: 2px solid rgba(124,111,255,0.2);
  }

  /* Tables */
  .lb table { 
    width: 100%; 
    border-collapse: separate; 
    border-spacing: 0;
    margin: 20px 0; 
    border-radius: 14px; 
    overflow: hidden; 
    border: 1px solid rgba(255,255,255,0.06);
    font-family: 'Nunito', sans-serif;
  }
  .lb td, .lb th { 
    padding: 13px 18px; 
    border-bottom: 1px solid rgba(255,255,255,0.05);
    border-right: 1px solid rgba(255,255,255,0.04);
    vertical-align: top; 
    font-size: 0.95rem; 
    line-height: 1.65; 
  }
  .lb td:last-child, .lb th:last-child { border-right: none; }
  .lb tr:last-child td { border-bottom: none; }
  
  /* Header row */
  .lb tr:first-child td { 
    background: rgba(124,111,255,0.18) !important; 
    font-weight: 800; 
    color: #c8c4ff; 
    font-size: 0.82rem; 
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }
  .lb tr.odd td { background: rgba(255,255,255,0.02); }
  .lb tr.even td { background: rgba(255,255,255,0.04); }
  .lb tr:not(:first-child):hover td { 
    background: rgba(124,111,255,0.07) !important; 
    transition: background 0.15s; 
  }
  
  /* Lists */
  .lb ul, .lb ol { padding-left: 26px; margin: 14px 0; }
  .lb li { 
    margin: 9px 0; 
    line-height: 1.75;
    padding-left: 4px;
  }
  .lb ul li::marker { color: #7c6fff; font-size: 1.1em; }
  .lb ol li::marker { color: #7c6fff; font-weight: 800; }
  
  /* Blockquotes = IELTS tips */
  .lb blockquote { 
    border-left: 4px solid #7c6fff; 
    padding: 16px 20px; 
    background: rgba(124,111,255,0.07); 
    border-radius: 0 14px 14px 0; 
    margin: 20px 0; 
    color: #b8b8e8;
    font-style: normal;
  }
  
  .lb hr { border: none; border-top: 1px solid rgba(255,255,255,0.06); margin: 28px 0; }
  
  /* Code */
  .lb code { 
    background: rgba(124,111,255,0.12); 
    padding: 2px 8px; 
    border-radius: 6px; 
    font-size: 0.9em;
    color: #c8c4ff;
  }
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
  const [activeTab, setActiveTab] = useState<'lesson'|'submit'|'works'>('lesson')
  const [checklist, setChecklist] = useState<Checklist>({ grammar_done: false, reading_done: false, essay_done: false })
  const [aiFeedback, setAiFeedback] = useState<AIFeedback>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [floatingOpen, setFloatingOpen] = useState(false)
  const [vocab, setVocab] = useState<string[]>([])
  const [newWord, setNewWord] = useState('')

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }
      setUserId(user.id)
      const [{ data: les }, { data: allLes }, { data: subs }, { data: prog }, { data: chk }, { data: voc }] = await Promise.all([
        supabase.from('lessons').select('*').eq('id', lessonId).single(),
        supabase.from('lessons').select('id,order_index,level,lesson_number').order('order_index'),
        supabase.from('submissions').select('*, feedback(comment, score)').eq('lesson_id', lessonId).eq('student_id', user.id).order('submitted_at', { ascending: false }),
        supabase.from('progress').select('status').eq('lesson_id', lessonId).eq('student_id', user.id).single(),
        supabase.from('lesson_checklist').select('*').eq('lesson_id', lessonId).eq('student_id', user.id).single(),
        supabase.from('vocabulary').select('word').eq('student_id', user.id).eq('lesson_id', lessonId),
      ])
      setLesson(les); setAllLessons(allLes || []); setSubmissions(subs || [])
      setProgressStatus(prog?.status || 'not_started')
      if (chk) setChecklist({ grammar_done: chk.grammar_done, reading_done: chk.reading_done, essay_done: chk.essay_done })
      setVocab((voc || []).map((v: any) => v.word))
      setLoading(false)
      if (les) {
        const htmlKey = `${les.level}${les.lesson_number}`
        try {
          const { data: hd } = supabase.storage.from('lessons').getPublicUrl(`${htmlKey}.html`)
          const res = await fetch(hd.publicUrl)
          if (res.ok) setLessonHtml(await res.text())
          else setLessonHtml(null)
        } catch { setLessonHtml(null) }
        setHtmlLoading(false)
        // Update streak
        await updateStreak(user.id, supabase)
      }
    }
    load()
  }, [lessonId, router])

  const updateStreak = async (uid: string, supabase: any) => {
    const today = new Date().toISOString().slice(0, 10)
    const { data: prof } = await supabase.from('profiles').select('streak, last_active, longest_streak').eq('id', uid).single()
    if (!prof) return
    if (prof.last_active === today) return
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    const newStreak = prof.last_active === yesterday ? (prof.streak || 0) + 1 : 1
    const longest = Math.max(newStreak, prof.longest_streak || 0)
    await supabase.from('profiles').update({ streak: newStreak, last_active: today, longest_streak: longest }).eq('id', uid)
  }

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
    await supabase.from('progress').upsert({ student_id: userId, lesson_id: parseInt(lessonId), status, ...(status === 'completed' ? { completed_at: new Date().toISOString() } : {}) })
    setProgressStatus(status)
  }

  const updateChecklist = async (key: keyof Checklist) => {
    const updated = { ...checklist, [key]: !checklist[key] }
    setChecklist(updated)
    const supabase = createClient()
    await supabase.from('lesson_checklist').upsert({ student_id: userId, lesson_id: parseInt(lessonId), ...updated, updated_at: new Date().toISOString() })
    if (updated.grammar_done && updated.reading_done && updated.essay_done) updateProgress('completed')
  }

  const addWord = async () => {
    if (!newWord.trim() || vocab.includes(newWord.trim())) return
    const word = newWord.trim()
    const supabase = createClient()
    await supabase.from('vocabulary').insert({ student_id: userId, lesson_id: parseInt(lessonId), word })
    setVocab(prev => [...prev, word])
    setNewWord('')
  }

  const getAIFeedback = async () => {
    if (!essay.trim() || essay.trim().split(/\s+/).length < 50) return
    setAiLoading(true)
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `You are an IELTS examiner. Evaluate this ${taskType === 'task1' ? 'Task 1' : 'Task 2'} response and give structured feedback. Respond ONLY in JSON format, no markdown:
{"band":"6.5","task":"feedback on task achievement in Russian","grammar":"feedback on grammar in Russian","lexical":"feedback on lexical resource in Russian","coherence":"feedback on coherence in Russian","overall":"1-2 sentence motivating summary in Russian"}

Essay: ${essay.trim()}`
          }]
        })
      })
      const data = await res.json()
      const text = data.content?.[0]?.text || ''
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim())
      setAiFeedback(parsed)
    } catch { setAiFeedback(null) }
    setAiLoading(false)
  }

  const submitEssay = async () => {
    if (!essay.trim()) return
    setSubmitting(true)
    const supabase = createClient()
    const full = taskPrompt ? `[Тема: ${taskPrompt}]\n\n${essay.trim()}` : essay.trim()
    await supabase.from('submissions').insert({ student_id: userId, lesson_id: parseInt(lessonId), task_type: taskType, content: full })
    const { data: subs } = await supabase.from('submissions').select('*, feedback(comment, score)').eq('lesson_id', lessonId).eq('student_id', userId).order('submitted_at', { ascending: false })
    setSubmissions(subs || [])
    setEssay(''); setTaskPrompt(''); setAiFeedback(null)
    setSuccess(true); setTimerActive(false); setTimeLeft(TIMER_SECONDS)
    setSubmitting(false); setActiveTab('works')
    await updateChecklist('essay_done')
    setTimeout(() => setSuccess(false), 5000)
  }

  const wordCount = wc(essay)
  const minWords = taskType === 'task1' ? 150 : taskType === 'task2' ? 250 : 0
  const wordPct = minWords > 0 ? Math.min(wordCount / minWords * 100, 100) : 0
  const levelColor = lesson?.level === 'A' ? '#4fc3f7' : lesson?.level === 'B' ? '#81c784' : '#ce93d8'
  const checkDone = [checklist.grammar_done, checklist.reading_done, checklist.essay_done].filter(Boolean).length

  if (loading) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',background:'#0a0a0f',color:'#5a5a72' }}><p>Загрузка...</p></div>
  if (!lesson) return <div style={{ textAlign:'center',padding:80,color:'#666' }}>Урок не найден</div>

  return (
    <>
      <style>{LESSON_CSS}</style>
      <style>{`
        * { box-sizing:border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(124,111,255,0.4)} 50%{box-shadow:0 0 0 12px rgba(124,111,255,0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes glow { 0%,100%{box-shadow:0 0 16px rgba(124,111,255,0.5),0 0 32px rgba(124,111,255,0.2)} 50%{box-shadow:0 0 24px rgba(124,111,255,0.8),0 0 48px rgba(124,111,255,0.3)} }
        .fade { animation:fadeUp 0.3s ease both; }
        .ntab { flex:1;padding:12px 6px;cursor:pointer;border:none;background:transparent;font-family:'Nunito',sans-serif;font-size:0.85rem;font-weight:600;color:#4a4a6a;border-radius:10px;transition:all 0.2s;text-align:center; }
        .ntab.on { background:#181828;color:#e8e8ff; }
        .ntab.on::after { content:'';display:block;width:30px;height:2px;background:linear-gradient(90deg,#7c6fff,#00d4aa);border-radius:99px;margin:4px auto 0; }
        .chk-item { display:flex;align-items:center;gap:12px;padding:14px 16px;background:#0d0d1a;border:1px solid rgba(255,255,255,0.05);border-radius:12px;cursor:pointer;transition:all 0.2s;margin-bottom:8px; }
        .chk-item:hover { background:#131325;border-color:rgba(124,111,255,0.2); }
        .chk-box { width:22px;height:22px;border-radius:6px;border:2px solid rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all 0.2s; }
        .chk-box.done { background:linear-gradient(135deg,#7c6fff,#00d4aa);border-color:transparent; }
        .floating-btn { position:fixed;bottom:28px;right:28px;width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#7c6fff,#5a4fd4);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1.4rem;animation:glow 3s ease-in-out infinite;z-index:999;transition:transform 0.2s; }
        .floating-btn:hover { transform:scale(1.1); }
        .floating-menu { position:fixed;bottom:96px;right:28px;background:#12121e;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:8px;min-width:200px;z-index:999;box-shadow:0 8px 32px rgba(0,0,0,0.5);animation:fadeUp 0.2s ease; }
        .fmenu-item { display:flex;align-items:center;gap:10px;padding:11px 14px;border-radius:10px;cursor:pointer;font-family:'Nunito',sans-serif;font-size:0.88rem;color:#cccce0;transition:background 0.15s; }
        .fmenu-item:hover { background:rgba(124,111,255,0.1); }
        .ai-card { background:linear-gradient(135deg,rgba(124,111,255,0.08),rgba(0,212,170,0.04));border:1px solid rgba(124,111,255,0.2);border-radius:14px;padding:20px;margin-top:16px; }
        .ai-row { display:flex;gap:8px;align-items:flex-start;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04); }
        .ai-row:last-child { border-bottom:none; }
        .ai-label { font-size:0.72rem;font-weight:800;letter-spacing:1px;color:#7c6fff;text-transform:uppercase;min-width:80px;padding-top:2px; }
        .submit-btn { width:100%;padding:16px;background:linear-gradient(135deg,#7c6fff,#5a4fd4);color:white;border:none;border-radius:12px;font-family:'Nunito',sans-serif;font-size:1rem;font-weight:700;cursor:pointer;transition:all 0.2s;letter-spacing:0.3px; }
        .submit-btn:hover:not(:disabled) { transform:translateY(-2px);box-shadow:0 8px 24px rgba(124,111,255,0.4); }
        .submit-btn:disabled { opacity:0.4;cursor:not-allowed; }
        .vocab-tag { display:inline-flex;align-items:center;gap:6px;padding:5px 12px;background:rgba(124,111,255,0.1);border:1px solid rgba(124,111,255,0.2);border-radius:99px;font-size:0.82rem;color:#b0aaff;margin:4px; }
      `}</style>

      {/* NAVBAR */}
      <nav style={{ position:'sticky',top:0,zIndex:100,background:'rgba(8,8,14,0.94)',backdropFilter:'blur(24px)',borderBottom:'1px solid rgba(255,255,255,0.05)',padding:'0 20px',height:56,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
        <Link href="/dashboard" style={{ fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'1.1rem',color:'#f0f0f8',textDecoration:'none' }}>
          Ato<span style={{ color:'#7c6fff' }}>C</span>
        </Link>
        <div style={{ display:'flex',gap:8,alignItems:'center' }}>
          <Link href="/dashboard" style={{ padding:'6px 12px',background:'#1a1a28',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,color:'#7070a0',textDecoration:'none',fontSize:'0.8rem',fontWeight:600 }}>← Уроки</Link>
          {prevLesson && <Link href={`/lesson/${prevLesson.id}`} style={{ padding:'6px 12px',background:'#1a1a28',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,color:'#7070a0',textDecoration:'none',fontSize:'0.8rem',fontWeight:600 }}>← {prevLesson.level}{prevLesson.lesson_number}</Link>}
          {nextLesson && <Link href={`/lesson/${nextLesson.id}`} style={{ padding:'6px 14px',background:'#7c6fff',borderRadius:8,color:'white',textDecoration:'none',fontSize:'0.8rem',fontWeight:700 }}>{nextLesson.level}{nextLesson.lesson_number} →</Link>}
        </div>
      </nav>

      <div style={{ maxWidth:840,margin:'0 auto',padding:'0 18px' }}>

        {/* HEADER */}
        <div style={{ padding:'24px 0 16px' }}>
          <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:8,flexWrap:'wrap' }}>
            <span style={{ fontSize:'0.68rem',fontWeight:800,letterSpacing:2.5,textTransform:'uppercase',color:levelColor,background:`${levelColor}18`,padding:'4px 12px',borderRadius:99 }}>
              Уровень {lesson.level} · Урок {lesson.lesson_number}
            </span>
            <span style={{ fontSize:'0.72rem',fontWeight:700,padding:'4px 10px',borderRadius:99,
              background:progressStatus==='completed'?'rgba(0,212,170,0.1)':progressStatus==='in_progress'?'rgba(255,193,7,0.1)':'rgba(255,255,255,0.04)',
              color:progressStatus==='completed'?'#00d4aa':progressStatus==='in_progress'?'#ffc107':'#4a4a6a'
            }}>
              {progressStatus==='completed'?'✓ Пройден':progressStatus==='in_progress'?'↻ В процессе':'○ Не начат'}
            </span>
            {/* Checklist progress */}
            <span style={{ fontSize:'0.72rem',fontWeight:700,padding:'4px 10px',borderRadius:99,background:'rgba(255,255,255,0.04)',color:'#5a5a7a' }}>
              {checkDone}/3 выполнено
            </span>
          </div>
          <h1 style={{ fontFamily:'Syne,sans-serif',fontSize:'1.55rem',fontWeight:800,color:'#f0f0f8',marginBottom:4 }}>{lesson.title}</h1>
          <p style={{ color:'#6060a0',fontSize:'0.88rem' }}>{lesson.grammar_topic}</p>

          <div style={{ display:'flex',gap:8,marginTop:14,flexWrap:'wrap' }}>
            {progressStatus==='not_started' && <button onClick={()=>{updateProgress('in_progress');setActiveTab('lesson')}} style={{ padding:'8px 18px',background:'rgba(124,111,255,0.1)',border:'1px solid rgba(124,111,255,0.25)',borderRadius:9,color:'#a0a0ff',fontWeight:700,cursor:'pointer',fontSize:'0.85rem' }}>▶ Начать урок</button>}
            {progressStatus==='in_progress' && <button onClick={()=>updateProgress('completed')} style={{ padding:'8px 18px',background:'rgba(0,212,170,0.1)',border:'1px solid rgba(0,212,170,0.25)',borderRadius:9,color:'#00d4aa',fontWeight:700,cursor:'pointer',fontSize:'0.85rem' }}>✓ Пройден</button>}
            {progressStatus==='completed' && <button onClick={()=>updateProgress('in_progress')} style={{ padding:'8px 18px',background:'#1a1a28',border:'1px solid rgba(255,255,255,0.08)',borderRadius:9,color:'#5a5a7a',fontWeight:600,cursor:'pointer',fontSize:'0.85rem' }}>↩ Повторить</button>}
          </div>
        </div>

        {/* TABS */}
        <div style={{ display:'flex',gap:3,background:'#0b0b16',borderRadius:14,padding:4,border:'1px solid rgba(255,255,255,0.05)',marginBottom:20 }}>
          {([{k:'lesson',l:'📖 Урок'},{k:'submit',l:'✍️ Задание'},{k:'works',l:`📋 Работы${submissions.length>0?` (${submissions.length})`:''}`}] as const).map(t=>(
            <button key={t.k} className={`ntab ${activeTab===t.k?'on':''}`} onClick={()=>setActiveTab(t.k)}>{t.l}</button>
          ))}
        </div>

        {/* ── LESSON TAB ── */}
        {activeTab==='lesson' && (
          <div className="fade">
            {/* Checklist */}
            <div style={{ background:'#0c0c18',border:'1px solid rgba(255,255,255,0.06)',borderRadius:14,padding:'18px 20px',marginBottom:16 }}>
              <div style={{ fontSize:'0.72rem',fontWeight:800,letterSpacing:1.5,color:'#5a5a7a',textTransform:'uppercase',marginBottom:12 }}>
                Чеклист урока · {checkDone}/3
              </div>
              <div style={{ background:'#1a1a28',borderRadius:99,height:4,overflow:'hidden',marginBottom:14 }}>
                <div style={{ height:'100%',width:`${checkDone/3*100}%`,background:'linear-gradient(90deg,#7c6fff,#00d4aa)',transition:'width 0.4s ease' }}/>
              </div>
              {[
                {k:'grammar_done' as keyof Checklist,icon:'📘',label:'Грамматика изучена',desc:'Прочитал и понял материал'},
                {k:'reading_done' as keyof Checklist,icon:'📖',label:'Текст прочитан',desc:'Выполнил задания на чтение'},
                {k:'essay_done' as keyof Checklist,icon:'✍️',label:'Эссе написано',desc:'Сдал задание на проверку'},
              ].map(item=>(
                <div key={item.k} className="chk-item" onClick={()=>updateChecklist(item.k)}>
                  <div className={`chk-box ${checklist[item.k]?'done':''}`}>
                    {checklist[item.k] && <span style={{ color:'white',fontSize:'0.75rem',fontWeight:800 }}>✓</span>}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600,fontSize:'0.9rem',color:checklist[item.k]?'#7070a0':'#d0d0e8',textDecoration:checklist[item.k]?'line-through':'none',transition:'all 0.2s' }}>
                      {item.icon} {item.label}
                    </div>
                    <div style={{ fontSize:'0.76rem',color:'#4a4a6a',marginTop:2 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Lesson content */}
            <div style={{ background:'#0d0d1a',border:'1px solid rgba(255,255,255,0.05)',borderRadius:16,padding:'28px 32px',marginBottom:16 }}>
              {htmlLoading ? (
                <div style={{ textAlign:'center',padding:48,color:'#4a4a6a' }}>
                  <div style={{ fontSize:'1.5rem',display:'inline-block',animation:'spin 1s linear infinite' }}>⟳</div>
                  <p style={{ marginTop:10 }}>Загружаю материал...</p>
                </div>
              ) : lessonHtml ? (
                <div className="lb" style={{ maxWidth:700,margin:'0 auto' }} dangerouslySetInnerHTML={{ __html: lessonHtml }}/>
              ) : (
                <div style={{ textAlign:'center',padding:48 }}>
                  <p style={{ color:'#6060a0',marginBottom:16 }}>HTML версия загружается</p>
                  {lesson.pdf_url && <a href={lesson.pdf_url} target="_blank" rel="noopener noreferrer" style={{ padding:'12px 24px',background:'#7c6fff',borderRadius:10,color:'white',textDecoration:'none',fontWeight:700 }}>Открыть PDF →</a>}
                </div>
              )}
            </div>

            {/* Vocabulary for this lesson */}
            <div style={{ background:'#0c0c18',border:'1px solid rgba(255,255,255,0.05)',borderRadius:14,padding:'18px 20px',marginBottom:16 }}>
              <div style={{ fontSize:'0.72rem',fontWeight:800,letterSpacing:1.5,color:'#5a5a7a',textTransform:'uppercase',marginBottom:12 }}>📚 Мой словарь ({vocab.length} слов)</div>
              <div style={{ display:'flex',gap:8,marginBottom:12 }}>
                <input value={newWord} onChange={e=>setNewWord(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addWord()}
                  placeholder="Добавь новое слово..."
                  style={{ flex:1,padding:'10px 14px',background:'#0a0a14',border:'1px solid rgba(255,255,255,0.07)',borderRadius:9,color:'#d0d0e8',fontFamily:'Nunito,sans-serif',fontSize:'0.9rem',outline:'none' }}/>
                <button onClick={addWord} style={{ padding:'10px 18px',background:'rgba(124,111,255,0.15)',border:'1px solid rgba(124,111,255,0.25)',borderRadius:9,color:'#a0a0ff',fontWeight:700,cursor:'pointer',fontSize:'0.88rem' }}>+</button>
              </div>
              <div>
                {vocab.map((w,i)=>(
                  <span key={i} className="vocab-tag">📝 {w}</span>
                ))}
                {vocab.length===0 && <p style={{ color:'#3a3a5a',fontSize:'0.82rem' }}>Добавляй слова из урока которые хочешь запомнить</p>}
              </div>
            </div>

            <div style={{ display:'flex',justifyContent:'space-between',padding:'8px 0 32px',gap:12 }}>
              {prevLesson?<Link href={`/lesson/${prevLesson.id}`} style={{ padding:'11px 18px',background:'#1a1a28',border:'1px solid rgba(255,255,255,0.07)',borderRadius:10,color:'#7070a0',textDecoration:'none',fontWeight:600,fontSize:'0.85rem' }}>← {prevLesson.level}{prevLesson.lesson_number}</Link>:<div/>}
              <button onClick={()=>{setActiveTab('submit');updateChecklist('grammar_done')}} style={{ padding:'11px 22px',background:'linear-gradient(135deg,#7c6fff,#5a4fd4)',border:'none',borderRadius:10,color:'white',fontWeight:700,cursor:'pointer',fontSize:'0.88rem' }}>Перейти к заданию →</button>
            </div>
          </div>
        )}

        {/* ── SUBMIT TAB ── */}
        {activeTab==='submit' && (
          <div className="fade">
            {/* Timer */}
            <div style={{ background:'#0c0c18',border:'1px solid rgba(255,255,255,0.06)',borderRadius:14,padding:'14px 18px',marginBottom:14,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:10 }}>
              <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                <span style={{ fontSize:'0.7rem',fontWeight:800,letterSpacing:1.5,color:'#4a4a6a',textTransform:'uppercase' }}>Таймер</span>
                <span style={{ fontFamily:'Syne,sans-serif',fontSize:'1.6rem',fontWeight:800,letterSpacing:3,
                  color:timeLeft<300?'#ff6b6b':timeLeft<900?'#ffc107':'#f0f0f8' }}>{fmt(timeLeft)}</span>
                {timerActive && <span style={{ fontSize:'0.7rem',color:'#00d4aa',fontWeight:700,animation:'pulse 2s infinite' }}>● ЗАПУЩЕН</span>}
              </div>
              <div style={{ display:'flex',gap:8 }}>
                <button onClick={()=>{setTimerActive(false);setTimeLeft(TIMER_SECONDS)}} style={{ padding:'7px 12px',background:'#1a1a28',border:'1px solid rgba(255,255,255,0.07)',borderRadius:8,color:'#5a5a7a',cursor:'pointer',fontSize:'0.8rem',fontWeight:600 }}>↺ Сброс</button>
                <button onClick={()=>setTimerActive(!timerActive)} style={{ padding:'7px 16px',background:timerActive?'rgba(255,107,107,0.12)':'rgba(0,212,170,0.12)',border:`1px solid ${timerActive?'rgba(255,107,107,0.25)':'rgba(0,212,170,0.25)'}`,borderRadius:8,color:timerActive?'#ff8a8a':'#00d4aa',cursor:'pointer',fontSize:'0.85rem',fontWeight:700 }}>
                  {timerActive?'⏸ Пауза':'▶ Старт'}
                </button>
              </div>
            </div>

            {/* Task type */}
            <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:14 }}>
              {[{v:'task1',l:'Task 1',d:'Граф/диаграмма',min:150},{v:'task2',l:'Task 2',d:'Эссе',min:250},{v:'exercise',l:'Упражнение',d:'Грамматика',min:0}].map(t=>(
                <button key={t.v} onClick={()=>setTaskType(t.v)} style={{ padding:'14px 10px',background:taskType===t.v?'rgba(124,111,255,0.12)':'#0d0d1a',border:`2px solid ${taskType===t.v?'#7c6fff':'rgba(255,255,255,0.05)'}`,borderRadius:12,cursor:'pointer',textAlign:'center',transition:'all 0.15s' }}>
                  <div style={{ fontFamily:'Syne,sans-serif',fontWeight:800,color:taskType===t.v?'#b0aaff':'#5a5a7a',fontSize:'0.9rem' }}>{t.l}</div>
                  <div style={{ fontSize:'0.72rem',color:'#4a4a6a',marginTop:3 }}>{t.d}</div>
                  {t.min>0&&<div style={{ fontSize:'0.68rem',color:taskType===t.v?'#7c6fff':'#2a2a42',marginTop:2,fontWeight:700 }}>мин. {t.min} слов</div>}
                </button>
              ))}
            </div>

            {/* Task prompt */}
            <div style={{ marginBottom:14 }}>
              <input style={{ width:'100%',padding:'12px 16px',background:'#0d0d1a',border:'1px solid rgba(255,255,255,0.06)',borderRadius:10,color:'#d0d0e8',fontFamily:'Nunito,sans-serif',fontSize:'0.9rem',outline:'none' }}
                placeholder="Тема / вопрос задания (необязательно)..."
                value={taskPrompt} onChange={e=>setTaskPrompt(e.target.value)}/>
            </div>

            {/* Essay */}
            <div style={{ background:'#0d0d1a',border:'1px solid rgba(255,255,255,0.06)',borderRadius:14,padding:'16px 18px',marginBottom:14 }}>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10 }}>
                <span style={{ fontSize:'0.7rem',fontWeight:800,letterSpacing:1.5,color:'#4a4a6a',textTransform:'uppercase' }}>Твой ответ</span>
                <div style={{ display:'flex',gap:14,fontSize:'0.8rem' }}>
                  <span style={{ color:wordCount>=minWords&&minWords>0?'#00d4aa':'#6060a0' }}>
                    <span style={{ fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'1.1rem',color:wordCount>=minWords&&minWords>0?'#00d4aa':'#d0d0e8' }}>{wordCount}</span> сл.
                  </span>
                  <span style={{ color:'#4a4a6a' }}>{essay.length} симв.</span>
                </div>
              </div>
              <textarea style={{ width:'100%',minHeight:200,padding:'14px',background:'#09090f',border:'1px solid rgba(255,255,255,0.04)',borderRadius:10,color:'#d8d8f0',fontFamily:'Nunito,sans-serif',fontSize:'0.95rem',lineHeight:1.8,resize:'vertical',outline:'none' }}
                placeholder={taskType==='task2'?"Введение: парафраз темы + позиция...\n\nBody 1...\n\nBody 2...\n\nЗаключение...":taskType==='task1'?"The chart/graph shows...\n\nOverall, it is clear that...":"Напиши ответ на упражнение..."}
                value={essay}
                onFocus={()=>{ if(!timerActive&&essay.length===0) setTimerActive(true) }}
                onChange={e=>setEssay(e.target.value)}/>
              {minWords>0&&(
                <div style={{ marginTop:8 }}>
                  <div style={{ background:'#1a1a28',borderRadius:99,height:4,overflow:'hidden' }}>
                    <div style={{ height:'100%',width:`${wordPct}%`,background:wordCount>=minWords?'linear-gradient(90deg,#00d4aa,#00bfa5)':wordCount>=minWords*0.6?'linear-gradient(90deg,#ffc107,#ff9800)':'linear-gradient(90deg,#7c6fff,#5a4fd4)',transition:'width 0.3s,background 0.3s' }}/>
                  </div>
                  <div style={{ display:'flex',justifyContent:'space-between',marginTop:5,fontSize:'0.75rem',color:'#4a4a6a' }}>
                    <span>{wordCount>=minWords?`✓ Минимум достигнут`:`Ещё ${minWords-wordCount} слов`}</span>
                    <span>мин. {minWords}</span>
                  </div>
                </div>
              )}
            </div>

            {/* AI Feedback */}
            {essay.trim().split(/\s+/).length>=50&&(
              <div style={{ marginBottom:14 }}>
                <button onClick={getAIFeedback} disabled={aiLoading} style={{ padding:'10px 20px',background:'rgba(0,212,170,0.1)',border:'1px solid rgba(0,212,170,0.25)',borderRadius:10,color:'#00d4aa',fontWeight:700,cursor:'pointer',fontSize:'0.85rem',display:'flex',alignItems:'center',gap:8 }}>
                  {aiLoading?<span style={{ display:'inline-block',animation:'spin 1s linear infinite' }}>⟳</span>:'🤖'}
                  {aiLoading?'AI анализирует...':'Получить AI фидбэк (до отправки учителю)'}
                </button>
              </div>
            )}

            {aiFeedback&&(
              <div className="ai-card" style={{ marginBottom:14 }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14 }}>
                  <span style={{ fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'0.9rem',color:'#d0d0e8' }}>🤖 AI Предварительная оценка</span>
                  <span style={{ fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'1.3rem',color:'#ffc107',background:'rgba(255,193,7,0.1)',padding:'4px 16px',borderRadius:99 }}>Band {aiFeedback.band}</span>
                </div>
                {[{l:'Задание',v:aiFeedback.task},{l:'Грамматика',v:aiFeedback.grammar},{l:'Лексика',v:aiFeedback.lexical},{l:'Связность',v:aiFeedback.coherence},{l:'Итог',v:aiFeedback.overall}].map(r=>(
                  <div key={r.l} className="ai-row">
                    <span className="ai-label">{r.l}</span>
                    <span style={{ color:'#b0b0d0',fontSize:'0.88rem',lineHeight:1.6 }}>{r.v}</span>
                  </div>
                ))}
                <p style={{ fontSize:'0.75rem',color:'#4a4a6a',marginTop:10 }}>* AI оценка предварительная. Финальный фидбэк даёт учитель.</p>
              </div>
            )}

            {success&&<div style={{ background:'rgba(0,212,170,0.07)',border:'1px solid rgba(0,212,170,0.2)',borderRadius:12,padding:'13px 18px',marginBottom:14,color:'#00d4aa',fontSize:'0.88rem',fontWeight:600 }}>✓ Отправлено! Учитель скоро проверит и оставит фидбэк.</div>}

            <button className="submit-btn" onClick={submitEssay} disabled={submitting||!essay.trim()}>
              {submitting?'⟳ Отправляю...':'📤 Отправить на проверку учителю'}
            </button>
          </div>
        )}

        {/* ── WORKS TAB ── */}
        {activeTab==='works' && (
          <div className="fade">
            {submissions.length===0?(
              <div style={{ textAlign:'center',padding:'56px 20px',color:'#4a4a6a' }}>
                <div style={{ fontSize:'2.5rem',marginBottom:14 }}>📭</div>
                <p style={{ fontWeight:600,color:'#6060a0',marginBottom:6 }}>Работ пока нет</p>
                <p style={{ fontSize:'0.85rem',marginBottom:20 }}>Напиши первое эссе по этому уроку</p>
                <button onClick={()=>setActiveTab('submit')} style={{ padding:'11px 22px',background:'#7c6fff',border:'none',borderRadius:10,color:'white',fontWeight:700,cursor:'pointer' }}>Написать →</button>
              </div>
            ):submissions.map((sub,idx)=>(
              <div key={sub.id} style={{ background:'#0d0d1a',border:'1px solid rgba(255,255,255,0.05)',borderRadius:14,padding:'18px 22px',marginBottom:12 }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10,flexWrap:'wrap',gap:8 }}>
                  <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                    <span style={{ fontFamily:'Syne,sans-serif',fontWeight:700,color:'#d0d0e8',fontSize:'0.88rem' }}>
                      {sub.task_type==='task1'?'Task 1':sub.task_type==='task2'?'Task 2':'Упражнение'}
                    </span>
                    <span style={{ fontSize:'0.72rem',color:'#3a3a5a' }}>#{submissions.length-idx}</span>
                  </div>
                  <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                    <span style={{ fontSize:'0.75rem',color:'#4a4a6a' }}>{new Date(sub.submitted_at).toLocaleDateString('ru-RU',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</span>
                    <span style={{ fontSize:'0.7rem',fontWeight:700,padding:'3px 10px',borderRadius:99,
                      background:sub.status==='reviewed'?'rgba(0,212,170,0.1)':'rgba(255,193,7,0.1)',
                      color:sub.status==='reviewed'?'#00d4aa':'#ffc107'
                    }}>{sub.status==='reviewed'?'✓ Проверено':'⏳ Ожидает'}</span>
                  </div>
                </div>
                <div style={{ background:'#080810',borderRadius:10,padding:'12px 16px',fontSize:'0.88rem',lineHeight:1.75,color:'#8080a8',whiteSpace:'pre-wrap',border:'1px solid rgba(255,255,255,0.03)',maxHeight:180,overflow:'auto' }}>
                  {sub.content}
                </div>
                {sub.feedback?.map((fb,i)=>(
                  <div key={i} style={{ marginTop:10,background:'rgba(124,111,255,0.06)',border:'1px solid rgba(124,111,255,0.14)',borderRadius:12,padding:'14px 18px' }}>
                    <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8 }}>
                      <span style={{ fontSize:'0.7rem',fontWeight:800,letterSpacing:1,color:'#7c6fff',textTransform:'uppercase' }}>💬 Фидбэк учителя</span>
                      {fb.score&&<span style={{ fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'1.1rem',color:'#ffc107',background:'rgba(255,193,7,0.1)',padding:'3px 14px',borderRadius:99 }}>Band {fb.score}</span>}
                    </div>
                    <p style={{ color:'#b0b0d0',lineHeight:1.75,fontSize:'0.88rem' }}>{fb.comment}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
        <div style={{ height:100 }}/>
      </div>

      {/* FLOATING BUTTON */}
      <button className="floating-btn" onClick={()=>setFloatingOpen(!floatingOpen)}>
        {floatingOpen?'✕':'✨'}
      </button>

      {floatingOpen&&(
        <div className="floating-menu">
          <div className="fmenu-item" onClick={()=>{setActiveTab('lesson');setFloatingOpen(false)}}>📖 К уроку</div>
          <div className="fmenu-item" onClick={()=>{setActiveTab('submit');setFloatingOpen(false)}}>✍️ Написать эссе</div>
          <div className="fmenu-item" onClick={()=>{setActiveTab('works');setFloatingOpen(false)}}>📋 Мои работы</div>
          <div style={{ borderTop:'1px solid rgba(255,255,255,0.05)',margin:'6px 0'}}/>
          {nextLesson&&<div className="fmenu-item" onClick={()=>router.push(`/lesson/${nextLesson.id}`)}>→ Следующий урок</div>}
          <div className="fmenu-item" onClick={()=>router.push('/dashboard')}>🏠 Главная</div>
        </div>
      )}
    </>
  )
}
