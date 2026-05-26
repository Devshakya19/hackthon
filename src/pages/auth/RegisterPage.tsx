import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { clearStoredOnboarding, completePendingOnboarding, signUpWithEmail, storePendingOnboarding } from '../../supabase/auth'

export default function RegisterPage() {
  // Registration defaults to team leader accounts for normal users.
  const role: 'leader' | 'member' = 'leader'
  const [teamName, setTeamName] = useState('')
  const [hiddenCode, setHiddenCode] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const nextPassword = password.trim()
    const nextConfirmPassword = confirmPassword.trim()

    if (nextPassword !== nextConfirmPassword) {
      setError('Passwords do not match')
      return
    }

    setError('')
    setLoading(true)

    if (!teamName.trim()) {
      setLoading(false)
      setError('Team name is required for registration')
      return
    }


    storePendingOnboarding({
      role,
      teamName: teamName.trim(),
      hiddenCode: '',
      fullName: fullName.trim(),
    })

    const { data, error: authError } = await signUpWithEmail(email.trim(), nextPassword, {
      role,
      teamName: teamName.trim(),
      hiddenCode: '',
      fullName: fullName.trim(),
    })

    if (authError) {
      clearStoredOnboarding()
      setLoading(false)
      setError(authError.message)
      return
    }

    if (data.session?.user) {
      try {
        await completePendingOnboarding(data.session.user)
      } catch (onboardingError) {
        setLoading(false)
        setError(onboardingError instanceof Error ? onboardingError.message : 'Unable to complete onboarding')
        return
      }

      setLoading(false)
      navigate('/dashboard')
      return
    }

    setLoading(false)
    navigate('/verify-email', { state: { email: email.trim() } })
  }

  return (
    <div className="min-h-screen text-text-900 bg-bg font-sans flex items-center justify-center relative overflow-hidden px-6 py-12">
      {/* Background SVG / Grains */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <svg className="w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0, 240, 255, 0.07)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        <div className="absolute top-[20%] right-[10%] w-[350px] h-[350px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[20%] left-[10%] w-[350px] h-[350px] bg-neon-purple/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-white transition-colors mb-6 text-sm font-semibold">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to home
        </Link>

        {/* Card */}
        <div className="glass-card border border-white/10 p-8 md:p-10 shadow-2xl relative overflow-hidden group">
          {/* Top subtle glow bar */}
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary to-neon-purple" />
          
            <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-neon-purple flex items-center justify-center text-bg font-extrabold text-xl mx-auto shadow-[0_0_15px_rgba(0,240,255,0.4)] mb-4">
              32
            </div>
            <h2 className="text-3xl font-extrabold text-white">Enlist Team</h2>
            <p className="text-text-500 text-sm mt-2">Create a team leader account (members can be added by leaders)</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-xs uppercase tracking-widest text-text-500 font-semibold mb-2">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 px-4 text-white placeholder-text-500/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-text-500 font-semibold mb-2">Team Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="CyberWarriors"
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-text-500/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-medium"
                />
              </div>
            </div>

            {/* Hidden code is only used when joining an existing team; leaders create teams so it's not shown here. */}

            <div>
              <label className="block text-xs uppercase tracking-widest text-text-500 font-semibold mb-2">Leader's Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === 'leader' ? 'leader@example.com' : 'member@example.com'}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-text-500/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-text-500 font-semibold mb-2">Security Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-text-500/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-text-500 font-semibold mb-2">Confirm Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </span>
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-text-500/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-primary text-bg font-bold shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:shadow-[0_0_25px_rgba(0,240,255,0.5)] transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-bg border-t-transparent rounded-full animate-spin" />
              ) : (
                'Create Credentials'
              )}
            </button>

            {error ? (
              <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}
          </form>

          <div className="mt-8 text-center text-sm text-text-500">
            Already enlisted?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">
              Access console
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
