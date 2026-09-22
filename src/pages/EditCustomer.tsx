import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { CustomerForm } from '../components/customers/CustomerForm'
import type { CustomerFormValues } from '../components/customers/CustomerForm'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Button } from '../components/ui/Button'
import { SkeletonDetails } from '../components/ui/Skeleton'
import { useToast } from '../components/ui/Toast'
import { deleteCustomer, getCustomerById, updateCustomer } from '../services/customerService'
import { addActivity } from '../services/activityService'
import { customerStatusLabel } from '../lib/constants'
import type { Customer } from '../types'

function toFormValues(customer: Customer): CustomerFormValues {
  return {
    name: customer.name,
    phone: customer.phone,
    alternate_phone: customer.alternate_phone ?? '',
    email: customer.email ?? '',
    company: customer.company ?? '',
    address: customer.address ?? '',
    customer_type: customer.customer_type,
    status: customer.status,
    notes: customer.notes ?? '',
    follow_up_date: customer.follow_up_date?.slice(0, 10) ?? '',
    follow_up_time: customer.follow_up_time?.slice(0, 5) ?? '',
  }
}

export function EditCustomer() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { success, error: showError } = useToast()

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    if (!id) return
    let active = true
    getCustomerById(id)
      .then((data) => active && setCustomer(data))
      .catch((e: unknown) => active && setLoadError(e instanceof Error ? e.message : 'Could not load customer.'))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [id])

  const handleSubmit = async (values: CustomerFormValues) => {
    if (!id || !customer) return
    setSaving(true)
    const statusChanged = values.status !== customer.status
    try {
      await updateCustomer(id, values)
      await addActivity(id, 'edited', 'Customer details updated.')
      if (statusChanged) {
        await addActivity(
          id,
          'status_change',
          `Status changed from ${customerStatusLabel(customer.status)} to ${customerStatusLabel(values.status)}.`,
        )
      }
      success('Customer updated successfully.')
      navigate(`/customers/${id}`, { replace: true })
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Could not update the customer.')
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!id || !customer) return
    setDeleting(true)
    try {
      await deleteCustomer(id)
      success('Customer deleted.')
      navigate('/customers', { replace: true })
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Could not delete this customer.')
      setDeleting(false)
      setConfirmOpen(false)
    }
  }

  if (loading) {
    return (
      <div className="pb-4">
        <PageHeader title="Edit Customer" onBack={() => navigate(-1)} />
        <SkeletonDetails />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="pb-4">
        <PageHeader title="Edit Customer" onBack={() => navigate('/customers')} />
        <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
          {loadError}
        </div>
        <div className="mt-4">
          <Button fullWidth onClick={() => navigate('/customers')}>Back to Customers</Button>
        </div>
      </div>
    )
  }

  if (!customer) return null

  return (
    <div className="pb-4">
      <PageHeader
        title="Edit Customer"
        onBack={() => navigate(`/customers/${customer.id}`)}
      />
      <CustomerForm
        initial={toFormValues(customer)}
        submitLabel="Save Changes"
        loadingLabel="Saving..."
        loading={saving}
        customerId={customer.id}
        onCancel={() => navigate(`/customers/${customer.id}`)}
        onSubmit={handleSubmit}
      />
      <div className="mt-8 border-t border-slate-100 pt-6">
        <Button
          variant="danger"
          fullWidth
          onClick={() => setConfirmOpen(true)}
          className="bg-red-50 text-red-600 hover:bg-red-100"
        >
          <Trash2 className="h-4 w-4" /> Delete Customer
        </Button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Customer?"
        message={`Are you sure you want to delete ${customer.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}