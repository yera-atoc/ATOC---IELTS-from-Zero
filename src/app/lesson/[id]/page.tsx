'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef } from 'react'
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

// Inline CSS for lesson HTML content
const LESSON_CSS = `
  .lesson-body { font-family: 'DM Sans', sans-serif; color: #e8e8f0; line-height: 1.75; font-size: 0.95rem; }
  .lesson-body table { width: 100%; border-collapse: collapse; margin: 16px 0; border-radius: 10px; overflow: hidden; }
  .lesson-body td, .lesson-body th { padding: 10px 14px; border: 1px solid rgba(255,255,255,0.08); vertical-align: top; }
  .lesson-body tr.odd td { background: rgba(255,255,255,0.03); }
  .lesson-body tr.even td { background: rgba(255,255,255,0.06); }
  .lesson-body tr:first-child td { background: rgba(124,111,255,0.15); font-weight: 700; color: #c8c4ff; }
  .lesson-body strong { color: #f0f0ff; font-weight: 700; }
  .lesson-body p { margin: 10px 0; }
  .lesson-body h1, .lesson-body h2, .lesson-body h3 { font-family: 'Syne', sans-serif; color: #f0f0ff; margin: 24px 0 12px; }
  .lesson-body blockquote { border-left: 3px solid #7c6fff; padding: 12px 16px; background: rgba(124,111,255,0.07); border-radius: 0 8px 8px 0; margin: 16px 0; }
  .lesson-body ul, .lesson-body ol { padding-left: 20px; margin: 10px 0; }
  .lesson-body li { margin: 6px 0; }
  /* Header table (first table = lesson title block) */
  .lesson-body table:first-of-type { background: linear-gradient(135deg, rgba(124,111,255,0.12), rgba(0,212,170,0.08)); border: 1px solid rgba(124,111,255,0.2); border-radius: 12px; }
  .lesson-body table:first-of-type td { border: none; padding: 8px 20px; }
  /* IELTS tip boxes */
  .lesson-body table:last-of-type td { background: rgba(0,212,170,0.06) !important; border-color: rgba(0,212,170,0.15) !important; border-radius: 8px; }
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

      // Load HTML content from Supabase Storage
      if (les) {
        const htmlKey = `${les.level}${les.lesson_number}`
        try {
          const { data: htmlData } = supabase.storage
            .from('lessons')
            .getPublicUrl(`html/${htmlKey}.html`)
          
          const res = await fetch(htmlData.publicUrl)
          if (res.ok) {
            const html = await res.text()
            setLessonHtml(html)
          } else {
            setLessonHtml(null)
          }
        } catch {
          setLessonHtml(null)
        }
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
    await supabase.from('submissions').insert({
      student_id: userId, lesson_id: parseInt(lessonId),
      task_type: taskType, content: essay.trim()
    })
    const { data: subs } = await supabase.from('submissions')
      .select('*, feedback(comment, score)')
      .eq('lesson_id', lessonId).eq('student_id', userId)
      .order('submitted_at', { ascending: false })
    setSubmissions(subs || [])
    setEssay('')
    setSuccess(true)
    setTimerActive(false)
    setTimeLeft(TIMER_SECONDS)
    setSubmitting(false)
    setActiveTab('works')
    setTimeout(() => setSuccess(false), 4000)
  }

  const timerClass = timeLeft < 300 ? 'danger' : timeLeft < 900 ? 'warning' : ''
  const wordCount = countWords(essay)
  const levelColor = lesson?.level === 'A' ? 'var(--accent-a)' : lesson?.level === 'B' ? 'var(--accent-b)' : 'var(--accent-c)'

  if (loading) return (
    <div className="loading">
      <div><span className="loading-dot"/><span className="loading-dot"/><span className="loading-dot"/></div>
    </div>
  )
  if (!lesson) return <div className="loading">Урок не найден</div>

  return (
    <>
      <style>{LESSON_CSS}</style>
      <nav className="navbar">
        <div className="navbar-brand">Ato<span>C</span></div>
        <div className="navbar-right">
          <Link href="/dashboard" className="btn btn-ghost btn-sm">← Все уроки</Link>
          {prevLesson && <Link href={`/lesson/${prevLesson.id}`} className="btn btn-ghost btn-sm">← {prevLesson.level}{prevLesson.lesson_number}</Link>}
          {nextLesson && <Link href={`/lesson/${nextLesson.id}`} className="btn btn-primary btn-sm">{nextLesson.level}{nextLesson.lesson_number} →</Link>}
        </div>
      </nav>

      <div className="container">
        {/* Header */}
        <div className="page-header" style={{ paddingBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: levelColor }}>
              Уровень {lesson.level} · Урок {lesson.lesson_number}
            </span>
            <span className={`badge badge-${progressStatus}`}>
              {progressStatus === 'completed' ? '✓ Пройден' : progressStatus === 'in_progress' ? '↻ В процессе' : '○ Не начат'}
            </span>
            {submissions.length > 0 && (
              <span className="badge badge-reviewed">📋 {submissions.length} работ</span>
            )}
          </div>
          <h1 className="page-title" style={{ fontSize: '1.5rem' }}>{lesson.title}</h1>
          <p className="page-subtitle">{lesson.grammar_topic}</p>

          <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            {progressStatus === 'not_started' && (
              <button className="btn btn-ghost btn-sm" onClick={() => { updateProgress('in_progress'); setActiveTab('lesson') }}>▶ Начать урок</button>
            )}
            {progressStatus === 'in_progress' && (
              <button className="btn btn-success btn-sm" onClick={() => updateProgress('completed')}>✓ Урок пройден</button>
            )}
            {progressStatus === 'completed' && (
              <button className="btn btn-ghost btn-sm" onClick={() => updateProgress('in_progress')}>↩ Повторить</button>
            )}
          </div>
        </div>

        {/* Main tabs */}
        <div className="tabs">
          <button className={`tab ${activeTab === 'lesson' ? 'active' : ''}`} onClick={() => setActiveTab('lesson')}>
            📖 Урок
          </button>
          <button className={`tab ${activeTab === 'submit' ? 'active' : ''}`} onClick={() => setActiveTab('submit')}>
            ✍️ Задание
          </button>
          <button className={`tab ${activeTab === 'works' ? 'active' : ''}`} onClick={() => setActiveTab('works')}>
            📋 Мои работы {submissions.length > 0 && `(${submissions.length})`}
          </button>
        </div>

        {/* LESSON TAB */}
        {activeTab === 'lesson' && (
          <div className="card" style={{ padding: '28px 32px' }}>
            {htmlLoading ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text2)' }}>
                <div><span className="loading-dot"/><span className="loading-dot"/><span className="loading-dot"/></div>
                <p style={{ marginTop: 12 }}>Загружаю материал урока...</p>
              </div>
            ) : lessonHtml ? (
              <div className="lesson-body" dangerouslySetInnerHTML={{ __html: lessonHtml }} />
            ) : lesson.pdf_url ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <p style={{ color: 'var(--text2)', marginBottom: 16 }}>HTML версия ещё загружается. Пока доступен PDF:</p>
                <a href={lesson.pdf_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  📄 Открыть PDF урока
                </a>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text2)' }}>
                <div style={{ fontSize: '2rem', marginBottom: 12 }}>📄</div>
                <p>Материал урока скоро появится</p>
              </div>
            )}

            {/* Bottom navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
              {prevLesson ? (
                <Link href={`/lesson/${prevLesson.id}`} className="btn btn-ghost btn-sm">← {prevLesson.level}{prevLesson.lesson_number}</Link>
              ) : <div/>}
              <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('submit')}>
                Перейти к заданию →
              </button>
            </div>
          </div>
        )}

        {/* SUBMIT TAB */}
        {activeTab === 'submit' && (
          <div className="card">
            <div className="flex-between" style={{ marginBottom: 20 }}>
              <h2 className="card-title" style={{ marginBottom: 0 }}>✍️ Задание</h2>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div className={`timer-box ${timerClass}`}>⏱ {formatTime(timeLeft)}</div>
                <button className="btn btn-ghost btn-sm" onClick={() => {
                  if (timerActive) { setTimerActive(false); setTimeLeft(TIMER_SECONDS) }
                  else setTimerActive(true)
                }}>
                  {timerActive ? '⏸ Стоп' : '▶ Старт'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Тип задания</label>
              <select className="form-input" value={taskType} onChange={e => setTaskType(e.target.value)}>
                <option value="task1">IELTS Task 1</option>
                <option value="task2">IELTS Task 2 (эссе)</option>
                <option value="exercise">Упражнение из урока</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Твой ответ</label>
              <textarea className="form-input form-textarea" rows={10}
                placeholder="Начни писать здесь..."
                value={essay}
                onChange={e => { setEssay(e.target.value); if (!timerActive && e.target.value.length === 1) setTimerActive(true) }}
              />
              <div className="word-count">
                <div>Слов: <span style={{ color: wordCount >= 250 ? 'var(--accent3)' : 'var(--text)' }}>{wordCount}</span></div>
                <div>Символов: <span>{essay.length}</span></div>
                {taskType === 'task2' && (
                  <div style={{ color: wordCount >= 250 ? 'var(--accent3)' : 'var(--text3)' }}>
                    {wordCount >= 250 ? '✓ Минимум выполнен (250)' : `ещё ${250 - wordCount} слов до минимума`}
                  </div>
                )}
                {taskType === 'task1' && (
                  <div style={{ color: wordCount >= 150 ? 'var(--accent3)' : 'var(--text3)' }}>
                    {wordCount >= 150 ? '✓ Минимум выполнен (150)' : `ещё ${150 - wordCount} слов до минимума`}
                  </div>
                )}
              </div>
            </div>

            {success && <div className="alert alert-success">✓ Отправлено! Учитель скоро проверит.</div>}

            <button className="btn btn-primary" onClick={submitEssay}
              disabled={submitting || !essay.trim()} style={{ width: '100%', padding: 14 }}>
              {submitting ? 'Отправляю...' : '📤 Отправить на проверку'}
            </button>
          </div>
        )}

        {/* WORKS TAB */}
        {activeTab === 'works' && (
          <div>
            {submissions.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--text2)' }}>
                <div style={{ fontSize: '2rem', marginBottom: 12 }}>📭</div>
                <p>Ты ещё не сдавал задания по этому уроку</p>
                <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }} onClick={() => setActiveTab('submit')}>
                  Сдать задание →
                </button>
              </div>
            ) : submissions.map(sub => (
              <div key={sub.id} className="submission-item">
                <div className="flex-between" style={{ marginBottom: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                    {sub.task_type === 'task1' ? 'Task 1' : sub.task_type === 'task2' ? 'Task 2' : 'Упражнение'}
                  </span>
                  <span className={`badge badge-${sub.status}`}>
                    {sub.status === 'reviewed' ? '✓ Проверено' : '⏳ Ожидает'}
                  </span>
                </div>
                <div className="submission-content">{sub.content}</div>
                <div className="text-muted text-sm">{new Date(sub.submitted_at).toLocaleString('ru-RU')}</div>
                {sub.feedback?.map((fb, i) => (
                  <div key={i} className="feedback-box">
                    <strong>💬 ФИДБЭК {fb.score ? `· Band ${fb.score}` : ''}</strong>
                    <div style={{ color: 'var(--text2)', lineHeight: 1.7 }}>{fb.comment}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        <div style={{ height: 48 }} />
      </div>
    </>
  )
}
