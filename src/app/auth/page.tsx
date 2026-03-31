'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const supabase = createClient()

  const handleLogin = async () => {
    setLoading(true); setError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('Неверный email или пароль'); setLoading(false); return }
    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', data.user.id).single()
    if (profile?.role === 'teacher') router.push('/teacher')
    else router.push('/dashboard')
  }

  const handleRegister = async () => {
    setLoading(true); setError('')
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name, role: 'student' } }
    })
    if (error) { setError(error.message); setLoading(false); return }
    setSuccess('Аккаунт создан! Проверь email для подтверждения.')
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>📚</div>
          <h1 className="auth-title">AtoC · IELTS from Zero</h1>
          <p className="auth-subtitle">
            {mode === 'login' ? 'Войди в свой аккаунт' : 'Создай аккаунт студента'}
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {mode === 'register' && (
          <div className="form-group">
            <label className="form-label">Имя</label>
            <input className="form-input" placeholder="Твоё имя" value={name}
              onChange={e => setName(e.target.value)} />
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" placeholder="email@example.com"
            value={email} onChange={e => setEmail(e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">Пароль</label>
          <input className="form-input" type="password" placeholder="Минимум 6 символов"
            value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (mode === 'login' ? handleLogin() : handleRegister())} />
        </div>

        <button className="btn btn-primary" style={{ width: '100%', marginTop: 8 }}
          onClick={mode === 'login' ? handleLogin : handleRegister} disabled={loading}>
          {loading ? 'Загрузка...' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: '0.88rem', color: '#666' }}>
          {mode === 'login' ? (
            <>Нет аккаунта? <button onClick={() => setMode('register')}
              style={{ background: 'none', border: 'none', color: '#f4a261', cursor: 'pointer', fontWeight: 600 }}>
              Зарегистрироваться
            </button></>
          ) : (
            <>Уже есть аккаунт? <button onClick={() => setMode('login')}
              style={{ background: 'none', border: 'none', color: '#f4a261', cursor: 'pointer', fontWeight: 600 }}>
              Войти
            </button></>
          )}
        </div>
      </div>
    </div>
  )
}
