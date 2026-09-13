import { Camera, ImagePlus, Sparkles, MapPin, Calendar, Package, Weight, CheckCircle2, ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { forwardRef, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from './services/api'

const Field = forwardRef(function Field({ label, error, ...props }, ref) {
  return (
    <label className="field">
      <span>{label}</span>
      <input {...props} ref={ref} />
      {error && <small className="form-error">{error}</small>}
    </label>
  )
})

const steps = [
  { id: 1, label: 'Scan item', icon: <Camera size={16} /> },
  { id: 2, label: 'Item details', icon: <Package size={16} /> },
  { id: 3, label: 'Schedule', icon: <Calendar size={16} /> },
]

export default function NewPickupPage() {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const cameraRef = useRef(null)
  const [step, setStep] = useState(1)
  const [scan, setScan] = useState({ busy: false, message: '', result: null })
  const [error, setError] = useState('')
  const { register, handleSubmit, setValue, watch, formState: { isSubmitting, errors } } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: { quantity: 1, pickupDate: new Date().toISOString().slice(0, 10), pickupTime: '09:00', timePeriod: 'AM' }
  })
  const images = watch('images')
  const selectedFile = images?.[0]
  const registration = register('images')

  const identify = async (file) => {
    if (!file) return
    setScan({ busy: true, message: 'Analyzing your photo with AI…', result: null })
    try {
      const body = new FormData()
      body.append('image', file)
      const { data } = await api.post('/ai/identify-item', body, { headers: { 'Content-Type': 'multipart/form-data' } })
      const result = data.data
      setScan({ busy: false, message: 'AI suggestion ready! Review and edit below.', result })
      if (result.category) setValue('category', result.category)
      if (result.itemName) setValue('itemDetails', result.itemName)
      if (result.condition) setValue('condition', result.condition)
      if (result.estimatedWeightKg) setValue('estimatedWeight', result.estimatedWeightKg)
    } catch (e) {
      setScan({ busy: false, message: e.response?.data?.message || 'Could not identify item. Fill details manually.', result: null })
    }
  }

  const handlePhoto = (event) => {
    const file = event.target.files?.[0]
    if (file) { setValue('images', event.target.files, { shouldValidate: true }); identify(file) }
  }

  const submit = async (values) => {
    try {
      const body = new FormData()
      Object.entries(values).forEach(([key, value]) => {
        if (key === 'images') [...value].forEach((file) => body.append('images', file))
        else if (key === 'pickupTime' || key === 'timePeriod') return
        else if (value !== '') body.append(key, value)
      })
      body.set('timeSlot', `${values.pickupTime} ${values.timePeriod}`)
      await api.post('/pickups', body)
      navigate('/customer/pickups')
    } catch (e) {
      setError(e.response?.data?.message || 'Could not save your pickup request.')
    }
  }

  return (
    <div className="dashboard-content narrow">
      {/* Header */}
      <motion.div className="np-header" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Link className="np-back" to="/customer/pickups"><ArrowLeft size={16} /> Back</Link>
        <div>
          <span className="eyebrow"><Sparkles size={13} /> New pickup request</span>
          <h1>Book a responsible pickup</h1>
          <p>Snap your item, fill details and schedule a collector visit.</p>
        </div>
      </motion.div>

      {/* Step indicator */}
      <div className="np-steps">
        {steps.map((s, i) => (
          <div key={s.id} className={`np-step ${step >= s.id ? 'np-step--done' : ''} ${step === s.id ? 'np-step--active' : ''}`}>
            <div className="np-step__dot">{step > s.id ? <CheckCircle2 size={14} /> : s.icon}</div>
            <span>{s.label}</span>
            {i < steps.length - 1 && <div className="np-step__line" />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(submit)}>
        <AnimatePresence mode="wait">
          {/* Step 1 — AI Scan */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="np-card">
              <div className="np-card__head">
                <span className="np-card__icon"><Camera size={22} /></span>
                <div><h2>Identify your item</h2><p>Take or upload a photo — our AI will suggest category, condition and weight.</p></div>
              </div>

              <div className="np-scan-zone">
                {selectedFile ? (
                  <div className="np-preview">
                    <img src={URL.createObjectURL(selectedFile)} alt="Item preview" />
                    <button type="button" className="np-preview__change" onClick={() => inputRef.current?.click()}>Change photo</button>
                  </div>
                ) : (
                  <div className="np-drop-area" onClick={() => inputRef.current?.click()}>
                    <Camera size={32} />
                    <b>Tap to upload or take photo</b>
                    <small>JPG, PNG, WEBP supported</small>
                  </div>
                )}
              </div>

              <div className="np-scan-btns">
                <button type="button" className="button primary" onClick={() => cameraRef.current?.click()} disabled={scan.busy}><Camera size={15} /> Take photo</button>
                <button type="button" className="button secondary" onClick={() => inputRef.current?.click()} disabled={scan.busy}><ImagePlus size={15} /> Upload image</button>
              </div>

              <input className="visually-hidden" type="file" accept="image/*" capture="environment" ref={cameraRef} onChange={handlePhoto} />
              <input className="visually-hidden" type="file" accept="image/*" multiple {...registration} ref={(node) => { registration.ref(node); inputRef.current = node }} onChange={(e) => { registration.onChange(e); handlePhoto(e) }} />

              <AnimatePresence>
                {scan.busy && (
                  <motion.div className="np-scan-status np-scan-status--busy" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="np-scan-spinner" /><span>{scan.message}</span>
                  </motion.div>
                )}
                {scan.result && (
                  <motion.div className="np-scan-result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <CheckCircle2 size={18} />
                    <div><b>{scan.result.itemName}</b><small>{scan.result.material || 'Material detected'} · {Math.round((scan.result.confidence || 0) * 100)}% confidence</small></div>
                  </motion.div>
                )}
                {scan.message && !scan.busy && !scan.result && (
                  <motion.p className="form-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{scan.message}</motion.p>
                )}
              </AnimatePresence>

              <div className="np-nav">
                <button type="button" className="button primary" onClick={() => setStep(2)}>Continue to item details →</button>
              </div>
            </motion.div>
          )}

          {/* Step 2 — Item Details */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="np-card">
              <div className="np-card__head">
                <span className="np-card__icon"><Package size={22} /></span>
                <div><h2>Item details</h2><p>Review the AI suggestion and edit any field to match your item exactly.</p></div>
              </div>
              <div className="form-grid">
                <label className="field">
                  <span>Category *</span>
                  <select {...register('category', { required: true })}>
                    <option value="">Choose category</option>
                    {['E-waste', 'Metal', 'Paper', 'Plastic', 'Glass', 'Textile', 'Other'].map((c) => <option key={c}>{c}</option>)}
                  </select>
                  {errors.category && <small className="form-error">Category is required</small>}
                </label>
                <Field label="Item details *" placeholder="e.g. old laptop with charger" {...register('itemDetails', { required: true })} error={errors.itemDetails && 'Item details required'} />
                <Field label="Brand (optional)" placeholder="Dell, Samsung, LG…" {...register('brand')} />
                <Field label="Condition" placeholder="Working, damaged, mixed…" {...register('condition')} />
                <Field label="Quantity" type="number" min="1" {...register('quantity', { valueAsNumber: true })} />
                <Field label="Estimated weight (kg)" type="number" min="0" step="0.1" placeholder="Optional" {...register('estimatedWeight')} />
              </div>
              <div className="np-nav">
                <button type="button" className="button secondary" onClick={() => setStep(1)}>← Back</button>
                <button type="button" className="button primary" onClick={() => setStep(3)}>Continue to schedule →</button>
              </div>
            </motion.div>
          )}

          {/* Step 3 — Schedule */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="np-card">
              <div className="np-card__head">
                <span className="np-card__icon"><Calendar size={22} /></span>
                <div><h2>Pickup schedule</h2><p>Choose a convenient date, time and address for the collector visit.</p></div>
              </div>
              <div className="form-grid">
                <Field
                  label="Pickup address *"
                  placeholder="House no., street, area, city"
                  {...register('address', {
                    required: 'Address is required',
                    validate: (value) => value.trim().length > 0 || 'Address is required',
                    setValueAs: (value) => value.trim()
                  })}
                  error={errors.address?.message}
                />
                <Field label="Pickup date *" type="date" {...register('pickupDate', { required: true })} />
                <Field label="Preferred time *" type="time" {...register('pickupTime', { required: true })} />
                <label className="field">
                  <span>Time period</span>
                  <select {...register('timePeriod')}><option>AM</option><option>PM</option></select>
                </label>
                <Field label="Special instructions (optional)" placeholder="Gate code, landmark, floor number…" {...register('notes')} />
              </div>
              {error && <p className="form-error">{error}</p>}
              <div className="np-nav">
                <button type="button" className="button secondary" onClick={() => setStep(2)}>← Back</button>
                <button className="button primary" disabled={isSubmitting}>{isSubmitting ? 'Booking…' : <><Sparkles size={15} /> Confirm pickup</>}</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  )
}
