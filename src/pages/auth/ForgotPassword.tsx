import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { sendPasswordResetEmail } from '../../supabase/auth'

const RESET_COOLDOWN_MS = 60_000

function resetCooldownKey(email: string) {
  return `password-reset:${email.trim().toLowerCase()}`
}

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [cooldownLeft, setCooldownLeft] = useState(0)

  React.useEffect(() => {
    const savedAt = Number(window.localStorage.getItem(resetCooldownKey(email)) ?? '0')
    if (savedAt) {
      const remaining = Math.max(0, RESET_COOLDOWN_MS - (Date.now() - savedAt))
      setCooldownLeft(Math.ceil(remaining / 1000))
    }
  }, [email])

  React.useEffect(() => {
    if (cooldownLeft <= 0) return
    const timer = window.setInterval(() => {
      setCooldownLeft((current) => Math.max(0, current - 1))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [cooldownLeft])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedEmail = email.trim()

    const savedAt = Number(window.localStorage.getItem(resetCooldownKey(trimmedEmail)) ?? '0')
    const remaining = Math.max(0, RESET_COOLDOWN_MS - (Date.now() - savedAt))
    if (remaining > 0) {
      setError(`Please wait ${Math.ceil(remaining / 1000)} seconds before requesting another reset link.`)
      setCooldownLeft(Math.ceil(remaining / 1000))
      return
    }

    setLoading(true)
    setError('')

    const { error: resetError } = await sendPasswordResetEmail(trimmedEmail)

    setLoading(false)

    if (resetError) {
      const message = resetError.message.toLowerCase().includes('rate')
        ? 'A reset email was sent recently. Please check your inbox or wait before requesting again.'
        : resetError.message
      setError(message)
      return
    }

    window.localStorage.setItem(resetCooldownKey(trimmedEmail), String(Date.now()))
    setCooldownLeft(60)
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen text-text-900 bg-bg font-sans flex items-center justify-center relative overflow-hidden px-6">
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
        <div className="absolute top-[20%] left-[10%] w-[350px] h-[350px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[20%] right-[10%] w-[350px] h-[350px] bg-neon-purple/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        {/* Back Link */}
        <Link to="/login" className="inline-flex items-center gap-2 text-primary hover:text-white transition-colors mb-6 text-sm font-semibold">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to login
        </Link>

        {/* Card */}
        <div className="glass-card border border-white/10 p-8 md:p-10 shadow-2xl relative overflow-hidden group">
          {/* Top subtle glow bar */}
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary to-neon-purple" />
          
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-neon-purple flex items-center justify-center text-bg font-extrabold text-xl mx-auto shadow-[0_0_15px_rgba(0,240,255,0.4)] mb-4">
              🔑
            </div>
            <h2 className="text-3xl font-extrabold text-white">Reset Decryption</h2>
            <p className="text-text-500 text-sm mt-2">Request password reset token</p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs uppercase tracking-widest text-text-500 font-semibold mb-2">Registered Email</label>
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
                    placeholder="name@example.com"
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-text-500/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || cooldownLeft > 0}
                className="w-full py-3.5 px-4 rounded-xl bg-primary text-bg font-bold shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:shadow-[0_0_25px_rgba(0,240,255,0.5)] transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-bg border-t-transparent rounded-full animate-spin" />
                ) : (
                  cooldownLeft > 0 ? `Wait ${cooldownLeft}s` : 'Transmit Reset Key'
                )}
              </button>

              {error ? (
                <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              ) : null}
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="text-primary text-5xl mb-4">✓</div>
              <h3 className="text-xl font-bold text-white mb-2">Transmission Sent</h3>
              <p className="text-text-500 text-sm leading-relaxed mb-6">
                If the email exists in our directory, a reset token has been dispatched. Please inspect your inbox.
              </p>
              <Link
                to="/login"
                className="inline-block w-full py-3.5 px-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-colors"
              >
                Return to Login
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
