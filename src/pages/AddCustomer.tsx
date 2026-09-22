import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/ui/PageHeader'
import { CustomerForm } from '../components/customers/CustomerForm'
import type { CustomerFormValues } from '../components/customers/CustomerForm'
import { createCustomer } from '../services/customerService'
import { addActivity } from '../services/activityService'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../components/ui/Toast'

export function AddCustomer() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { success, error: showError } = useToast()
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (values: CustomerFormValues) => {
    if (!user) return
    setSaving(true)
    try {
      const customer = await createCustomer(values)
      await addActivity(customer.id, 'created', 'Customer added.')
      success('Customer added successfully.')
      navigate(`/customers/${customer.id}`, { replace: true })
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Could not add the customer.')
      setSaving(false)
    }
  }

  return (
    <div className="pb-4">
      <PageHeader title="Add Customer" onBack={() => navigate('/customers')} />
      <CustomerForm
        submitLabel="Save Customer"
        loadingLabel="Saving..."
        loading={saving}
        onCancel={() => navigate('/customers')}
        onSubmit={handleSubmit}
      />
    </div>
  )
}