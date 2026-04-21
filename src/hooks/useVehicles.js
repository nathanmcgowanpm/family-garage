/**
 * useVehicles — vehicle CRUD backed by Supabase
 * ----------------------------------------------
 * Replaces the vehicles portion of the old useStorage hook.
 * Fetches all vehicles for the current user's household,
 * and exposes add/update/delete with the hybrid write pattern:
 *
 *   - addVehicle:    pessimistic (await Supabase, then update UI)
 *   - updateVehicle: optimistic (update UI instantly, rollback on error)
 *   - deleteVehicle: optimistic (same pattern)
 *
 * Data shape returned to components matches what the legacy
 * localStorage code used, so screen components shouldn't need changes.
 */

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useHousehold } from './useHousehold'

export function useVehicles() {
  const { householdId, loading: householdLoading } = useHousehold()
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  // ─── Fetch on mount / when household resolves ────────────────
  useEffect(() => {
    if (householdLoading) return
    if (!householdId) {
      setVehicles([])
      setLoading(false)
      return
    }

    let cancelled = false

    async function fetchVehicles() {
      setLoading(true)
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('household_id', householdId)
        .order('created_at', { ascending: true })

      if (cancelled) return

      if (error) {
        setError(error)
        setVehicles([])
      } else {
        setVehicles(data ?? [])
        setError(null)
      }
      setLoading(false)
    }

    fetchVehicles()
    return () => { cancelled = true }
  }, [householdId, householdLoading])

  // ─── addVehicle: pessimistic ─────────────────────────────────
  const addVehicle = useCallback(async (vehicleData) => {
    if (!householdId) return { error: new Error('No household') }

    setSaving(true)
    const { data, error } = await supabase
      .from('vehicles')
      .insert({ ...vehicleData, household_id: householdId })
      .select()
      .single()
    setSaving(false)

    if (error) return { error }

    setVehicles(prev => [...prev, data])
    return { data }
  }, [householdId])

  // ─── updateVehicle: optimistic ───────────────────────────────
  const updateVehicle = useCallback(async (id, updates) => {
    // Snapshot for rollback
    const previous = vehicles
    setVehicles(prev =>
      prev.map(v => v.id === id ? { ...v, ...updates } : v)
    )

    const { data, error } = await supabase
      .from('vehicles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      setVehicles(previous)  // rollback
      return { error }
    }

    // Sync with server truth in case DB normalized anything
    setVehicles(prev => prev.map(v => v.id === id ? data : v))
    return { data }
  }, [vehicles])

  // ─── deleteVehicle: optimistic ───────────────────────────────
  const deleteVehicle = useCallback(async (id) => {
    const previous = vehicles
    setVehicles(prev => prev.filter(v => v.id !== id))

    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id)

    if (error) {
      setVehicles(previous)
      return { error }
    }
    return { ok: true }
  }, [vehicles])

  return {
    vehicles,
    loading: loading || householdLoading,
    saving,
    error,
    addVehicle,
    updateVehicle,
    deleteVehicle,
  }
}
