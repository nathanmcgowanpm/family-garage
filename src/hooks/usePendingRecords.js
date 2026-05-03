/**
 * usePendingRecords — household-scoped pending review queue
 * ----------------------------------------------------------
 * Unlike useServiceRecords (which is scoped to a single vehicle),
 * this hook returns ALL service_records with status = 'pending_review'
 * across every vehicle in the household. Used by the Dashboard
 * banner so users can review email-forwarded records in one place.
 *
 * Each row is joined with its vehicle so cards can show
 * "2021 Toyota Highlander · Jiffy Lube · $48".
 *
 * Scoping is enforced by RLS on service_records — which traces back
 * to the household via the vehicle relationship. We don't need to
 * filter on household_id explicitly (and indeed can't — service_records
 * has no household_id column).
 *
 * Exposes three actions:
 *   - confirm(id)            → status: 'confirmed'
 *   - update(id, patch)      → general update + status: 'confirmed'
 *                              (used when user edits then saves)
 *   - dismiss(id)            → status: 'dismissed'
 *
 * All three are optimistic: the row is removed from the local
 * pending list immediately. On error we put it back.
 */

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function usePendingRecords() {
  const { user } = useAuth()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ─── Fetch when user is available ────────────────────────────
  useEffect(() => {
    if (!user) {
      setRecords([])
      setLoading(false)
      return
    }

    let cancelled = false

    async function fetchPending() {
      setLoading(true)
      // RLS on service_records scopes to the user's household via
      // the vehicle relationship — no explicit household filter needed.
      const { data, error } = await supabase
        .from('service_records')
        .select(`
          *,
          vehicle:vehicles ( id, year, make, model, nickname )
        `)
        .eq('status', 'pending_review')
        .order('created_at', { ascending: false })

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

    fetchPending()
    return () => { cancelled = true }
  }, [user])

  // ─── confirm: flip status to 'confirmed' (optimistic) ────────
  const confirm = useCallback(async (id) => {
    const previous = records
    setRecords(prev => prev.filter(r => r.id !== id))

    const { error } = await supabase
      .from('service_records')
      .update({ status: 'confirmed' })
      .eq('id', id)

    if (error) {
      setRecords(previous)
      return { error }
    }
    return { ok: true }
  }, [records])

  // ─── update: apply edits AND confirm in one round trip ───────
  // Used when the user edits fields in ReceiptForm and saves.
  // The patch may include vehicle_id (reassignment) and any of
  // the parsed fields. Always sets status to 'confirmed'.
  const update = useCallback(async (id, patch) => {
    const previous = records
    setRecords(prev => prev.filter(r => r.id !== id))

    const { error } = await supabase
      .from('service_records')
      .update({ ...patch, status: 'confirmed' })
      .eq('id', id)

    if (error) {
      setRecords(previous)
      return { error }
    }
    return { ok: true }
  }, [records])

  // ─── dismiss: flip status to 'dismissed' (optimistic) ────────
  const dismiss = useCallback(async (id) => {
    const previous = records
    setRecords(prev => prev.filter(r => r.id !== id))

    const { error } = await supabase
      .from('service_records')
      .update({ status: 'dismissed' })
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
    error,
    confirm,
    update,
    dismiss,
  }
}