import { Camera, ImagePlus, Sparkles } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { api } from './services/api'

function Input({ label, ...props }) {
  return <label className="field"><span>{label}</span><input {...props} /></label>
}

export default function NewPickupPage() {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const cameraRef = useRef(null)
  const [scan, setScan] = useState({ busy: false, message: '', result: null })
  const [error, setError] = useState('')
  const { register, handleSubmit, setValue, watch, formState: { isSubmitting } } = useForm({
    defaultValues: { quantity: 1, pickupDate: new Date().toISOString().slice(0, 10), pickupTime: '09:00', timePeriod: 'AM' }
  })
  const images = watch('images')
  const selectedFile = images?.[0]
  const registration = register('images')

  const identify = async (file = selectedFile) => {
    if (!file) return
    setScan({ busy: true, message: 'Photo analyse ho rahi hai…', result: null })
    try {
      const body = new FormData()
      body.append('image', file)
      const { data } = await api.post('/ai/identify-item', body, { headers: { 'Content-Type': 'multipart/form-data' } })
      const result = data.data
      setScan({ busy: false, message: 'Suggestion ready. Details submit karne se pehle review karein.', result })
      if (result.category) setValue('category', result.category)
      if (result.itemName) setValue('itemDetails', result.itemName)
      if (result.condition) setValue('condition', result.condition)
      if (result.estimatedWeightKg) setValue('estimatedWeight', result.estimatedWeightKg)
    } catch (e) {
      setScan({ busy: false, message: e.response?.data?.message || 'Photo identify nahi ho paayi. Aap details manually bhar sakte hain.', result: null })
    }
  }

  const handlePhoto = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      setValue('images', event.target.files, { shouldValidate: true })
      identify(file)
    }
  }
  const choosePhoto = () => inputRef.current?.click()
  const takePhoto = () => cameraRef.current?.click()
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
      setError(e.response?.data?.message || 'Pickup request save nahi ho paayi.')
    }
  }

  return <div className="dashboard-content narrow">
    <div className="page-title"><div><span className="eyebrow">New pickup</span><h1>Item ki photo se shuru karein.</h1><p>Photo lein, AI suggestion review karein aur pickup details complete karein.</p></div></div>
    <form className="panel form-grid" onSubmit={handleSubmit(submit)}>
      <section className="scan-card scan-card-primary">
        <div><span className="eyebrow"><Sparkles size={15} /> Smart item scan</span><h2>Camera se item identify karein</h2><p>Button dabate hi mobile camera ya computer file picker khulega. Photo select hote hi analysis start hoga.</p></div>
        <div className="scan-actions"><button type="button" className="button primary" onClick={takePhoto} disabled={scan.busy}><Camera size={16} /> Take photo</button><button type="button" className="button secondary" onClick={choosePhoto} disabled={scan.busy}><ImagePlus size={16} /> Upload image</button></div>
        <input className="visually-hidden" type="file" accept="image/png,image/jpeg,image/webp" capture="environment" ref={cameraRef} onChange={handlePhoto} />
        <input className="visually-hidden" type="file" accept="image/png,image/jpeg,image/webp" multiple {...registration} ref={(node) => { registration.ref(node); inputRef.current = node }} onChange={(event) => { registration.onChange(event); handlePhoto(event) }} />
        {selectedFile && <img className="scan-preview scan-preview-large" src={URL.createObjectURL(selectedFile)} alt="Selected item preview" />}
        {scan.message && <small className={scan.result ? 'success-text' : scan.busy ? 'scan-working' : 'form-error'}>{scan.message}</small>}
        {scan.result && <div className="scan-result"><b>{scan.result.itemName}</b><span>{scan.result.material || 'Material review karein'} · {Math.round((scan.result.confidence || 0) * 100)}% confidence</span></div>}
      </section>
      <div className="form-section-title"><h2>Item details</h2><p>AI suggestion ko apni actual information ke hisaab se edit kar sakte hain.</p></div>
      <label className="field"><span>Category</span><select {...register('category', { required: true })}><option value="">Choose category</option><option>E-waste</option><option>Metal</option><option>Paper</option><option>Plastic</option><option>Glass</option><option>Textile</option><option>Other</option></select></label>
      <Input label="Item details" placeholder="Example: old laptop with charger" {...register('itemDetails', { required: true })} />
      <Input label="Brand (optional)" placeholder="Dell, Samsung…" {...register('brand')} />
      <Input label="Condition" placeholder="Working, damaged, mixed…" {...register('condition')} />
      <Input label="Quantity" type="number" min="1" {...register('quantity', { valueAsNumber: true })} />
      <Input label="Estimated weight (kg)" type="number" min="0" step="0.1" placeholder="Optional" {...register('estimatedWeight')} />
      <div className="form-section-title"><h2>Pickup schedule</h2><p>Collector ko convenient time batayein.</p></div>
      <Input label="Pickup address" placeholder="House no., street, city" {...register('address', { required: true })} />
      <Input label="Pickup date" type="date" {...register('pickupDate', { required: true })} />
      <Input label="Preferred time" type="time" {...register('pickupTime', { required: true })} />
      <label className="field"><span>Time period</span><select {...register('timePeriod')}><option>AM</option><option>PM</option></select></label>
      <Input label="Notes (optional)" placeholder="Gate code, landmark, special instructions" {...register('notes')} />
      {error && <p className="form-error">{error}</p>}
      <div className="form-actions"><Link className="button secondary" to="/customer/pickups">Cancel</Link><button className="button primary" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Request pickup'} <Sparkles size={16} /></button></div>
    </form>
  </div>
}
