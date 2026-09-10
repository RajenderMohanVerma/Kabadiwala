import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { api } from './services/api'
import { useAuth } from './context/AuthContext'
import { LoadingState, ErrorState, EmptyState } from './components/Feedback'

const labels = (value) => String(value || '').toLowerCase().replaceAll('_', ' ')
const valueAt = (object, path) => path.split('.').reduce((value, key) => value?.[key], object)
const apiError = (error, fallback = 'Unable to complete this action') => error.response?.data?.message || fallback

function useData(path) {
  const [state, setState] = useState({ loading: Boolean(path), error: '', data: null })
  const load = () => {
    if (!path) return
    setState({ loading: true, error: '', data: null })
    api.get(path).then((response) => setState({ loading: false, error: '', data: response.data.data }))
      .catch((error) => setState({ loading: false, error: apiError(error, 'Unable to load data'), data: null }))
  }
  useEffect(() => { if (path) load() }, [path])
  return { ...state, reload: load }
}

function useAction() {
  const [state, setState] = useState({ busy: false, error: '', success: '' })
  const run = async (action) => {
    setState({ busy: true, error: '', success: '' })
    try {
      const response = await action()
      setState({ busy: false, error: '', success: response?.data?.message || 'Saved successfully' })
      return response
    } catch (error) {
      setState({ busy: false, error: apiError(error), success: '' })
      return null
    }
  }
  return { ...state, run }
}

