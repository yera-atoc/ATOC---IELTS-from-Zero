'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

type Lesson = { id: number; level: string; lesson_number: number; title: string; grammar_topic: string; pdf_url: string | null }
type Progress = { lesson_id: number; status: string }
type Profile = { full_name: string; email: string; current_level: string }

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

  const getStatus = (lessonId: number) =>
    progress.find(p => p.lesson_id === lessonId)?.status || 'not_started'

  const completedCount = progress.filter(p => p.status === 'completed').length
  const totalLessons = lessons.length

  const levelLessons = lessons.filter(l => l.level === activeLevel)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth')
  }

  if (loading) return <div className="loading">Загрузка...</div>

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">Ato<span>C</span> · IELTS</div>
        <div>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem', marginRight: 16 }}>
            {profile?.full_name || profile?.email}
          </span>
          <button onClick={handleLogout}
            style={{ background: 'none', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem' }}>
            Выйти
          </button>
        </div>
      </nav>

      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Мои уроки</h1>
          <p className="page-subtitle">Привет, {profile?.full_name || 'студент'} 👋</p>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{completedCount}</div>
            <div className="stat-label">Уроков пройдено</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{totalLessons - completedCount}</div>
            <div className="stat-label">Осталось</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{totalLessons > 0 ? Math.round(completedCount / totalLessons * 100) : 0}%</div>
            <div className="stat-label">Прогресс</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="card" style={{ padding: '16px 20px', marginBottom: 24 }}>
          <div className="flex-between" style={{ marginBottom: 8 }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Общий прогресс</span>
            <span className="text-muted">{completedCount} / {totalLessons}</span>
          </div>
          <div className="progress-bar-wrap">
            <div className="progress-bar-fill"
              style={{ width: `${totalLessons > 0 ? completedCount / totalLessons * 100 : 0}%` }} />
          </div>
        </div>

        {/* Level tabs */}
        <div className="tabs">
          {['A', 'B', 'C'].map(level => (
            <button key={level} className={`tab ${activeLevel === level ? 'active' : ''}`}
              onClick={() => setActiveLevel(level)}>
              Уровень {level}
              <span style={{ marginLeft: 6, fontSize: '0.8rem', color: '#999' }}>
                ({lessons.filter(l => l.level === level && getStatus(l.id) === 'completed').length}/
                {lessons.filter(l => l.level === level).length})
              </span>
            </button>
          ))}
        </div>

        {/* Lessons grid */}
        <div className="lessons-grid">
          {levelLessons.map(lesson => {
            const status = getStatus(lesson.id)
            return (
              <Link key={lesson.id} href={`/lesson/${lesson.id}`}
                className={`lesson-card level-${lesson.level.toLowerCase()} ${status === 'completed' ? 'completed' : ''}`}>
                <div className="flex-between" style={{ marginBottom: 8 }}>
                  <div className="lesson-number">{lesson.level}{lesson.lesson_number}</div>
                  <span className={`badge badge-${status}`}>
                    {status === 'completed' ? '✓ Пройден' : status === 'in_progress' ? '↻ В процессе' : '○ Не начат'}
                  </span>
                </div>
                <div className="lesson-title">{lesson.title}</div>
                <div className="lesson-topic">{lesson.grammar_topic}</div>
                {lesson.pdf_url && (
                  <div style={{ marginTop: 10, fontSize: '0.8rem', color: '#2980b9' }}>📄 PDF доступен</div>
                )}
              </Link>
            )
          })}
          {levelLessons.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: '#999' }}>
              Уроки уровня {activeLevel} скоро появятся
            </div>
          )}
        </div>
        <div style={{ height: 40 }} />
      </div>
    </>
  )
}
