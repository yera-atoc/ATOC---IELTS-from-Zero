'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

type Lesson = { id: number; level: string; lesson_number: number; title: string; grammar_topic: string; pdf_url: string | null }
type Submission = { id: number; task_type: string; content: string; status: string; submitted_at: string; feedback?: { comment: string; score: number | null }[] }

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const lessonId = params.id as string

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [userId, setUserId] = useState<string>('')
  const [essay, setEssay] = useState('')
  const [taskType, setTaskType] = useState('task2')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [progressStatus, setProgressStatus] = useState('not_started')

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }
      setUserId(user.id)

      const [{ data: les }, { data: subs }, { data: prog }] = await Promise.all([
        supabase.from('lessons').select('*').eq('id', lessonId).single(),
        supabase.from('submissions').select('*, feedback(comment, score)')
          .eq('lesson_id', lessonId).eq('student_id', user.id).order('submitted_at', { ascending: false }),
        supabase.from('progress').select('status').eq('lesson_id', lessonId).eq('student_id', user.id).single(),
      ])
      setLesson(les)
      setSubmissions(subs || [])
      setProgressStatus(prog?.status || 'not_started')
      setLoading(false)
    }
    load()
  }, [lessonId, router])

  const markInProgress = async () => {
    const supabase = createClient()
    await supabase.from('progress').upsert({
      student_id: userId, lesson_id: parseInt(lessonId), status: 'in_progress'
    })
    setProgressStatus('in_progress')
  }

  const markCompleted = async () => {
    const supabase = createClient()
    await supabase.from('progress').upsert({
      student_id: userId, lesson_id: parseInt(lessonId), status: 'completed', completed_at: new Date().toISOString()
    })
    setProgressStatus('completed')
  }

  const submitEssay = async () => {
    if (!essay.trim()) return
    setSubmitting(true)
    const supabase = createClient()
    await supabase.from('submissions').insert({
      student_id: userId, lesson_id: parseInt(lessonId),
      task_type: taskType, content: essay.trim()
    })
    // refresh
    const { data: subs } = await supabase.from('submissions')
      .select('*, feedback(comment, score)')
      .eq('lesson_id', lessonId).eq('student_id', userId)
      .order('submitted_at', { ascending: false })
    setSubmissions(subs || [])
    setEssay('')
    setSuccess(true)
    setSubmitting(false)
    setTimeout(() => setSuccess(false), 3000)
  }

  if (loading) return <div className="loading">Загрузка урока...</div>
  if (!lesson) return <div className="loading">Урок не найден</div>

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">Ato<span>C</span> · IELTS</div>
        <Link href="/dashboard" className="btn btn-sm" style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.88rem' }}>
          ← Назад к урокам
        </Link>
      </nav>

      <div className="container">
        <div className="page-header">
          <div className="flex-between">
            <div>
              <div style={{ marginBottom: 6 }}>
                <span className={`badge badge-${lesson.level.toLowerCase()}`}>Уровень {lesson.level}</span>
                <span style={{ marginLeft: 10 }} className={`badge badge-${progressStatus}`}>
                  {progressStatus === 'completed' ? '✓ Пройден' : progressStatus === 'in_progress' ? '↻ В процессе' : '○ Не начат'}
                </span>
              </div>
              <h1 className="page-title">{lesson.title}</h1>
              <p className="page-subtitle">{lesson.grammar_topic}</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {progressStatus === 'not_started' && (
                <button className="btn btn-outline btn-sm" onClick={markInProgress}>Начать урок</button>
              )}
              {progressStatus === 'in_progress' && (
                <button className="btn btn-accent btn-sm" onClick={markCompleted}>✓ Отметить пройденным</button>
              )}
              {progressStatus === 'completed' && (
                <button className="btn btn-outline btn-sm" onClick={() => setProgressStatus('in_progress')}>Пересмотреть</button>
              )}
            </div>
          </div>
        </div>

        {/* PDF */}
        {lesson.pdf_url ? (
          <div className="card">
            <div className="flex-between" style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>📄 Материал урока</h2>
              <a href={lesson.pdf_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                Открыть PDF
              </a>
            </div>
            <iframe src={lesson.pdf_url} width="100%" height="600px"
              style={{ border: 'none', borderRadius: 8 }} />
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>📄</div>
            <p>PDF для этого урока ещё не загружен.</p>
            <p style={{ fontSize: '0.85rem', marginTop: 6 }}>Учитель добавит его скоро.</p>
          </div>
        )}

        {/* Submit essay */}
        <div className="card mt-16">
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 16 }}>✍️ Сдать задание</h2>
          
          <div className="form-group">
            <label className="form-label">Тип задания</label>
            <select className="form-input" value={taskType} onChange={e => setTaskType(e.target.value)}
              style={{ cursor: 'pointer' }}>
              <option value="task1">IELTS Task 1</option>
              <option value="task2">IELTS Task 2 (эссе)</option>
              <option value="exercise">Упражнение из урока</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Твой ответ / эссе</label>
            <textarea className="form-input form-textarea" rows={8}
              placeholder="Напиши свой ответ здесь..."
              value={essay} onChange={e => setEssay(e.target.value)} />
          </div>

          {success && <div className="alert alert-success">✓ Задание отправлено! Учитель проверит и оставит комментарий.</div>}

          <button className="btn btn-accent" onClick={submitEssay}
            disabled={submitting || !essay.trim()}>
            {submitting ? 'Отправляю...' : 'Отправить на проверку'}
          </button>
        </div>

        {/* Previous submissions */}
        {submissions.length > 0 && (
          <div className="card mt-16">
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 16 }}>
              📋 Мои работы ({submissions.length})
            </h2>
            {submissions.map(sub => (
              <div key={sub.id} className="submission-item">
                <div className="flex-between">
                  <span className="badge badge-pending" style={{ marginBottom: 8 }}>
                    {sub.task_type === 'task1' ? 'Task 1' : sub.task_type === 'task2' ? 'Task 2' : 'Упражнение'}
                  </span>
                  <span className={`badge badge-${sub.status}`}>
                    {sub.status === 'reviewed' ? '✓ Проверено' : '⏳ Ожидает проверки'}
                  </span>
                </div>
                <div className="submission-content">{sub.content}</div>
                <div className="text-muted" style={{ fontSize: '0.8rem', marginBottom: 8 }}>
                  Отправлено: {new Date(sub.submitted_at).toLocaleString('ru-RU')}
                </div>
                {sub.feedback && sub.feedback.length > 0 && sub.feedback.map((fb, i) => (
                  <div key={i} className="feedback-box">
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>
                      💬 Фидбэк учителя {fb.score ? `· Band ${fb.score}` : ''}
                    </div>
                    <div style={{ lineHeight: 1.6 }}>{fb.comment}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
        <div style={{ height: 40 }} />
      </div>
    </>
  )
}
