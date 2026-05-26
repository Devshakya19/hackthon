import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signUpWithEmail, storePendingOnboarding } from '../../supabase/auth'

export default function JoinTeamPage() {
  const [teamUid, setTeamUid] = useState('')
  const [teamPassword, setTeamPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!teamUid.trim() || !teamPassword.trim()) return setError('Team UID and password are required')
    if (!fullName.trim() || !email.trim() || !password.trim()) return setError('Name, email and password required')

    setLoading(true)
    // store pending onboarding so after sign-up we can complete joining via team UID/password
    storePendingOnboarding({ role: 'member', hiddenCode: '', teamName: '', teamUid: teamUid.trim(), teamPassword: teamPassword.trim(), fullName: fullName.trim() })
    const { data, error: authError } = await signUpWithEmail(email.trim(), password.trim(), { role: 'member', teamName: '', fullName: fullName.trim() })
    if (authError) {
      setLoading(false)
      setError(authError.message)
      return
    }

    // For simplicity, navigate to verify-email or dashboard; actual joining happens when session is complete
    setLoading(false)
    navigate('/verify-email', { state: { email: email.trim() } })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="w-full max-w-md p-8 glass-card">
        <h2 className="text-xl font-bold mb-4">Join a Team</h2>
        <form onSubmit={handleJoin} className="space-y-3">
          <input value={teamUid} onChange={(e) => setTeamUid(e.target.value)} placeholder="Team UID (e.g. T-AB12CD)" className="w-full p-3 rounded" />
          <input value={teamPassword} onChange={(e) => setTeamPassword(e.target.value)} placeholder="Team Password" className="w-full p-3 rounded" />
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" className="w-full p-3 rounded" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full p-3 rounded" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full p-3 rounded" />
          {error && <div className="text-red-400">{error}</div>}
          <button type="submit" className="w-full bg-primary text-bg py-2 rounded">Create member account</button>
        </form>
      </div>
    </div>
  )
}
