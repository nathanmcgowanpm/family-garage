/**
 * useServiceRecords — service record CRUD backed by Supabase
 * -----------------------------------------------------------
 * Scoped to a specific vehicleId. Used by the detail screen
 * and the AI record import flow.
 *
 * Same hybrid write strategy as useVehicles:
 *   - addRecord:    pessimistic
 *   - updateRecord: optimistic
 *   - deleteRecord: optimistic
 *
 * Records include a raw_parsed_data jsonb column on the server
 * (for preserving original AI parse output) — we pass it through
 * transparently when the AI flow adds a record.
 */

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useServiceRecords(vehicleId) {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  // ─── Fetch when vehicleId changes ────────────────────────────
  useEffect(() => {
    if (!vehicleId) {
      setRecords([])
      setLoading(false)
      return
    }

    let cancelled = false

    async function fetchRecords() {
      setLoading(true)
      const { data, error } = await supabase
        .from('service_records')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('service_date', { ascending: false })

      if (cancelled) return

      if (error) {
        setError(error)
        setRecords([])
      } else {
        setRecords(data ?? [])
        setError(null)
      }
      setLoading(false)
    }

    fetchRecords()
    return () => { cancelled = true }
  }, [vehicleId])

  // ─── addRecord: pessimistic ──────────────────────────────────
  const addRecord = useCallback(async (recordData) => {
    if (!vehicleId) return { error: new Error('No vehicle') }

    setSaving(true)
    const { data, error } = await supabase
      .from('service_records')
      .insert({ ...recordData, vehicle_id: vehicleId })
      .select()
      .single()
    setSaving(false)

    if (error) return { error }

    setRecords(prev => [data, ...prev])
    return { data }
  }, [vehicleId])

  // ─── updateRecord: optimistic ────────────────────────────────
  const updateRecord = useCallback(async (id, updates) => {
    const previous = records
    setRecords(prev =>
      prev.map(r => r.id === id ? { ...r, ...updates } : r)
    )

    const { data, error } = await supabase
      .from('service_records')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      setRecords(previous)
      return { error }
    }

    setRecords(prev => prev.map(r => r.id === id ? data : r))
    return { data }
  }, [records])

  // ─── deleteRecord: optimistic ────────────────────────────────
  const deleteRecord = useCallback(async (id) => {
    const previous = records
    setRecords(prev => prev.filter(r => r.id !== id))

    const { error } = await supabase
      .from('service_records')
      .delete()
      .eq('id', id)

    if (error) {
      setRecords(previous)
      return { error }
    }
    return { ok: true }
  }, [records])

  return {
    records,
    loading,
    saving,
    error,
    addRecord,
    updateRecord,
    deleteRecord,
  }
}
