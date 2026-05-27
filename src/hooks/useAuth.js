/**
 * useAuth — session management hook
 * ----------------------------------
 * Exposes:
 *   - user: the current signed-in user (or null)
 *   - loading: true until initial session check completes
 *   - signIn: send a 6-digit OTP code to the given email
 *   - verifyOtp: verify the code and establish a session directly
 *   - signOut: end the current session
 *
 * OTP migration (was magic-link):
 *   - signInWithOtp no longer passes emailRedirectTo — that option is what
 *     told Supabase to format the email as a clickable link. Without it,
 *     the email template surfaces {{ .Token }} (the 6-digit code) instead.
 *     NOTE: the Supabase dashboard email template must be updated to show
 *     {{ .Token }} — see LoginScreen comments for details.
 *   - verifyOtp calls supabase.auth.verifyOtp which returns a session
 *     directly and fires onAuthStateChange('SIGNED_IN') internally.
 *     The existing listener below handles the rest — no extra wiring needed.
 */

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Seed state from any existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Subscribe to auth state changes (sign-in, sign-out, token refresh).
    // This fires for both OTP verify and magic-link redirect — the app
    // only cares that user goes from null → User object.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  /**
   * Send a 6-digit OTP code to the given email address.
   * emailRedirectTo is intentionally omitted — we are code-based now,
   * not magic-link based. The Supabase email template must surface
   * {{ .Token }} (dashboard task, not a code task).
   */
  async function signIn(email) {
    const { data, error } = await supabase.auth.signInWithOtp({ email })
    return { data, error }
  }

  /**
   * Verify a 6-digit OTP code entered by the user.
   * On success, Supabase internally calls _saveSession + fires SIGNED_IN
   * via onAuthStateChange — the listener above handles the rest.
   * Returns { data: { user, session }, error }.
   */
  async function verifyOtp(email, token) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    })
    return { data, error }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return { user, loading, signIn, verifyOtp, signOut }
}
