/**
 * useHousehold — current user's household ID
 * -------------------------------------------
 * Every vehicle and service record is scoped to a household.
 * This hook finds the household the signed-in user belongs to
 * (for now, always exactly one — their personal household created
 * by the signup trigger) and exposes its ID.
 *
 * Returns:
 *   - householdId: uuid of the user's household (or null while loading)
 *   - loading: true until the first fetch completes
 *   - error: any fetch error
 */

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useHousehold() {
  const { user } = useAuth()
  const [householdId, setHouseholdId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) {
      setHouseholdId(null)
      setLoading(false)
      return
    }

    let cancelled = false

    async function fetchHousehold() {
      setLoading(true)
      const { data, error } = await supabase
        .from('household_members')
        .select('household_id')
        .eq('user_id', user.id)
        .limit(1)
        .single()

      if (cancelled) return

      if (error) {
        setError(error)
        setHouseholdId(null)
      } else {
        setHouseholdId(data.household_id)
        setError(null)
      }
      setLoading(false)
    }

    fetchHousehold()
    return () => { cancelled = true }
  }, [user])

  return { householdId, loading, error }
}
