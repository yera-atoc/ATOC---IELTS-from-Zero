'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type Student = { id: string; full_name: string; email: string; current_level: string; created_at: string }
type Submission = {
  id: number; task_type: string; content: string; status: string; submitted_at: string;
  lesson: { title: string; level: string; lesson_number: number };
  profile: { full_name: string; email: string };
  feedback?: { comment: string; score: number | null }[]
}

export default function TeacherDashboard() {
  const router = useRouter()
  const [tab, setTab] = useState<'submissions' | 'students' | 'lessons'>('submissions')
  const [students, setStudents] = useState<Student[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [lessons, setLessons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [teacherId, setTeacherId] = useState('')
  const [feedbackMap, setFeedbackMap] = useState<Record<number, { comment: string; score: string }>>({})
  const [savingId, setSavingId] = useState<number | null>(null)
  const [pdfInput, setPdfInput] = useState<Record<number, string>>({})

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role !== 'teacher') { router.push('/dashboard'); return }
      setTeacherId(user.id)

      const [{ data: studs }, { data: subs }, { data: les }] = await Promise.all([
        supabase.from('profiles').select('*').eq('role', 'student').order('created_at', { ascending: false }),
        supabase.from('submissions')
          .select('*, lesson:lessons(title, level, lesson_number), profile:profiles(full_name, email), feedback(comment, score)')
          .order('submitted_at', { ascending: false }),
        supabase.from('lessons').select('*').order('order_index'),
      ])
      setStudents(studs || [])
      setSubmissions(subs || [])
      setLessons(les || [])
      setLoading(false)
    }
    load()
  }, [router])

  const saveFeedback = async (subId: number) => {
    const fb = feedbackMap[subId]
    if (!fb?.comment?.trim()) return
    setSavingId(subId)
    const supabase = createClient()
    await supabase.from('feedback').insert({
      submission_id: subId, teacher_id: teacherId,
      comment: fb.comment, score: fb.score ? parseInt(fb.score) : null
    })
    await supabase.from('submissions').update({ status: 'reviewed' }).eq('id', subId)
    // refresh
    const { data: subs } = await supabase.from('submissions')
      .select('*, lesson:lessons(title, level, lesson_number), profile:profiles(full_name, email), feedback(comment, score)')
      .order('submitted_at', { ascending: false })
    setSubmissions(subs || [])
    setFeedbackMap(prev => { const n = { ...prev }; delete n[subId]; return n })
    setSavingId(null)
  }

  const updatePdfUrl = async (lessonId: number) => {
    const url = pdfInput[lessonId]
    if (!url?.trim()) return
    const supabase = createClient()
    await supabase.from('lessons').update({ pdf_url: url.trim() }).eq('id', lessonId)
    setLessons(prev => prev.map(l => l.id === lessonId ? { ...l, pdf_url: url.trim() } : l))
    setPdfInput(prev => { const n = { ...prev }; delete n[lessonId]; return n })
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth')
  }

  const pendingCount = submissions.filter(s => s.status === 'pending').length

  if (loading) return <div className="loading">Загрузка...</div>

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">Ato<span>C</span> · Кабинет учителя</div>
        <div>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginRight: 16 }}>
            👩‍🏫 Учитель
          </span>
          <button onClick={handleLogout}
            style={{ background: 'none', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem' }}>
            Выйти
          </button>
        </div>
      </nav>

      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Панель учителя</h1>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{students.length}</div>
            <div className="stat-label">Студентов</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ color: pendingCount > 0 ? '#e74c3c' : '#f4a261' }}>{pendingCount}</div>
            <div className="stat-label">Ожидают проверки</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{submissions.length}</div>
            <div className="stat-label">Всего работ</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{lessons.filter(l => l.pdf_url).length}</div>
            <div className="stat-label">Уроков с PDF</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab ${tab === 'submissions' ? 'active' : ''}`} onClick={() => setTab('submissions')}>
            Работы студентов {pendingCount > 0 && <span style={{ marginLeft: 6, background: '#e74c3c', color: 'white', borderRadius: 99, padding: '1px 7px', fontSize: '0.78rem' }}>{pendingCount}</span>}
          </button>
          <button className={`tab ${tab === 'students' ? 'active' : ''}`} onClick={() => setTab('students')}>
            Студенты ({students.length})
          </button>
          <button className={`tab ${tab === 'lessons' ? 'active' : ''}`} onClick={() => setTab('lessons')}>
            Уроки и PDF
          </button>
        </div>

        {/* SUBMISSIONS TAB */}
        {tab === 'submissions' && (
          <div>
            {submissions.length === 0 && (
              <div className="card" style={{ textAlign: 'center', color: '#999', padding: 40 }}>
                Пока нет ни одной работы от студентов
              </div>
            )}
            {submissions.map(sub => (
              <div key={sub.id} className="card">
                <div className="flex-between" style={{ marginBottom: 12 }}>
                  <div>
                    <span style={{ fontWeight: 700 }}>{sub.profile?.full_name || sub.profile?.email}</span>
                    <span className="text-muted" style={{ marginLeft: 10 }}>
                      {sub.lesson?.level}{sub.lesson?.lesson_number} · {sub.lesson?.title}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className={`badge badge-${sub.task_type}`}>
                      {sub.task_type === 'task1' ? 'Task 1' : sub.task_type === 'task2' ? 'Task 2' : 'Упражнение'}
                    </span>
                    <span className={`badge badge-${sub.status}`}>
                      {sub.status === 'reviewed' ? '✓ Проверено' : '⏳ Ожидает'}
                    </span>
                  </div>
                </div>

                <div className="submission-content">{sub.content}</div>
                <div className="text-muted mt-8">
                  {new Date(sub.submitted_at).toLocaleString('ru-RU')}
                </div>

                {/* Existing feedback */}
                {sub.feedback && sub.feedback.length > 0 && sub.feedback.map((fb, i) => (
                  <div key={i} className="feedback-box mt-8">
                    <strong>Твой фидбэк{fb.score ? ` · Band ${fb.score}` : ''}:</strong>
                    <div style={{ marginTop: 4, lineHeight: 1.6 }}>{fb.comment}</div>
                  </div>
                ))}

                {/* Add feedback */}
                {sub.status === 'pending' && (
                  <div style={{ marginTop: 14, borderTop: '1px solid #f0f0f0', paddingTop: 14 }}>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                      <textarea
                        className="form-input form-textarea"
                        style={{ minHeight: 80, flex: 1 }}
                        placeholder="Напиши комментарий к работе..."
                        value={feedbackMap[sub.id]?.comment || ''}
                        onChange={e => setFeedbackMap(prev => ({
                          ...prev, [sub.id]: { ...prev[sub.id], comment: e.target.value }
                        }))}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 100 }}>
                        <label className="form-label" style={{ marginBottom: 0 }}>Band (1-9)</label>
                        <input className="form-input" type="number" min={1} max={9}
                          style={{ width: 80 }}
                          placeholder="6"
                          value={feedbackMap[sub.id]?.score || ''}
                          onChange={e => setFeedbackMap(prev => ({
                            ...prev, [sub.id]: { ...prev[sub.id], score: e.target.value }
                          }))}
                        />
                      </div>
                    </div>
                    <button className="btn btn-accent btn-sm" onClick={() => saveFeedback(sub.id)}
                      disabled={savingId === sub.id || !feedbackMap[sub.id]?.comment?.trim()}>
                      {savingId === sub.id ? 'Сохраняю...' : '💬 Отправить фидбэк'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* STUDENTS TAB */}
        {tab === 'students' && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {students.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#999', padding: 40 }}>Пока нет студентов</div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Студент</th>
                    <th>Email</th>
                    <th>Уровень</th>
                    <th>Регистрация</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600 }}>{s.full_name || '—'}</td>
                      <td className="text-muted">{s.email}</td>
                      <td><span className={`badge badge-${(s.current_level || 'a').toLowerCase()}`}>
                        Уровень {s.current_level || 'A'}
                      </span></td>
                      <td className="text-muted">{new Date(s.created_at).toLocaleDateString('ru-RU')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* LESSONS TAB */}
        {tab === 'lessons' && (
          <div>
            <div className="alert" style={{ background: '#e8f4fd', color: '#1a5276', border: '1px solid #aed6f1', marginBottom: 20 }}>
              💡 Загрузи PDF в Supabase Storage, скопируй публичную ссылку и вставь сюда
            </div>
            {['A', 'B', 'C'].map(level => (
              <div key={level} style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12, color: '#555' }}>
                  Уровень {level}
                </h3>
                {lessons.filter(l => l.level === level).map(lesson => (
                  <div key={lesson.id} className="card card-sm" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ minWidth: 40, color: '#999', fontSize: '0.85rem', fontWeight: 600 }}>
                      {lesson.level}{lesson.lesson_number}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 2 }}>{lesson.title}</div>
                      {lesson.pdf_url ? (
                        <a href={lesson.pdf_url} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: '0.8rem', color: '#27ae60' }}>
                          ✓ PDF загружен
                        </a>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#e74c3c' }}>PDF не добавлен</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', minWidth: 320 }}>
                      <input className="form-input" style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                        placeholder="https://... ссылка на PDF"
                        value={pdfInput[lesson.id] || lesson.pdf_url || ''}
                        onChange={e => setPdfInput(prev => ({ ...prev, [lesson.id]: e.target.value }))} />
                      <button className="btn btn-primary btn-sm" onClick={() => updatePdfUrl(lesson.id)}>
                        Сохранить
                      </button>
                    </div>
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
