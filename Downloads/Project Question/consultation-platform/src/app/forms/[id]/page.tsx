'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import { CheckCircle } from 'lucide-react'
import { useState } from 'react'

export default function PublicFormPage({ params }: { params: { id: string } }) {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState<Record<string, any>>({})

  const { data: form, isLoading } = useQuery({
    queryKey: ['form', params.id],
    queryFn: () => fetch(`/api/forms/${params.id}`).then(r => r.json()),
  })

  const submitResponse = useMutation({
    mutationFn: (data: Record<string, any>) =>
      fetch(`/api/forms/${params.id}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      }).then(r => r.json()),
    onSuccess: () => setSubmitted(true),
  })

  if (isLoading) return <div className="p-8 text-center">Loading...</div>
  if (!form) return <div className="p-8 text-center">Form not found</div>

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow text-center max-w-md">
          <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
          <h1 className="text-xl font-bold mb-2">Thank you!</h1>
          <p className="text-gray-600">Your feedback has been submitted successfully.</p>
        </div>
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitResponse.mutate(formData)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-lg mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">{form.name}</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {form.fields?.map((field: any, i: number) => (
            <div key={i}>
              <label className="block text-sm font-medium mb-2">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>

              {field.type === 'textarea' ? (
                <textarea
                  required={field.required}
                  value={formData[field.label] || ''}
                  onChange={e => setFormData({ ...formData, [field.label]: e.target.value })}
                  className="w-full p-2 border rounded"
                  rows={3}
                />
              ) : field.type === 'select' ? (
                <select
                  required={field.required}
                  value={formData[field.label] || ''}
                  onChange={e => setFormData({ ...formData, [field.label]: e.target.value })}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select...</option>
                  {field.options?.map((o: string) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : field.type === 'radio' ? (
                <div className="space-y-2">
                  {field.options?.map((o: string) => (
                    <label key={o} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={field.label}
                        value={o}
                        required={field.required}
                        checked={formData[field.label] === o}
                        onChange={e => setFormData({ ...formData, [field.label]: e.target.value })}
                      />
                      {o}
                    </label>
                  ))}
                </div>
              ) : field.type === 'checkbox' ? (
                <div className="space-y-2">
                  {field.options?.map((o: string) => (
                    <label key={o} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={(formData[field.label] || []).includes(o)}
                        onChange={e => {
                          const current = formData[field.label] || []
                          setFormData({
                            ...formData,
                            [field.label]: e.target.checked
                              ? [...current, o]
                              : current.filter((v: string) => v !== o),
                          })
                        }}
                      />
                      {o}
                    </label>
                  ))}
                </div>
              ) : field.type === 'rating' ? (
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      type="button"
                      className={`w-10 h-10 border rounded ${formData[field.label] === n ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'}`}
                      onClick={() => setFormData({ ...formData, [field.label]: n })}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  type={field.type}
                  required={field.required}
                  value={formData[field.label] || ''}
                  onChange={e => setFormData({ ...formData, [field.label]: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={submitResponse.isPending}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {submitResponse.isPending ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  )
}
