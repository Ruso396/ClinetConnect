import { useState } from 'react'
import { BottomSheet } from '../ui/BottomSheet'
import { Select } from '../ui/Select'
import { Textarea } from '../ui/Textarea'
import { Button } from '../ui/Button'
import type { ActivityType } from '../../types'

const ACTIVITY_OPTIONS: { value: ActivityType; label: string }[] = [
  { value: 'note', label: 'Note' },
  { value: 'call', label: 'Call' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'follow_up', label: 'Follow-up' },
]

export function AddActivitySheet({
  open,
  onClose,
  onSave,
  loading,
}: {
  open: boolean
  onClose: () => void
  onSave: (type: ActivityType, description: string) => Promise<void>
  loading: boolean
}) {
  const [type, setType] = useState<ActivityType>('note')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  const handleSave = async () => {
    setError('')
    if (!description.trim()) {
      setError('Please describe what happened.')
      return
    }
    await onSave(type, description.trim())
    setDescription('')
    setType('note')
    onClose()
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Add Activity">
      <div className="space-y-4">
        <Select
          label="Activity Type"
          name="activity_type"
          value={type}
          onChange={(e) => setType(e.target.value as ActivityType)}
        >
          {ACTIVITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
        <Textarea
          label="What happened?"
          name="description"
          rows={4}
          placeholder="Describe the call, meeting or follow-up..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={error}
          autoFocus
        />
        <Button fullWidth size="lg" onClick={handleSave} loading={loading}>
          {loading ? 'Saving...' : 'Save Activity'}
        </Button>
      </div>
    </BottomSheet>
  )
}