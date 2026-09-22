import { useEffect, useState } from 'react'
import { Phone, User, Building2 } from 'lucide-react'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { CUSTOMER_STATUSES, CUSTOMER_TYPES } from '../../lib/constants'
import { normalizePhone } from '../../utils/phone'
import { DUPLICATE_PHONE_MESSAGE, hasCustomerWithPhone } from '../../services/customerService'
import type { CustomerStatus, CustomerType } from '../../types'

export interface CustomerFormValues {
  name: string
  phone: string
  alternate_phone: string
  email: string
  company: string
  address: string
  customer_type: CustomerType
  status: CustomerStatus
  notes: string
  follow_up_date: string
  follow_up_time: string
}

interface CustomerFormProps {
  initial?: Partial<CustomerFormValues>
  submitLabel: string
  loadingLabel: string
  loading: boolean
  customerId?: string
  onCancel?: () => void
  onSubmit: (values: CustomerFormValues) => void
}

const SECTION_CLASS = 'rounded-2xl border border-slate-100 bg-white p-5 shadow-card space-y-4'
const SECTION_TITLE = 'text-sm font-semibold text-slate-900'

const EMPTY: CustomerFormValues = {
  name: '',
  phone: '',
  alternate_phone: '',
  email: '',
  company: '',
  address: '',
  customer_type: 'lead',
  status: 'new_lead',
  notes: '',
  follow_up_date: '',
  follow_up_time: '',
}

interface Errors {
  name?: string
  phone?: string
  email?: string
}

function validate(values: CustomerFormValues): Errors {
  const errors: Errors = {}
  if (!values.name.trim()) errors.name = 'Full name is required.'
  const digits = normalizePhone(values.phone)
  if (!values.phone.trim()) errors.phone = 'Phone number is required.'
  else if (digits.length < 8 || digits.length > 15) errors.phone = 'Enter a valid phone number.'
  if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.'
  }
  return errors
}

export function CustomerForm({ initial, submitLabel, loadingLabel, loading, customerId, onCancel, onSubmit }: CustomerFormProps) {
  const [values, setValues] = useState<CustomerFormValues>({ ...EMPTY, ...initial })
  const [errors, setErrors] = useState<Errors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [checkingPhone, setCheckingPhone] = useState(false)

  useEffect(() => {
    const normalizedPhone = normalizePhone(values.phone)
    if (!normalizedPhone || normalizedPhone.length < 8 || normalizedPhone.length > 15) return

    let cancelled = false
    setCheckingPhone(true)
    const timer = window.setTimeout(() => {
      hasCustomerWithPhone(values.phone, customerId)
        .then((exists) => {
          if (cancelled) return
          setErrors((prev) => ({ ...prev, phone: exists ? DUPLICATE_PHONE_MESSAGE : undefined }))
        })
        .catch(() => undefined)
        .finally(() => {
          if (!cancelled) setCheckingPhone(false)
        })
    }, 350)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
      setCheckingPhone(false)
    }
  }, [customerId, values.phone])

  const set = <K extends keyof CustomerFormValues>(key: K, value: CustomerFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    if (key === 'name' || key === 'phone' || key === 'email') {
      setErrors((prev) => ({ ...prev, [key]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate(values)
    setErrors(errs)
    setTouched({ name: true, phone: true, email: true })
    if (Object.keys(errs).length > 0) return

    setCheckingPhone(true)
    try {
      if (await hasCustomerWithPhone(values.phone, customerId)) {
        setErrors((prev) => ({ ...prev, phone: DUPLICATE_PHONE_MESSAGE }))
        return
      }
      await onSubmit(values)
    } finally {
      setCheckingPhone(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <section className={SECTION_CLASS}>
        <h2 className={SECTION_TITLE}>Customer Information</h2>
        <Input
          label="Full Name"
          required
          name="name"
          placeholder="Customer name"
          value={values.name}
          onChange={(e) => set('name', e.target.value)}
          error={(touched.name || errors.name) ? errors.name : undefined}
          leading={<User className="h-4 w-4" />}
          autoFocus
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Phone Number"
            required
            type="tel"
            name="phone"
            inputMode="tel"
            placeholder="9876543210"
            value={values.phone}
            onChange={(e) => set('phone', e.target.value)}
            error={(touched.phone || errors.phone) ? errors.phone : undefined}
            leading={<Phone className="h-4 w-4" />}
          />
          <Input
            label="Alternative Phone"
            type="tel"
            name="alternate_phone"
            inputMode="tel"
            placeholder="Optional"
            value={values.alternate_phone}
            onChange={(e) => set('alternate_phone', e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Email"
            type="email"
            name="email"
            inputMode="email"
            placeholder="customer@email.com"
            value={values.email}
            onChange={(e) => set('email', e.target.value)}
            error={(touched.email || errors.email) ? errors.email : undefined}
          />
          <Input
            label="Company / Business"
            name="company"
            placeholder="ABC Traders"
            value={values.company}
            onChange={(e) => set('company', e.target.value)}
            leading={<Building2 className="h-4 w-4" />}
          />
        </div>
        <Select
          label="Customer Type"
          name="customer_type"
          value={values.customer_type}
          onChange={(e) => set('customer_type', e.target.value as CustomerType)}
        >
          {CUSTOMER_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </Select>
        <Textarea
          label="Address"
          name="address"
          rows={2}
          placeholder="12, Main Road, Tirunelveli, Tamil Nadu"
          value={values.address}
          onChange={(e) => set('address', e.target.value)}
        />
      </section>

      <section className={SECTION_CLASS}>
        <h2 className={SECTION_TITLE}>Notes</h2>
        <Textarea
          label="Notes"
          name="notes"
          rows={4}
          placeholder="Add notes about what the customer asked, requirements, pricing discussion, etc."
          value={values.notes}
          onChange={(e) => set('notes', e.target.value)}
        />
      </section>

      <section className={SECTION_CLASS}>
        <h2 className={SECTION_TITLE}>Follow-up</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Follow-up Date" type="date" name="follow_up_date" value={values.follow_up_date} onChange={(e) => set('follow_up_date', e.target.value)} />
          <Input label="Follow-up Time" type="time" name="follow_up_time" value={values.follow_up_time} onChange={(e) => set('follow_up_time', e.target.value)} />
        </div>
        <Select
          label="Status"
          name="status"
          value={values.status}
          onChange={(e) => set('status', e.target.value as CustomerStatus)}
        >
          {CUSTOMER_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </Select>
      </section>

      <div className="flex gap-3 pt-1">
        {onCancel && (
          <Button type="button" variant="outline" fullWidth onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" fullWidth size="lg" loading={loading} disabled={checkingPhone || errors.phone === DUPLICATE_PHONE_MESSAGE}>
          {loading ? loadingLabel : submitLabel}
        </Button>
      </div>
    </form>
  )
}