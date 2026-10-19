import { useCallback, useState } from 'react'
import { note } from '../data/book'

// Posting a note to getform. Shared by the 3D notebook panel and the phone
// edition's inline form so there is one implementation of "did this send".
//
// States: idle → sending → done | failed. `failed` is a real state, not a
// cosmetic one — if the request doesn't land, the reader is told and given the
// email address instead of a false confirmation.

export default function useNoteSubmit() {
  const [status, setStatus] = useState('idle')

  const submit = useCallback(async (fields) => {
    // Honeypot: humans never see the field, so anything in it is a bot. Report
    // success so the bot doesn't retry, but don't send anything.
    if (fields.website) {
      setStatus('done')
      return
    }
    setStatus('sending')
    try {
      const body = new FormData()
      body.append('name', fields.name)
      body.append('email', fields.email)
      body.append('message', fields.message)
      const res = await fetch(note.endpoint, {
        method: 'POST',
        body,
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) throw new Error('getform responded ' + res.status)
      setStatus('done')
    } catch (err) {
      console.error('Note failed to send:', err)
      setStatus('failed')
    }
  }, [])

  const reset = useCallback(() => setStatus('idle'), [])

  return { status, submit, reset }
}
