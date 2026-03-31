'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type Lesson = { id: number; level: string; lesson_number: number; title: string; grammar_topic: string; pdf_url: string | null; order_index: number }
type Submission = { id: number; task_type: string; content: string; status: string; submitted_at: string; feedback?: { comment: string; score: number | null }[] }

const TIMER_SECONDS = 60 * 60 // 60 minutes

function formatTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
}

function countWords(text: string) {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length
}

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const lessonId = params.id as string

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [allLessons, setAllLessons] = useState<Lesson[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [userId, setUserId] = useState('')
  const [essay, setEssay] = useState('')
  const [taskType, setTaskType] = useState('task2')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [progressStatus, setProgressStatus] = useState('not_started')
  const [timerActive, setTimerActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS)

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
    }
    load()
  }, [lessonId, router])

  // Timer
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
    setTimeout(() => setSuccess(false), 4000)
  }

  const timerClass = timeLeft < 300 ? 'danger' : timeLeft < 900 ? 'warning' : ''
  const wordCount = countWords(essay)
  const charCount = essay.length

  const levelColor = lesson?.level === 'A' ? 'var(--accent-a)' : lesson?.level === 'B' ? 'var(--accent-b)' : 'var(--accent-c)'

  if (loading) return (
    <div className="loading">
      <div><span className="loading-dot"/><span className="loading-dot"/><span className="loading-dot"/></div>
    </div>
  )
  if (!lesson) return <div className="loading">Урок не найден</div>

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">Ato<span>C</span></div>
        <div className="navbar-right">
          <Link href="/dashboard" className="btn btn-ghost btn-sm">← Все уроки</Link>
        </div>
      </nav>

      <div className="container">
        {/* Header */}
        <div className="page-header">
          <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: levelColor }}>
              Уровень {lesson.level} · Урок {lesson.lesson_number}
            </span>
            <span className={`badge badge-${progressStatus}`}>
              {progressStatus === 'completed' ? '✓ Пройден' : progressStatus === 'in_progress' ? '↻ В процессе' : '○ Не начат'}
            </span>
          </div>
          <h1 className="page-title">{lesson.title}</h1>
          <p className="page-subtitle">{lesson.grammar_topic}</p>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
            {progressStatus === 'not_started' && (
              <button className="btn btn-ghost btn-sm" onClick={() => updateProgress('in_progress')}>▶ Начать урок</button>
            )}
            {progressStatus === 'in_progress' && (
              <button className="btn btn-success btn-sm" onClick={() => updateProgress('completed')}>✓ Урок пройден</button>
            )}
            {progressStatus === 'completed' && (
              <button className="btn btn-ghost btn-sm" onClick={() => updateProgress('in_progress')}>↩ Повторить</button>
            )}

            {/* Prev / Next */}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              {prevLesson && (
                <Link href={`/lesson/${prevLesson.id}`} className="btn btn-ghost btn-sm">
                  ← {prevLesson.level}{prevLesson.lesson_number}
                </Link>
              )}
              {nextLesson && (
                <Link href={`/lesson/${nextLesson.id}`} className="btn btn-primary btn-sm">
                  {nextLesson.level}{nextLesson.lesson_number} →
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* PDF */}
        {lesson.pdf_url ? (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="flex-between" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>📄 Материал урока</span>
              <a href={lesson.pdf_url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                Открыть в новой вкладке ↗
              </a>
            </div>
            <iframe src={lesson.pdf_url} width="100%" height="620px" style={{ border: 'none', display: 'block' }} />
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📄</div>
            <p style={{ color: 'var(--text2)' }}>PDF для этого урока ещё загружается</p>
          </div>
        )}

        {/* Submit essay */}
        <div className="card mt-16">
          <div className="flex-between" style={{ marginBottom: 16 }}>
            <h2 className="card-title" style={{ marginBottom: 0 }}>✍️ Сдать задание</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className={`timer-box ${timerClass}`}>
                ⏱ {formatTime(timeLeft)}
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => {
                if (timerActive) { setTimerActive(false); setTimeLeft(TIMER_SECONDS) }
                else { setTimerActive(true) }
              }}>
                {timerActive ? '⏸ Стоп' : '▶ Таймер'}
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
            <textarea
              className="form-input form-textarea"
              rows={9}
              placeholder="Начни писать здесь..."
              value={essay}
              onChange={e => { setEssay(e.target.value); if (!timerActive && e.target.value.length === 1) setTimerActive(true) }}
            />
            <div className="word-count">
              <div>Слов: <span style={{ color: wordCount >= 250 ? 'var(--accent3)' : wordCount >= 150 ? 'var(--gold)' : 'var(--text)' }}>{wordCount}</span></div>
              <div>Символов: <span>{charCount}</span></div>
              {taskType === 'task2' && <div style={{ color: wordCount >= 250 ? 'var(--accent3)' : 'var(--text3)' }}>{wordCount >= 250 ? '✓ Минимум выполнен' : `ещё ${250 - wordCount} слов до минимума`}</div>}
              {taskType === 'task1' && <div style={{ color: wordCount >= 150 ? 'var(--accent3)' : 'var(--text3)' }}>{wordCount >= 150 ? '✓ Минимум выполнен' : `ещё ${150 - wordCount} слов до минимума`}</div>}
            </div>
          </div>

          {success && <div className="alert alert-success">✓ Отправлено! Учитель проверит и оставит комментарий.</div>}

          <button className="btn btn-primary" onClick={submitEssay} disabled={submitting || !essay.trim()} style={{ width: '100%', padding: '14px' }}>
            {submitting ? 'Отправляю...' : '📤 Отправить на проверку'}
          </button>
        </div>

        {/* Submissions */}
        {submissions.length > 0 && (
          <div className="card mt-16">
            <h2 className="card-title">📋 Мои работы ({submissions.length})</h2>
            {submissions.map(sub => (
              <div key={sub.id} className="submission-item">
                <div className="flex-between">
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
                    <strong>💬 ФИДБЭК УЧИТЕЛЯ {fb.score ? `· Band ${fb.score}` : ''}</strong>
                    <div style={{ lineHeight: 1.7, color: 'var(--text2)' }}>{fb.comment}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Bottom nav */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '24px 0 40px', gap: 12 }}>
          {prevLesson ? (
            <Link href={`/lesson/${prevLesson.id}`} className="btn btn-ghost">
              ← {prevLesson.level}{prevLesson.lesson_number}
            </Link>
          ) : <div/>}
          {nextLesson && (
            <Link href={`/lesson/${nextLesson.id}`} className="btn btn-primary">
              Следующий урок: {nextLesson.level}{nextLesson.lesson_number} →
            </Link>
          )}
        </div>
      </div>
    </>
  )
}
