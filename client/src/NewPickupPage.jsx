import { Camera, ImagePlus, Sparkles, MapPin, Calendar, Package, Weight, CheckCircle2, ArrowLeft, Plus, Trash2, IndianRupee } from 'lucide-react'
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
const categoryRates = { 'E-waste': 40, Metal: 35, Paper: 12, Plastic: 20, Glass: 8, Textile: 15, Other: 5 }
const conditionMultipliers = { Working: 1, Good: 1, Used: .85, Damaged: .6, Mixed: .45 }
const cleanItem = (item, index = 0) => ({
  id: `${Date.now()}-${index}`,
  itemName: item.itemName || 'Recyclable item',
  category: item.category || 'Other',
  material: item.material || '',
  condition: item.condition || 'Used',
  estimatedWeightKg: Number(item.estimatedWeightKg) || 0,
  confidence: Number(item.confidence) || 0,
  notes: item.notes || ''
})

export default function NewPickupPage() {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const cameraRef = useRef(null)
  const [step, setStep] = useState(1)
  const [scan, setScan] = useState({ busy: false, message: '', result: null })
  const [items, setItems] = useState([])
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
      const detectedItems = (result.items?.length ? result.items : [result]).map(cleanItem)
      setItems(detectedItems)
      setScan({ busy: false, message: 'AI suggestion ready! Review and edit below.', result })
      if (result.category) setValue('category', result.category)
      if (detectedItems.length) setValue('itemDetails', detectedItems.map((item) => `${item.itemName} (${item.category})`).join('\n'))
      if (result.condition) setValue('condition', result.condition)
      if (detectedItems.length) setValue('estimatedWeight', detectedItems.reduce((total, item) => total + item.estimatedWeightKg, 0).toFixed(2))
    } catch (e) {
      const message = e.response?.status === 503
        ? 'AI service is temporarily busy. Please try the same photo again in a few seconds, or continue by selecting the category manually.'
        : e.response?.data?.message || 'Could not identify item. Fill details manually.'
      setScan({ busy: false, message, result: null })
    }
  }

  const updateItem = (id, key, value) => setItems((current) => current.map((item) => item.id === id ? { ...item, [key]: key === 'estimatedWeightKg' ? Math.max(0, Number(value) || 0) : value } : item))
  const addItem = () => setItems((current) => [...current, cleanItem({ itemName: '', category: 'Other', condition: 'Used', estimatedWeightKg: 0 }, current.length)])
  const removeItem = (id) => setItems((current) => current.length > 1 ? current.filter((item) => item.id !== id) : current)
  const totalWeight = items.reduce((total, item) => total + (Number(item.estimatedWeightKg) || 0), 0)
  const totalAmount = items.reduce((total, item) => total + (Number(item.estimatedWeightKg) || 0) * (categoryRates[item.category] || categoryRates.Other) * (conditionMultipliers[item.condition] || .85), 0)

  const handlePhoto = (event) => {
    const file = event.target.files?.[0]
    if (file) { setValue('images', event.target.files, { shouldValidate: true }); identify(file) }
  }

  const submit = async (values) => {
    try {
      const body = new FormData()
      const itemDetails = items.map((item) => `${item.itemName} | ${item.category} | ${item.estimatedWeightKg.toFixed(2)} kg | ${item.condition} | ₹${((item.estimatedWeightKg || 0) * (categoryRates[item.category] || 5) * (conditionMultipliers[item.condition] || .85)).toFixed(2)}`).join('\n')
      body.set('itemDetails', itemDetails || values.itemDetails)
      body.set('estimatedWeight', String(totalWeight || values.estimatedWeight || 0))
      body.set('notes', [values.notes, `Estimated total amount: ₹${totalAmount.toFixed(2)}`].filter(Boolean).join('\n'))
      Object.entries(values).forEach(([key, value]) => {
        if (key === 'images') [...value].forEach((file) => body.append('images', file))
        else if (['pickupTime', 'timePeriod', 'itemDetails', 'estimatedWeight', 'notes'].includes(key)) return
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
        <div className="np-header__main">
          <span className="eyebrow"><Sparkles size={13} /> New pickup request</span>
          <h1>Book a responsible pickup</h1>
          <p>Snap your item, let AI organize the details, and schedule a verified collector visit.</p>
        </div>
        <div className="np-header__trust"><span><CheckCircle2 size={14} /> AI-assisted</span><span><Package size={14} /> 7 material types</span><span><MapPin size={14} /> Doorstep pickup</span></div>
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
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="np-card np-card--scan">
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
                    <small>JPG, PNG, WEBP · Max 5 MB</small>
                  </div>
                )}
              </div>
              {!selectedFile && <div className="np-scan-tips"><span><Sparkles size={14} /> Best results with good lighting</span><span><Package size={14} /> Keep the full item in frame</span></div>}

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
                    <div><b>{scan.result.itemName}</b><small>{scan.result.category || 'Other'} · {scan.result.material || 'Material detected'} · {Math.round((scan.result.confidence || 0) * 100)}% confidence</small></div>
                  </motion.div>
                )}
                {scan.message && !scan.busy && !scan.result && (
                  <motion.p className="form-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{scan.message}</motion.p>
                )}
              </AnimatePresence>

              <div className="np-nav">
                <button type="button" className="button primary" onClick={() => { if (!items.length) addItem(); setStep(2) }}>Continue to item details <ArrowLeft size={15} className="np-arrow-right" /></button>
              </div>
            </motion.div>
          )}

          {/* Step 2 — Item Details */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="np-card np-card--details">
              <div className="np-card__head">
                <span className="np-card__icon"><Package size={22} /></span>
                <div><h2>Item details</h2><p>Review the AI suggestion and edit any field to match your item exactly.</p></div>
              </div>
              <div className="np-item-editor">
                <div className="np-item-editor__head"><div><b>Detected items</b><small>Each line has its own weight and live estimated amount.</small></div><button type="button" className="button secondary small" onClick={addItem}><Plus size={14} /> Add item</button></div>
                {items.map((item, index) => {
                  const amount = (Number(item.estimatedWeightKg) || 0) * (categoryRates[item.category] || 5) * (conditionMultipliers[item.condition] || .85)
                  return <motion.div className="np-item-row" key={item.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="np-item-row__number">{index + 1}</div>
                    <div className="np-item-row__fields"><input value={item.itemName} onChange={(event) => updateItem(item.id, 'itemName', event.target.value)} placeholder="Item name" aria-label="Item name" /><select value={item.category} onChange={(event) => updateItem(item.id, 'category', event.target.value)} aria-label="Item category">{['E-waste', 'Metal', 'Paper', 'Plastic', 'Glass', 'Textile', 'Other'].map((category) => <option key={category}>{category}</option>)}</select><select value={item.condition} onChange={(event) => updateItem(item.id, 'condition', event.target.value)} aria-label="Item condition">{Object.keys(conditionMultipliers).map((condition) => <option key={condition}>{condition}</option>)}</select><label><span>Weight (kg)</span><input type="number" min="0" step="0.01" value={item.estimatedWeightKg} onChange={(event) => updateItem(item.id, 'estimatedWeightKg', event.target.value)} /></label></div>
                    <div className="np-item-row__amount"><small><IndianRupee size={12} /> {categoryRates[item.category] || 5}/kg</small><b>₹{amount.toFixed(2)}</b>{items.length > 1 && <button type="button" onClick={() => removeItem(item.id)} aria-label={`Remove item ${index + 1}`}><Trash2 size={14} /></button>}</div>
                  </motion.div>
                })}
                <div className="np-item-total"><span><Weight size={16} /> Total weight <b>{totalWeight.toFixed(2)} kg</b></span><span>Total estimated amount <strong>₹{totalAmount.toFixed(2)}</strong></span></div>
              </div>
              <p className="np-estimate-note">Estimated value is based on selected category, condition and current indicative rates. Final value is confirmed after collection and weight verification.</p>
              <div className="form-grid">
                <input type="hidden" {...register('category', { required: true })} value={items[0]?.category || 'Other'} readOnly />
                <input type="hidden" {...register('itemDetails', { required: true })} value={items.map((item) => `${item.itemName} (${item.category})`).join('\n')} readOnly />
                <Field label="Brand (optional)" placeholder="Dell, Samsung, LG…" {...register('brand')} />
                <Field label="Quantity" type="number" min="1" {...register('quantity', { valueAsNumber: true })} />
              </div>
              <div className="np-nav">
                <button type="button" className="button secondary" onClick={() => setStep(1)}>← Back</button>
                <button type="button" className="button primary" onClick={() => setStep(3)}>Continue to schedule →</button>
              </div>
            </motion.div>
          )}

          {/* Step 3 — Schedule */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="np-card np-card--schedule">
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