function Page({ title, copy, children, action }) {
  return <div className="dashboard-content">
    <div className="page-title"><div><span className="eyebrow">Phase 3 operations</span><h1>{title}</h1><p>{copy}</p></div>{action}</div>
    {children}
  </div>
}
function State({ state }) {
  if (state.loading) return <LoadingState />
  if (state.error) return <ErrorState message={state.error} />
  return null
}
function ActionMessage({ action }) {
  return <>{action.error && <p className="form-error">{action.error}</p>}{action.success && <p className="success-text">{action.success}</p>}</>
}
function Status({ value }) { return <span className={`status status-${String(value || '').toLowerCase()}`}>{labels(value)}</span> }
function Table({ rows, columns, empty = 'New records will appear as the chain progresses.' }) {
  if (!rows?.length) return <EmptyState message={empty} />
  return <div className="panel table-wrap"><table><thead><tr>{columns.map(([key, title]) => <th key={key}>{title}</th>)}</tr></thead><tbody>
    {rows.map((row, index) => <tr key={row.id || row.batchCode || row.pickupCode || `${row.createdAt || 'row'}-${index}`}>
      {columns.map(([key, _title, render]) => <td key={`${row.id || index}-${key}`}>{render ? render(row) : key === 'status' ? <Status value={valueAt(row, key)} /> : String(valueAt(row, key) ?? '—')}</td>)}
    </tr>)}
  </tbody></table></div>
}
async function downloadCertificate(id, name = 'kabadivala-certificate.pdf') {
  const response = await api.get(`/certificates/${id}/download`, { responseType: 'blob' })
  const url = URL.createObjectURL(response.data)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = name
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
function QrPanel({ qr, onClose }) {
  if (!qr) return null
  return <div className="panel qr-panel"><div className="panel-heading"><h2>Batch handoff QR</h2><button type="button" className="button secondary small" onClick={onClose}>Close</button></div>
    <p>Show this one-time QR to the assigned recycler at handoff. Generating another QR replaces this one.</p>
    {qr.qrDataUrl && <img src={qr.qrDataUrl} alt={`Handoff QR for ${qr.batchCode}`} width="180" height="180" />}
    <code>{qr.token}</code>
  </div>
}

function HubCollections() {
  const state = useData('/hub/collections')
  const action = useAction()
  const [editing, setEditing] = useState(null)
  const verify = async (event, pickup) => {
    event.preventDefault()
    const form = Object.fromEntries(new FormData(event.currentTarget))
    const result = await action.run(() => api.post(`/hub/collections/${pickup.id}/verify`, { actualWeight: Number(form.actualWeight), note: form.note || undefined }))
    if (result) { setEditing(null); state.reload() }
  }
  const pickups = state.data?.pickups || []
  return <Page title="Hub collections" copy="Verify collected weights before they enter a traceable batch."><State state={state} /><ActionMessage action={action} />
    <Table rows={pickups} columns={[
      ['pickupCode', 'Pickup'], ['category', 'Category'], ['actualWeight', 'Weight (kg)'], ['status', 'Status'],
      ['actions', 'Actions', (pickup) => editing === pickup.id ? <form className="inline-form" onSubmit={(event) => verify(event, pickup)}><input required name="actualWeight" type="number" min="0.01" step="0.01" defaultValue={pickup.actualWeight || ''} aria-label="Verified weight" /><input name="note" placeholder="Note" aria-label="Verification note" /><button className="button primary small" disabled={action.busy}>Verify</button><button type="button" className="button secondary small" onClick={() => setEditing(null)}>Cancel</button></form> : <button className="button secondary small" onClick={() => setEditing(pickup.id)}>Verify weight</button>]
    ]} />
  </Page>
}

function HubBatches() {
  const { user } = useAuth()
  const state = useData('/hub/batches')
  const collections = useData('/hub/collections')
  const recyclers = useData('/hub/recyclers')
  const hubs = useData(user?.role === 'ADMIN' ? '/admin/hubs' : null)
  const action = useAction()
  const [selected, setSelected] = useState([])
  const [addTo, setAddTo] = useState('')
  const [sendRecycler, setSendRecycler] = useState({})
  const [hubId, setHubId] = useState('')
  const [qr, setQr] = useState(null)
  const toggle = (id) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  const createBatch = async (event) => {
    event.preventDefault()
    const form = Object.fromEntries(new FormData(event.currentTarget))
    const result = await action.run(() => api.post('/hub/batches', { pickupIds: selected, notes: form.notes || undefined, ...(user?.role === 'ADMIN' ? { hubId: form.hubId } : {}) }))
    if (result) { setSelected([]); event.currentTarget.reset(); state.reload(); collections.reload() }
  }
  const addPickups = async () => {
    if (!addTo || !selected.length) return
    const result = await action.run(() => api.post(`/hub/batches/${addTo}/pickups`, { pickupIds: selected }))
    if (result) { setSelected([]); setAddTo(''); state.reload(); collections.reload() }
  }
  const generateQr = async (batch) => {
    const result = await action.run(() => api.post(`/hub/batches/${batch.id}/qr`))
    if (result) setQr(result.data.data)
  }
  const sendBatch = async (batch) => {
    const recyclerId = sendRecycler[batch.id]
    if (!recyclerId) return
    const result = await action.run(() => api.post(`/hub/batches/${batch.id}/send`, { recyclerId }))
    if (result) state.reload()
  }
  const available = collections.data?.pickups || []
  const batches = state.data?.batches || []
  const recyclerUsers = recyclers.data?.users || []
  const hubUsers = hubs.data?.users || []
  return <Page title="Hub batches" copy="Group verified collections, create a handoff QR and send each batch to a recycler."><State state={state} /><ActionMessage action={action} /><QrPanel qr={qr} onClose={() => setQr(null)} />
    <form className="panel form-grid" onSubmit={createBatch}><h2 className="form-section-title">Create a batch</h2>
      {user?.role === 'ADMIN' && <label className="field"><span>Hub</span><select name="hubId" required value={hubId} onChange={(event) => setHubId(event.target.value)}><option value="">Select hub</option>{hubUsers.map((hub) => <option key={hub.id} value={hub.id}>{hub.name}</option>)}</select></label>}
      <label className="field"><span>Notes (optional)</span><input name="notes" placeholder="Handoff notes" /></label>
      <div className="selection-list"><b>Verified collected pickups</b>{available.length ? available.map((pickup) => <label key={pickup.id} className="selection-item"><input type="checkbox" checked={selected.includes(pickup.id)} onChange={() => toggle(pickup.id)} />{pickup.pickupCode} · {pickup.category} · {pickup.actualWeight || pickup.estimatedWeight || 0} kg</label>) : <small>No unbatched collections are ready.</small>}</div>
      <button className="button primary" disabled={action.busy || !selected.length}>{action.busy ? 'Creating…' : 'Create batch'}</button>
    </form>
    <div className="panel form-grid"><h2 className="form-section-title">Add pickups to an existing batch</h2><label className="field"><span>Batch</span><select value={addTo} onChange={(event) => setAddTo(event.target.value)}><option value="">Select a batch</option>{batches.filter((batch) => ['CREATED', 'READY_FOR_RECYCLER'].includes(batch.status)).map((batch) => <option key={batch.id} value={batch.id}>{batch.batchCode}</option>)}</select></label><button className="button secondary" disabled={action.busy || !addTo || !selected.length} onClick={addPickups}>Add selected pickups</button></div>
    <Table rows={batches} columns={[
      ['batchCode', 'Batch'], ['totalWeight', 'Weight (kg)'], ['status', 'Status'], ['recycler.name', 'Recycler'],
      ['actions', 'Actions', (batch) => <div className="row-actions"><Link className="button secondary small" to={`/hub/batches/${batch.id}`}>View</Link><button className="button secondary small" onClick={() => generateQr(batch)} disabled={action.busy}>Generate QR</button>{['CREATED', 'READY_FOR_RECYCLER'].includes(batch.status) && <><select aria-label={`Recycler for ${batch.batchCode}`} value={sendRecycler[batch.id] || ''} onChange={(event) => setSendRecycler({ ...sendRecycler, [batch.id]: event.target.value })}><option value="">Send to…</option>{recyclerUsers.map((recycler) => <option key={recycler.id} value={recycler.id}>{recycler.name}</option>)}</select><button className="button primary small" onClick={() => sendBatch(batch)} disabled={action.busy || !sendRecycler[batch.id]}>Send batch</button></>}</div>]
    ]} />
  </Page>
}

function HubDashboard({ kind }) {
  const state = useData(`/hub/${kind}`)
  if (kind === 'collections') return <HubCollections />
  if (kind === 'batches') return <HubBatches />
  const data = state.data
  const categoryData = Object.entries(data?.category || {}).map(([category, weight]) => ({ category, weight }))
  return <Page title={`Hub ${labels(kind)}`} copy="Receive collections, build traceable batches and hand them to verified recyclers."><State state={state} />{data?.stats && <div className="stat-grid"><div className="stat-card"><span>Unbatched collections</span><strong>{data.stats.collected}</strong></div><div className="stat-card"><span>Active batches</span><strong>{data.stats.batches}</strong></div><div className="stat-card"><span>Material in batches</span><strong>{data.stats.totalWeight} kg</strong></div></div>}{kind === 'dashboard' && <Table rows={data?.batches} columns={[['batchCode', 'Batch'], ['totalWeight', 'Weight (kg)'], ['status', 'Status'], ['recycler.name', 'Recycler'], ['actions', 'Actions', (batch) => <Link className="button secondary small" to={`/hub/batches/${batch.id}`}>View batch</Link>]]} />}{kind === 'inventory' && <Table rows={data?.batches} columns={[['batchCode', 'Batch'], ['status', 'Status'], ['totalWeight', 'Weight (kg)'], ['recycler.name', 'Recycler']]} />}{kind === 'analytics' && <div className="panel"><h2>Material by category</h2><div className="chart-box"><ResponsiveContainer width="100%" height={280}><BarChart data={categoryData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="category" /><YAxis /><Tooltip /><Bar dataKey="weight" fill="#16805c" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div></div>}</Page>
}

export function HubBatchPage() {
  const { id } = useParams()
  const state = useData(`/hub/batches/${id}`)
  const batch = state.data?.batch
  return <Page title={batch?.batchCode || 'Batch details'} copy="Review the chain of custody before handoff."><State state={state} />{batch && <><div className="stat-grid"><div className="stat-card"><span>Weight</span><strong>{batch.totalWeight} kg</strong></div><div className="stat-card"><span>Status</span><strong>{labels(batch.status)}</strong></div><div className="stat-card"><span>Recycler</span><strong>{batch.recycler?.name || 'Not assigned'}</strong></div></div><Table rows={batch.pickups} columns={[['pickup.pickupCode', 'Pickup'], ['pickup.category', 'Category'], ['weight', 'Weight (kg)']]} /><Table rows={batch.events} columns={[['status', 'Event'], ['actor.name', 'Actor'], ['createdAt', 'When']]} /></>}</Page>
}

function RecyclerList({ kind }) {
  const state = useData(`/recycler/${kind}`)
  const action = useAction()
  const [rejecting, setRejecting] = useState(null)
  const accept = async (batch) => { const result = await action.run(() => api.post(`/recycler/batches/${batch.id}/accept`)); if (result) state.reload() }
  const reject = async (event, batch) => {
    event.preventDefault()
    const form = Object.fromEntries(new FormData(event.currentTarget))
    const result = await action.run(() => api.post(`/recycler/batches/${batch.id}/reject`, { reason: form.reason }))
    if (result) { setRejecting(null); state.reload() }
  }
  const rows = state.data?.batches || []
  return <Page title={`Recycler ${labels(kind)}`} copy="Accept batches, record processing stages and publish recycling certificates."><State state={state} /><ActionMessage action={action} />{state.data?.stats && <div className="stat-grid"><div className="stat-card"><span>Batches</span><strong>{state.data.stats.totalBatches}</strong></div><div className="stat-card"><span>Weight</span><strong>{state.data.stats.totalWeight} kg</strong></div><div className="stat-card"><span>In processing</span><strong>{state.data.stats.processing}</strong></div></div>}<Table rows={rows} columns={[
    ['batchCode', 'Batch'], ['totalWeight', 'Weight (kg)'], ['status', 'Status'], ['completedAt', 'Completed'],
    ['actions', 'Actions', (batch) => <div className="row-actions"><Link className="button secondary small" to={`/recycler/batches/${batch.id}`}>View</Link>{batch.status === 'SENT_TO_RECYCLER' && <><button className="button primary small" onClick={() => accept(batch)} disabled={action.busy}>Accept</button><button className="button secondary small" onClick={() => setRejecting(batch.id)}>Reject</button></>}{rejecting === batch.id && <form className="inline-form" onSubmit={(event) => reject(event, batch)}><input name="reason" required minLength="3" placeholder="Reason" aria-label="Rejection reason" /><button className="button primary small" disabled={action.busy}>Confirm</button></form>}</div>]
  ]} /></Page>
}

function ProcessingForm({ batch, onDone }) {
  const action = useAction()
  const submitStage = async (event) => {
    event.preventDefault()
    const form = Object.fromEntries(new FormData(event.currentTarget))
    let recoveredMaterial = {}
    try { recoveredMaterial = form.material ? JSON.parse(form.material) : {} } catch { action.run(async () => { throw { response: { data: { message: 'Recovered material must be valid JSON' } } } }); return }
    const result = await action.run(() => api.post(`/recycler/batches/${batch.id}/processing`, { stage: form.stage, status: form.status, notes: form.notes || undefined, recoveredMaterial }))
    if (result) onDone()
  }
  const recycle = async (event) => {
    event.preventDefault()
    const form = Object.fromEntries(new FormData(event.currentTarget))
    let recoveredMaterial = {}
    try { recoveredMaterial = form.material ? JSON.parse(form.material) : {} } catch { action.run(async () => { throw { response: { data: { message: 'Recovered material must be valid JSON' } } } }); return }
    const result = await action.run(() => api.post(`/recycler/batches/${batch.id}/recycle`, { recoveredMaterial }))
    if (result) onDone()
  }
  return <><div className="panel"><h2>Record processing stage</h2><form className="form-grid" onSubmit={submitStage}><label className="field"><span>Stage</span><input name="stage" required placeholder="Sorting, shredding…" /></label><label className="field"><span>Status</span><select name="status" defaultValue="IN_PROGRESS"><option>IN_PROGRESS</option><option>COMPLETED</option><option>PENDING</option></select></label><label className="field"><span>Recovered material (JSON)</span><input name="material" placeholder='{"aluminium": 12.5}' /></label><label className="field"><span>Notes</span><input name="notes" /></label><button className="button primary" disabled={action.busy}>Save stage</button></form><ActionMessage action={action} /></div>{batch.status === 'PROCESSING' && <div className="panel"><h2>Complete recycling</h2><p>Record the final recovered material and issue customer certificates.</p><form className="form-grid" onSubmit={recycle}><label className="field"><span>Final recovered material (JSON)</span><input name="material" placeholder='{"plastic_flakes": 20}' /></label><button className="button primary" disabled={action.busy}>Recycle and issue certificates</button></form><ActionMessage action={action} /></div>}</>
}

export function RecyclerBatchPage() {
  const { id } = useParams()
  const state = useData(`/recycler/batches/${id}`)
  const action = useAction()
  const batch = state.data?.batch
  const refresh = () => state.reload()
  const accept = () => action.run(() => api.post(`/recycler/batches/${id}/accept`)).then((result) => result && refresh())
  const reject = async () => { const reason = window.prompt('Why is this batch being rejected?'); if (reason) { const result = await action.run(() => api.post(`/recycler/batches/${id}/reject`, { reason })); if (result) refresh() } }
  return <Page title={batch?.batchCode || 'Batch details'} copy="Full batch traceability, processing stages and recovered material."><State state={state} /><ActionMessage action={action} />{batch && <><div className="stat-grid"><div className="stat-card"><span>Weight</span><strong>{batch.totalWeight} kg</strong></div><div className="stat-card"><span>Status</span><strong>{labels(batch.status)}</strong></div><div className="stat-card"><span>Categories</span><strong>{JSON.parse(batch.categoriesJson || '[]').join(', ') || '—'}</strong></div></div>{batch.status === 'SENT_TO_RECYCLER' && <div className="actions"><button className="button primary" onClick={accept} disabled={action.busy}>Accept batch</button><button className="button secondary" onClick={reject} disabled={action.busy}>Reject batch</button></div>}{['RECEIVED', 'PROCESSING'].includes(batch.status) && <ProcessingForm batch={batch} onDone={refresh} />}{batch.certificate && <button className="button primary" onClick={() => downloadCertificate(batch.certificate.id, `${batch.certificate.certificateNo}.pdf`)}>Download certificate</button>}<Table rows={batch.stages} columns={[['stage', 'Stage'], ['status', 'Status'], ['recoveredMaterialJson', 'Recovered material'], ['completedAt', 'Completed']]} /><Table rows={batch.events} columns={[['status', 'Event'], ['actor.name', 'Actor'], ['note', 'Notes'], ['createdAt', 'When']]} /></>}</Page>
}

function AdminUsers({ kind }) {
  const state = useData(kind === 'users' ? '/admin/users' : `/admin/${kind}`)
  const action = useAction()
  const update = async (user, data) => { const result = await action.run(() => api.patch(`/admin/users/${user.id}`, data)); if (result) state.reload() }
  const users = state.data?.users || []
  return <Page title={`Admin ${labels(kind)}`} copy="Manage verification, access and operational role records."><State state={state} /><ActionMessage action={action} /><Table rows={users} columns={[['name', 'Name'], ['email', 'Email'], ['role', 'Role'], ['status', 'Status'], ['verified', 'Verified'], ['actions', 'Actions', (user) => <div className="row-actions"><button className="button secondary small" onClick={() => update(user, { verified: !user.verified })}>{user.verified ? 'Unverify' : 'Verify'}</button><select aria-label={`Status for ${user.email}`} value={user.status} onChange={(event) => update(user, { status: event.target.value })}><option>ACTIVE</option><option>INACTIVE</option><option>SUSPENDED</option></select></div>]]} /></Page>
}

function AdminComplaints() {
  const state = useData('/admin/complaints')
  const action = useAction()
  const update = async (complaint, status) => { const result = await action.run(() => api.patch(`/admin/complaints/${complaint.id}`, { status })); if (result) state.reload() }
  const rows = state.data?.complaints || []
  return <Page title="Admin complaints" copy="Move complaints through review, resolution and closure."><State state={state} /><ActionMessage action={action} /><Table rows={rows} columns={[['id', 'ID'], ['subject', 'Subject'], ['customer.name', 'Customer'], ['pickup.pickupCode', 'Pickup'], ['status', 'Status'], ['updatedAt', 'Updated'], ['actions', 'Actions', (complaint) => <select aria-label={`Status for complaint ${complaint.id}`} value={complaint.status} onChange={(event) => update(complaint, event.target.value)}><option>OPEN</option><option>IN_REVIEW</option><option>RESOLVED</option><option>CLOSED</option></select>]]} /></Page>
}

function AdminPage({ kind }) {
  if (['users', 'collectors', 'recyclers', 'hubs'].includes(kind)) return <AdminUsers kind={kind} />
  if (kind === 'complaints') return <AdminComplaints />
  const state = useData(`/admin/${kind}`)
  const data = state.data
  if (kind === 'dashboard') return <Page title="Admin overview" copy="Monitor users, collections, batches and open complaints."><State state={state} />{data?.stats && <div className="stat-grid"><div className="stat-card"><span>Users</span><strong>{data.stats.users}</strong></div><div className="stat-card"><span>Pickups</span><strong>{data.stats.pickups}</strong></div><div className="stat-card"><span>Open complaints</span><strong>{data.stats.openComplaints}</strong></div></div>}</Page>
  const rows = data?.pickups || data?.batches || data?.reviews || data?.notifications || data?.logs || []
  const statusData = Object.entries(data?.pickupStatus || {}).map(([status, count]) => ({ status: labels(status), count }))
  const columns = kind === 'pickups' ? [['pickupCode', 'Pickup'], ['customer.name', 'Customer'], ['collector.name', 'Collector'], ['status', 'Status'], ['actualWeight', 'Weight (kg)']] : kind === 'batches' ? [['batchCode', 'Batch'], ['hub.name', 'Hub'], ['recycler.name', 'Recycler'], ['status', 'Status'], ['totalWeight', 'Weight (kg)']] : kind === 'reviews' ? [['pickup.pickupCode', 'Pickup'], ['reviewer.name', 'Reviewer'], ['subject.name', 'Subject'], ['rating', 'Rating'], ['comment', 'Comment']] : kind === 'notifications' ? [['user.name', 'User'], ['title', 'Title'], ['message', 'Message'], ['createdAt', 'Created']] : [['action', 'Action'], ['entityType', 'Entity'], ['actor.name', 'Actor'], ['createdAt', 'Created']]
  return <Page title={`Admin ${labels(kind)}`} copy="Monitor verification, workflows, complaints and audit history."><State state={state} />{kind === 'analytics' && <div className="panel"><h2>Pickup status</h2><div className="chart-box"><ResponsiveContainer width="100%" height={280}><BarChart data={statusData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="status" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="count" fill="#16805c" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div></div>}{!['analytics'].includes(kind) && <Table rows={rows} columns={columns} />}</Page>
}

export function Phase3Page({ role, kind }) {
  return role === 'hub' ? <HubDashboard kind={kind} /> : role === 'recycler' ? <RecyclerList kind={kind} /> : <AdminPage kind={kind} />
}
export function BulkPickupPage() {
  const action = useAction()
  const submit = async (event) => { event.preventDefault(); const form = Object.fromEntries(new FormData(event.currentTarget)); const result = await action.run(() => api.post('/bulk-pickups', { ...form, estimatedWeight: Number(form.estimatedWeight), scheduledDate: new Date(form.scheduledDate).toISOString() })); if (result) event.currentTarget.reset() }
  return <Page title="Bulk pickup" copy="Arrange a collection for offices, apartments and campus events."><form className="panel form-grid" onSubmit={submit}>{['organization', 'contactName', 'contactPhone', 'address', 'category', 'estimatedWeight', 'scheduledDate'].map((name) => <label className="field" key={name}><span>{labels(name)}</span><input required name={name} type={name === 'scheduledDate' ? 'date' : name === 'estimatedWeight' ? 'number' : 'text'} /></label>)}<button className="button primary" disabled={action.busy}>{action.busy ? 'Requesting…' : 'Request bulk pickup'}</button><ActionMessage action={action} /></form></Page>
}
export function CertificatePage() {
  const state = useData('/certificates')
  const [error, setError] = useState('')
  const download = async (certificate) => { setError(''); try { await downloadCertificate(certificate.id, `${certificate.certificateNo}.pdf`) } catch (actionError) { setError(apiError(actionError, 'Unable to download certificate')) } }
  return <Page title="Digital recycling certificates" copy="Certificates are generated after a successful recycling completion."><State state={state} />{error && <p className="form-error">{error}</p>}{(state.data?.certificates || []).map((certificate) => <p key={certificate.id}><b>{certificate.certificateNo}</b> · Batch {certificate.batch?.batchCode} — <button className="button secondary small" onClick={() => download(certificate)}>Download PDF</button></p>)}</Page>
}
