'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type Student = { id: string; full_name: string; email: string; current_level: string; created_at: string; streak?: number }
type Submission = {
  id: number; task_type: string; content: string; status: string; submitted_at: string;
  lesson: { title: string; level: string; lesson_number: number };
  profile: { full_name: string; email: string };
  feedback?: { comment: string; score: number | null }[]
}

export default function TeacherDashboard() {
  const router = useRouter()
  const [tab, setTab] = useState<'submissions'|'students'|'lessons'>('submissions')
  const [students, setStudents] = useState<Student[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [lessons, setLessons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [teacherId, setTeacherId] = useState('')
  const [feedbackMap, setFeedbackMap] = useState<Record<number,{comment:string;score:string}>>({})
  const [savingId, setSavingId] = useState<number|null>(null)
  const [pdfInput, setPdfInput] = useState<Record<number,string>>({})
  const [saved, setSaved] = useState<number|null>(null)

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
        supabase.from('submissions').select('*, lesson:lessons(title,level,lesson_number), profile:profiles(full_name,email), feedback(comment,score)').order('submitted_at', { ascending: false }),
        supabase.from('lessons').select('*').order('order_index'),
      ])
      setStudents(studs || []); setSubmissions(subs || []); setLessons(les || [])
      setLoading(false)
    }
    load()
  }, [router])

  const saveFeedback = async (subId: number) => {
    const fb = feedbackMap[subId]
    if (!fb?.comment?.trim()) return
    setSavingId(subId)
    const supabase = createClient()
    await supabase.from('feedback').insert({ submission_id: subId, teacher_id: teacherId, comment: fb.comment, score: fb.score ? parseInt(fb.score) : null })
    await supabase.from('submissions').update({ status: 'reviewed' }).eq('id', subId)
    const { data: subs } = await supabase.from('submissions').select('*, lesson:lessons(title,level,lesson_number), profile:profiles(full_name,email), feedback(comment,score)').order('submitted_at', { ascending: false })
    setSubmissions(subs || [])
    setFeedbackMap(prev => { const n = {...prev}; delete n[subId]; return n })
    setSavingId(null)
  }

  const updatePdfUrl = async (lessonId: number) => {
    const url = pdfInput[lessonId]
    if (!url?.trim()) return
    const supabase = createClient()
    await supabase.from('lessons').update({ pdf_url: url.trim() }).eq('id', lessonId)
    setLessons(prev => prev.map(l => l.id === lessonId ? { ...l, pdf_url: url.trim() } : l))
    setSaved(lessonId)
    setTimeout(() => setSaved(null), 2000)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth')
  }

  const pendingCount = submissions.filter(s => s.status === 'pending').length
  const levelColor = (l: string) => l === 'A' ? '#4fc3f7' : l === 'B' ? '#81c784' : '#ce93d8'

  if (loading) return (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',background:'#0a0a0f',fontFamily:'Nunito,sans-serif',color:'#5a5a7a' }}>
      Загрузка...
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Syne:wght@700;800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:'Nunito',sans-serif; background:#0a0a0f; color:#f0f0f8; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .fade { animation:fadeUp 0.3s ease both; }
        .tab-btn { flex:1; padding:12px 8px; cursor:pointer; border:none; background:transparent; font-family:'Nunito',sans-serif; font-size:0.88rem; font-weight:700; color:#5a5a7a; border-radius:10px; transition:all 0.2s; text-align:center; position:relative; }
        .tab-btn.on { background:#1a1a28; color:#f0f0f8; }
        .tab-btn.on::after { content:''; display:block; width:28px; height:2px; background:linear-gradient(90deg,#7c6fff,#00d4aa); border-radius:99px; margin:4px auto 0; }
        .sub-card { background:#0f0f1a; border:1px solid rgba(255,255,255,0.06); border-radius:16px; padding:20px 24px; margin-bottom:14px; transition:border-color 0.2s; }
        .sub-card:hover { border-color:rgba(124,111,255,0.2); }
        .feedback-input { width:100%; padding:12px 16px; background:#08080f; border:1px solid rgba(255,255,255,0.07); border-radius:10px; color:#d0d0e8; font-family:'Nunito',sans-serif; font-size:0.9rem; resize:vertical; min-height:90px; outline:none; transition:border-color 0.2s; }
        .feedback-input:focus { border-color:rgba(124,111,255,0.4); }
        .send-btn { padding:10px 20px; background:linear-gradient(135deg,#7c6fff,#5a4fd4); border:none; border-radius:10px; color:white; font-family:'Nunito',sans-serif; font-weight:800; font-size:0.88rem; cursor:pointer; transition:all 0.2s; }
        .send-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 4px 16px rgba(124,111,255,0.4); }
        .send-btn:disabled { opacity:0.4; cursor:not-allowed; }
        .stat-card { background:#0f0f1a; border:1px solid rgba(255,255,255,0.05); border-radius:16px; padding:20px; text-align:center; }
        .lesson-row { display:flex; gap:12px; align-items:center; background:#0f0f1a; border:1px solid rgba(255,255,255,0.05); border-radius:12px; padding:14px 16px; margin-bottom:8px; }
        .pdf-input { flex:1; padding:10px 14px; background:#08080f; border:1px solid rgba(255,255,255,0.07); border-radius:9px; color:#d0d0e8; font-family:'Nunito',sans-serif; font-size:0.85rem; outline:none; }
        .pdf-input:focus { border-color:rgba(124,111,255,0.35); }
      `}</style>

      {/* NAVBAR */}
      <nav style={{ position:'sticky',top:0,zIndex:100,background:'rgba(8,8,14,0.95)',backdropFilter:'blur(24px)',borderBottom:'1px solid rgba(255,255,255,0.05)',padding:'0 24px',height:58,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
        <span style={{ fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'1.1rem' }}>
          Ato<span style={{ color:'#7c6fff' }}>C</span> · Учитель
        </span>
        <div style={{ display:'flex',alignItems:'center',gap:12 }}>
          <span style={{ fontSize:'0.82rem',color:'#5a5a7a' }}>👩‍🏫 Учитель</span>
          <button onClick={handleLogout} style={{ padding:'7px 14px',background:'#1a1a28',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,color:'#7070a0',cursor:'pointer',fontSize:'0.82rem',fontWeight:700 }}>
            Выйти
          </button>
        </div>
      </nav>

      <div style={{ maxWidth:920,margin:'0 auto',padding:'0 20px' }}>

        {/* Header */}
        <div style={{ padding:'28px 0 20px' }}>
          <h1 style={{ fontFamily:'Syne,sans-serif',fontSize:'1.8rem',fontWeight:800,marginBottom:4 }}>Панель учителя</h1>
          <p style={{ color:'#5a5a7a',fontSize:'0.9rem' }}>Управляй студентами, проверяй работы, обновляй уроки</p>
        </div>

        {/* Stats */}
        <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:24 }}>
          {[
            { n: students.length, label:'Студентов', color:'#7c6fff' },
            { n: pendingCount, label:'Ожидают проверки', color: pendingCount > 0 ? '#ff6b6b' : '#5a5a7a' },
            { n: submissions.length, label:'Всего работ', color:'#00d4aa' },
            { n: lessons.filter(l => l.pdf_url).length, label:'Уроков с PDF', color:'#ffc107' },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div style={{ fontFamily:'Syne,sans-serif',fontSize:'2rem',fontWeight:800,color:s.color }}>{s.n}</div>
              <div style={{ fontSize:'0.75rem',color:'#5a5a7a',marginTop:4,fontWeight:600 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:'flex',gap:4,background:'#0c0c16',borderRadius:14,padding:4,border:'1px solid rgba(255,255,255,0.05)',marginBottom:24 }}>
          <button className={`tab-btn ${tab==='submissions'?'on':''}`} onClick={()=>setTab('submissions')}>
            Работы {pendingCount > 0 && <span style={{ background:'#ff6b6b',color:'white',borderRadius:99,padding:'1px 7px',fontSize:'0.72rem',marginLeft:6 }}>{pendingCount}</span>}
          </button>
          <button className={`tab-btn ${tab==='students'?'on':''}`} onClick={()=>setTab('students')}>
            Студенты ({students.length})
          </button>
          <button className={`tab-btn ${tab==='lessons'?'on':''}`} onClick={()=>setTab('lessons')}>
            Уроки и PDF
          </button>
        </div>

        {/* SUBMISSIONS */}
        {tab==='submissions' && (
          <div className="fade">
            {submissions.length === 0 ? (
              <div style={{ textAlign:'center',padding:'60px 20px',color:'#4a4a6a' }}>
                <div style={{ fontSize:'2.5rem',marginBottom:12 }}>📭</div>
                <p style={{ fontWeight:700,color:'#6060a0' }}>Работ пока нет</p>
              </div>
            ) : submissions.map(sub => (
              <div key={sub.id} className="sub-card">
                {/* Header */}
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12,flexWrap:'wrap',gap:8 }}>
                  <div>
                    <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:4,flexWrap:'wrap' }}>
                      <span style={{ fontWeight:800,fontSize:'0.95rem',color:'#e0e0f8' }}>{sub.profile?.full_name || sub.profile?.email}</span>
                      <span style={{ fontSize:'0.72rem',fontWeight:700,padding:'3px 10px',borderRadius:99,background:`${levelColor(sub.lesson?.level)}18`,color:levelColor(sub.lesson?.level) }}>
                        {sub.lesson?.level}{sub.lesson?.lesson_number}
                      </span>
                      <span style={{ fontSize:'0.72rem',color:'#5a5a7a' }}>{sub.lesson?.title?.replace(/^[A-C]\d+\s*·\s*/,'')}</span>
                    </div>
                    <div style={{ display:'flex',gap:8,alignItems:'center' }}>
                      <span style={{ fontSize:'0.75rem',fontWeight:700,padding:'3px 10px',borderRadius:99,background:'rgba(255,255,255,0.05)',color:'#8080a8' }}>
                        {sub.task_type==='task1'?'Task 1':sub.task_type==='task2'?'Task 2':'Упражнение'}
                      </span>
                      <span style={{ fontSize:'0.72rem',color:'#4a4a6a' }}>{new Date(sub.submitted_at).toLocaleDateString('ru-RU',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</span>
                    </div>
                  </div>
                  <span style={{ fontSize:'0.73rem',fontWeight:800,padding:'4px 12px',borderRadius:99,
                    background:sub.status==='reviewed'?'rgba(0,212,170,0.1)':'rgba(255,193,7,0.1)',
                    color:sub.status==='reviewed'?'#00d4aa':'#ffc107'
                  }}>
                    {sub.status==='reviewed'?'✓ Проверено':'⏳ Ожидает'}
                  </span>
                </div>

                {/* Content */}
                <div style={{ background:'#08080f',borderRadius:10,padding:'12px 16px',fontSize:'0.88rem',lineHeight:1.75,color:'#8080a8',whiteSpace:'pre-wrap',border:'1px solid rgba(255,255,255,0.04)',maxHeight:160,overflow:'auto',marginBottom:12 }}>
                  {sub.content}
                </div>

                {/* Existing feedback */}
                {sub.feedback && sub.feedback.length > 0 && sub.feedback.map((fb, i) => (
                  <div key={i} style={{ background:'rgba(124,111,255,0.06)',border:'1px solid rgba(124,111,255,0.15)',borderRadius:12,padding:'12px 16px',marginBottom:10 }}>
                    <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6 }}>
                      <span style={{ fontSize:'0.7rem',fontWeight:800,letterSpacing:1,color:'#7c6fff',textTransform:'uppercase' }}>Твой фидбэк</span>
                      {fb.score && <span style={{ fontFamily:'Syne,sans-serif',fontWeight:800,color:'#ffc107',background:'rgba(255,193,7,0.1)',padding:'2px 12px',borderRadius:99,fontSize:'0.9rem' }}>Band {fb.score}</span>}
                    </div>
                    <p style={{ color:'#b0b0d0',fontSize:'0.88rem',lineHeight:1.7 }}>{fb.comment}</p>
                  </div>
                ))}

                {/* Add feedback */}
                {sub.status === 'pending' && (
                  <div style={{ borderTop:'1px solid rgba(255,255,255,0.05)',paddingTop:14 }}>
                    <div style={{ display:'flex',gap:10,alignItems:'flex-start' }}>
                      <textarea className="feedback-input"
                        placeholder="Напиши комментарий к работе студента..."
                        value={feedbackMap[sub.id]?.comment || ''}
                        onChange={e => setFeedbackMap(prev => ({ ...prev, [sub.id]: { ...prev[sub.id], comment: e.target.value } }))}
                      />
                      <div style={{ display:'flex',flexDirection:'column',gap:6,minWidth:90 }}>
                        <label style={{ fontSize:'0.72rem',fontWeight:800,color:'#4a4a6a',letterSpacing:0.5 }}>BAND</label>
                        <input type="number" min={1} max={9}
                          style={{ width:80,padding:'10px 12px',background:'#08080f',border:'1px solid rgba(255,255,255,0.07)',borderRadius:9,color:'#d0d0e8',fontFamily:'Nunito,sans-serif',fontSize:'1rem',fontWeight:800,textAlign:'center',outline:'none' }}
                          placeholder="6"
                          value={feedbackMap[sub.id]?.score || ''}
                          onChange={e => setFeedbackMap(prev => ({ ...prev, [sub.id]: { ...prev[sub.id], score: e.target.value } }))}
                        />
                      </div>
                    </div>
                    <div style={{ marginTop:10 }}>
                      <button className="send-btn" onClick={() => saveFeedback(sub.id)}
                        disabled={savingId === sub.id || !feedbackMap[sub.id]?.comment?.trim()}>
                        {savingId === sub.id ? '⟳ Сохраняю...' : '💬 Отправить фидбэк'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* STUDENTS */}
        {tab==='students' && (
          <div className="fade">
            {students.length === 0 ? (
              <div style={{ textAlign:'center',padding:'60px 20px',color:'#4a4a6a' }}>
                <div style={{ fontSize:'2.5rem',marginBottom:12 }}>👥</div>
                <p style={{ fontWeight:700,color:'#6060a0' }}>Студентов пока нет</p>
              </div>
            ) : students.map(s => (
              <div key={s.id} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',background:'#0f0f1a',border:'1px solid rgba(255,255,255,0.05)',borderRadius:14,padding:'16px 20px',marginBottom:10,flexWrap:'wrap',gap:10 }}>
                <div>
                  <div style={{ fontWeight:800,fontSize:'0.95rem',marginBottom:3 }}>{s.full_name || '—'}</div>
                  <div style={{ fontSize:'0.82rem',color:'#5a5a7a' }}>{s.email}</div>
                </div>
                <div style={{ display:'flex',gap:10,alignItems:'center' }}>
                  {s.streak && s.streak > 0 ? (
                    <span style={{ fontSize:'0.78rem',fontWeight:700,color:'#ffc107',background:'rgba(255,193,7,0.1)',padding:'4px 12px',borderRadius:99 }}>
                      🔥 {s.streak} дней
                    </span>
                  ) : null}
                  <span style={{ fontSize:'0.75rem',fontWeight:700,padding:'4px 12px',borderRadius:99,
                    background: s.current_level==='A'?'rgba(79,195,247,0.1)':s.current_level==='B'?'rgba(129,199,132,0.1)':'rgba(206,147,216,0.1)',
                    color: levelColor(s.current_level || 'A')
                  }}>
                    Уровень {s.current_level || 'A'}
                  </span>
                  <span style={{ fontSize:'0.75rem',color:'#4a4a6a' }}>{new Date(s.created_at).toLocaleDateString('ru-RU')}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LESSONS */}
        {tab==='lessons' && (
          <div className="fade">
            <div style={{ background:'rgba(0,212,170,0.06)',border:'1px solid rgba(0,212,170,0.15)',borderRadius:12,padding:'12px 18px',marginBottom:20,fontSize:'0.85rem',color:'#00d4aa',fontWeight:600 }}>
              💡 Загрузи PDF в Supabase Storage → скопируй публичную ссылку → вставь здесь
            </div>
            {['A','B','C'].map(level => (
              <div key={level} style={{ marginBottom:24 }}>
                <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:12 }}>
                  <span style={{ fontSize:'0.72rem',fontWeight:800,letterSpacing:2,textTransform:'uppercase',color:levelColor(level),background:`${levelColor(level)}15`,padding:'4px 12px',borderRadius:99 }}>
                    Уровень {level}
                  </span>
                  <span style={{ fontSize:'0.75rem',color:'#4a4a6a' }}>
                    {lessons.filter(l=>l.level===level&&l.pdf_url).length}/{lessons.filter(l=>l.level===level).length} с PDF
                  </span>
                </div>
                {lessons.filter(l => l.level === level).map(lesson => (
                  <div key={lesson.id} className="lesson-row">
                    <span style={{ minWidth:36,fontSize:'0.78rem',fontWeight:800,color:'#4a4a6a' }}>{lesson.level}{lesson.lesson_number}</span>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ fontSize:'0.88rem',fontWeight:700,color:'#d0d0e8',marginBottom:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>
                        {lesson.title?.replace(/^[A-C]\d+\s*·\s*/,'')}
                      </div>
                      {lesson.pdf_url
                        ? <span style={{ fontSize:'0.72rem',color:'#00d4aa',fontWeight:700 }}>✓ PDF загружен</span>
                        : <span style={{ fontSize:'0.72rem',color:'#ff6b6b',fontWeight:600 }}>PDF не добавлен</span>
                      }
                    </div>
                    <input className="pdf-input"
                      style={{ maxWidth:280 }}
                      placeholder="https://... ссылка на PDF"
                      value={pdfInput[lesson.id] ?? lesson.pdf_url ?? ''}
                      onChange={e => setPdfInput(prev => ({ ...prev, [lesson.id]: e.target.value }))}
                    />
                    <button onClick={() => updatePdfUrl(lesson.id)}
                      style={{ padding:'9px 16px',background:saved===lesson.id?'rgba(0,212,170,0.15)':'rgba(124,111,255,0.15)',border:`1px solid ${saved===lesson.id?'rgba(0,212,170,0.3)':'rgba(124,111,255,0.3)'}`,borderRadius:9,color:saved===lesson.id?'#00d4aa':'#a0a0ff',fontWeight:800,cursor:'pointer',fontSize:'0.82rem',whiteSpace:'nowrap',transition:'all 0.2s' }}>
                      {saved === lesson.id ? '✓ Сохранено' : 'Сохранить'}
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        <div style={{ height:48 }}/>
      </div>
    </>
  )
}
