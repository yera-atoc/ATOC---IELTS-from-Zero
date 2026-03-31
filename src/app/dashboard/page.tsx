'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type Lesson = { id: number; level: string; lesson_number: number; title: string; grammar_topic: string; pdf_url: string | null }
type Progress = { lesson_id: number; status: string }
type Profile = { full_name: string; email: string }

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

  const levelColors: Record<string, string> = { A: 'var(--accent-a)', B: 'var(--accent-b)', C: 'var(--accent-c)' }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth')
  }

  if (loading) return (
    <div className="loading">
      <div><span className="loading-dot"/><span className="loading-dot"/><span className="loading-dot"/></div>
    </div>
  )

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">Ato<span>C</span> · IELTS</div>
        <div className="navbar-right">
          <span className="navbar-user">{profile?.full_name || profile?.email}</span>
          <button onClick={handleLogout} className="btn btn-ghost btn-sm">Выйти</button>
        </div>
      </nav>

      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Привет, {profile?.full_name?.split(' ')[0] || 'студент'} 👋</h1>
          <p className="page-subtitle">Продолжай учиться — ты на правильном пути</p>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{completedCount}</div>
            <div className="stat-label">Пройдено</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ color: 'var(--gold)' }}>{inProgressCount}</div>
            <div className="stat-label">В процессе</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ color: 'var(--accent3)' }}>{totalLessons > 0 ? Math.round(completedCount / totalLessons * 100) : 0}%</div>
            <div className="stat-label">Прогресс</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="card" style={{ padding: '18px 20px', marginBottom: 24 }}>
          <div className="flex-between" style={{ marginBottom: 10 }}>
            <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>Общий прогресс курса</span>
            <span className="text-muted">{completedCount} / {totalLessons} уроков</span>
          </div>
          <div className="progress-wrap">
            <div className="progress-fill" style={{ width: `${totalLessons > 0 ? completedCount / totalLessons * 100 : 0}%` }} />
          </div>
        </div>

        {/* Level tabs */}
        <div className="tabs">
          {(['A', 'B', 'C'] as const).map(level => {
            const lvlLessons = lessons.filter(l => l.level === level)
            const lvlDone = lvlLessons.filter(l => getStatus(l.id) === 'completed').length
            return (
              <button key={level} className={`tab ${activeLevel === level ? 'active' : ''}`} onClick={() => setActiveLevel(level)}>
                <span style={{ color: activeLevel === level ? levelColors[level] : undefined }}>Уровень {level}</span>
                <br/>
                <span style={{ fontSize: '0.72rem', opacity: 0.7 }}>{lvlDone}/{lvlLessons.length}</span>
              </button>
            )
          })}
        </div>

        {/* Level progress */}
        <div style={{ marginBottom: 16 }}>
          <div className="progress-wrap">
            <div className="progress-fill" style={{
              width: `${levelLessons.length > 0 ? levelLessons.filter(l => getStatus(l.id) === 'completed').length / levelLessons.length * 100 : 0}%`,
              background: levelColors[activeLevel]
            }} />
          </div>
        </div>

        {/* Lessons */}
        <div className="lessons-grid">
          {levelLessons.map(lesson => {
            const status = getStatus(lesson.id)
            return (
              <Link key={lesson.id} href={`/lesson/${lesson.id}`}
                className={`lesson-card level-${lesson.level.toLowerCase()} ${status === 'completed' ? 'completed' : ''}`}>
                <div className="lesson-num">{lesson.level}{lesson.lesson_number}</div>
                <div className="lesson-title">{lesson.title.replace(`${lesson.level}${lesson.lesson_number} · `, '').replace(`${lesson.level}${lesson.lesson_number} · `, '')}</div>
                <div className="lesson-topic">{lesson.grammar_topic}</div>
                <div className="lesson-footer">
                  <span className={`badge badge-${status}`}>
                    {status === 'completed' ? '✓ Пройден' : status === 'in_progress' ? '↻ В процессе' : '○ Не начат'}
                  </span>
                  {lesson.pdf_url && <span style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>📄 PDF</span>}
                </div>
              </Link>
            )
          })}
        </div>
        <div style={{ height: 48 }} />
      </div>
    </>
  )
}
