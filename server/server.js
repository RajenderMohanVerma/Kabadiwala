import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import multer from 'multer'
import PDFDocument from 'pdfkit'
import QRCode from 'qrcode'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const app = express()
const PORT = Number(process.env.PORT || 5000)
const isProduction = process.env.NODE_ENV === 'production'
const JWT_SECRET = process.env.JWT_SECRET || (isProduction ? '' : 'development-only-change-me')
if (isProduction && JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters in production')
}
const root = path.dirname(fileURLToPath(import.meta.url))
const uploadDir = path.join(root, 'uploads')
fs.mkdirSync(uploadDir, { recursive: true })

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }))
app.use(express.json({ limit: '1mb' }))
app.use('/uploads', express.static(uploadDir))
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 60, standardHeaders: true }))

const send = (res, status, message, data) => res.status(status).json({ success: status < 400, message, ...(data === undefined ? {} : { data }) })
const publicUser = ({ passwordHash, ...user }) => user
const signToken = (user) => jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' })
const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization
    if (!header?.startsWith('Bearer ')) return send(res, 401, 'Authentication required')
    const payload = jwt.verify(header.slice(7), JWT_SECRET)
    const user = await prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user || user.status !== 'ACTIVE') return send(res, 401, 'Your session is no longer valid')
    req.user = user
    next()
  } catch { return send(res, 401, 'Invalid or expired token') }
}
const allow = (...roles) => (req, res, next) => roles.includes(req.user.role) ? next() : send(res, 403, 'You do not have permission to access this resource')
const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next)

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().transform((v) => v.toLowerCase()),
  phone: z.string().trim().min(7).max(20).optional(),
  password: z.string().min(8).max(100),
  role: z.enum(['CUSTOMER', 'COLLECTOR']).default('CUSTOMER')
})
const loginSchema = z.object({ email: z.string().email().transform((v) => v.toLowerCase()), password: z.string().min(1) })
const pickupSchema = z.object({
  category: z.string().trim().min(2).max(60),
  itemDetails: z.string().trim().min(2).max(500),
  brand: z.string().trim().max(80).optional().nullable(),
  condition: z.string().trim().max(80).optional().nullable(),
  quantity: z.coerce.number().int().min(1).max(10000),
  estimatedWeight: z.coerce.number().min(0).max(100000).optional().nullable(),
  address: z.string().trim().min(5).max(500),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
  pickupDate: z.coerce.date(),
  timeSlot: z.string().trim().min(2).max(60),
  notes: z.string().trim().max(1000).optional().nullable()
})
const statusTransitions = {
  REQUESTED: ['MATCHING', 'CANCELLED'],
  MATCHING: ['ASSIGNED', 'REJECTED', 'CANCELLED'],
  ASSIGNED: ['ACCEPTED', 'REJECTED', 'CANCELLED'],
  ACCEPTED: ['COLLECTOR_ON_THE_WAY', 'CANCELLED'],
  COLLECTOR_ON_THE_WAY: ['ARRIVED', 'CANCELLED'],
  ARRIVED: ['COLLECTED'],
  COLLECTED: [],
  REJECTED: [],
  CANCELLED: []
}
const ownerInclude = {
  events: { include: { actor: { select: { id: true, name: true, role: true } }, }, orderBy: { createdAt: 'asc' } },
  matches: { include: { collector: { select: { id: true, name: true, phone: true, rating: true, verified: true } } } },
  review: true
}
const normalizePickup = (pickup) => ({ ...pickup, images: JSON.parse(pickup.imagesJson || '[]'), imagesJson: undefined })
const normalizeCollectionProof = (pickup) => ({ ...pickup, collectionProof: JSON.parse(pickup.collectionProofJson || '[]'), collectionProofJson: undefined })
const codeFor = async () => {
  const year = new Date().getFullYear()
  const count = await prisma.pickup.count({ where: { createdAt: { gte: new Date(`${year}-01-01T00:00:00.000Z`) } } })
  return `KC-${year}-${String(count + 1).padStart(6, '0')}`
}
const notify = async (userId, title, message, pickupId) => userId && prisma.notification.create({ data: { userId, title, message, pickupId } })
const event = (pickupId, status, actorId, note, location) => prisma.pickupStatusEvent.create({ data: { pickupId, status, actorId, note, location } })
const audit = (actorId, action, entityType, entityId, metadata = {}) => prisma.auditLog.create({ data: { actorId, action, entityType, entityId, metadataJson: JSON.stringify(metadata) } })
const chain = (data) => prisma.chainOfCustodyEvent.create({ data: { metadataJson: '{}', ...data } })
const batchCode = async () => `B-${new Date().getFullYear()}-${String(await prisma.batch.count() + 1).padStart(6, '0')}`
const certificateCode = async () => `KDC-${new Date().getFullYear()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`

// Matching is deliberately explainable: every score is a rule visible to operators.
async function matchPickup(pickup) {
  const collectors = await prisma.user.findMany({ where: { role: 'COLLECTOR', status: 'ACTIVE', available: true }, include: { collectorPickups: { where: { status: { in: ['ASSIGNED', 'ACCEPTED', 'COLLECTOR_ON_THE_WAY', 'ARRIVED'] } } } } })
  const category = pickup.category.toLowerCase()
  const ranked = collectors.map((collector) => {
    const reasons = []
    let score = 0
    if (collector.verified) { score += 30; reasons.push('verified +30') }
    if (collector.available) { score += 20; reasons.push('available +20') }
    const categories = (collector.supportedCategories || '').toLowerCase()
    if (!categories || categories.split(',').map((x) => x.trim()).includes(category)) { score += 15; reasons.push('category support +15') }
    const load = collector.collectorPickups.reduce((sum, p) => sum + (p.estimatedWeight || 0), 0)
    if (!collector.capacityKg || load + (pickup.estimatedWeight || 0) <= collector.capacityKg) { score += 15; reasons.push('capacity +15') }
    if (collector.serviceArea && pickup.address.toLowerCase().includes(collector.serviceArea.toLowerCase())) { score += 15; reasons.push('service area +15') }
    if (pickup.latitude != null && pickup.longitude != null && collector.latitude != null && collector.longitude != null) {
      const distance = Math.hypot(pickup.latitude - collector.latitude, pickup.longitude - collector.longitude)
      score += Math.max(0, 10 - distance * 2)
      reasons.push(`distance ${distance.toFixed(2)}`)
    }
    score += Math.min(10, collector.rating || 0)
    reasons.push(`rating +${Math.min(10, collector.rating || 0).toFixed(1)}`)
    score -= collector.collectorPickups.length * 2
    reasons.push(`workload -${collector.collectorPickups.length * 2}`)
    return { collector, score, reasons }
  }).sort((a, b) => b.score - a.score)
  const best = ranked[0]
  if (!best) return null
  const match = await prisma.collectorMatch.upsert({
    where: { pickupId_collectorId: { pickupId: pickup.id, collectorId: best.collector.id } },
    update: { score: best.score, reasons: JSON.stringify(best.reasons), status: 'PROPOSED' },
    create: { pickupId: pickup.id, collectorId: best.collector.id, score: best.score, reasons: JSON.stringify(best.reasons) }
  })
  await prisma.pickup.update({ where: { id: pickup.id }, data: { status: 'ASSIGNED', collectorId: best.collector.id } })
  await event(pickup.id, 'ASSIGNED', null, `Smart match: ${best.reasons.join(', ')}`)
  await notify(best.collector.id, 'New pickup request', `${pickup.pickupCode} is ready for your acceptance.`, pickup.id)
  return { ...match, collector: publicUser(best.collector), reasons: best.reasons }
}

app.get('/', (_req, res) => send(res, 200, 'Kabadivala API is running', { health: '/api/health' }))
app.get('/api/health', (_req, res) => send(res, 200, 'Kabadivala API is running'))

app.post('/api/auth/register', asyncRoute(async (req, res) => {
  const input = registerSchema.parse(req.body)
  if (await prisma.user.findUnique({ where: { email: input.email } })) return send(res, 409, 'An account with this email already exists')
  const { password, ...profile } = input
  const user = await prisma.user.create({ data: { ...profile, passwordHash: await bcrypt.hash(password, 12), verified: input.role === 'CUSTOMER' } })
  return send(res, 201, 'Account created successfully', { token: signToken(user), user: publicUser(user) })
}))

app.post('/api/auth/login', asyncRoute(async (req, res) => {
  const input = loginSchema.parse(req.body)
  const user = await prisma.user.findUnique({ where: { email: input.email } })
  if (!user || user.status !== 'ACTIVE' || !(await bcrypt.compare(input.password, user.passwordHash))) return send(res, 401, 'Invalid email or password')
  return send(res, 200, 'Signed in successfully', { token: signToken(user), user: publicUser(user) })
}))
app.get('/api/auth/me', auth, (req, res) => send(res, 200, 'Authenticated user', { user: publicUser(req.user) }))
app.patch('/api/auth/profile', auth, asyncRoute(async (req, res) => {
  const data = z.object({ name: z.string().trim().min(2).max(80).optional(), phone: z.string().trim().max(20).optional().nullable(), address: z.string().trim().max(500).optional().nullable(), latitude: z.number().optional().nullable(), longitude: z.number().optional().nullable(), serviceArea: z.string().max(100).optional().nullable(), supportedCategories: z.string().max(300).optional().nullable(), capacityKg: z.number().positive().optional().nullable(), available: z.boolean().optional() }).parse(req.body)
  const user = await prisma.user.update({ where: { id: req.user.id }, data })
  return send(res, 200, 'Profile updated', { user: publicUser(user) })
}))

app.get('/api/pickups', auth, asyncRoute(async (req, res) => {
  if (!['CUSTOMER', 'COLLECTOR', 'ADMIN'].includes(req.user.role)) return send(res, 403, 'You do not have permission to access pickups')
  const where = req.user.role === 'CUSTOMER' ? { customerId: req.user.id } : req.user.role === 'COLLECTOR' ? { OR: [{ collectorId: req.user.id }, { status: { in: ['REQUESTED', 'MATCHING'] } }] } : {}
  const pickups = await prisma.pickup.findMany({ where, include: ownerInclude, orderBy: { createdAt: 'desc' } })
  send(res, 200, 'Pickups loaded', { pickups: pickups.map(normalizePickup) })
}))
app.get('/api/pickups/:id', auth, asyncRoute(async (req, res) => {
  const pickup = await prisma.pickup.findUnique({ where: { id: req.params.id }, include: { ...ownerInclude, customer: { select: { id: true, name: true, phone: true } }, collector: { select: { id: true, name: true, phone: true, rating: true } }, pointTransaction: true } })
  if (!pickup) return send(res, 404, 'Pickup not found')
  if (req.user.role === 'CUSTOMER' && pickup.customerId !== req.user.id || req.user.role === 'COLLECTOR' && pickup.collectorId !== req.user.id && !['REQUESTED', 'MATCHING'].includes(pickup.status) || !['CUSTOMER', 'COLLECTOR', 'ADMIN'].includes(req.user.role)) return send(res, 403, 'You cannot access this pickup')
  send(res, 200, 'Pickup loaded', { pickup: normalizePickup(pickup) })
}))

const upload = multer({
  storage: multer.diskStorage({ destination: uploadDir, filename: (_req, file, cb) => cb(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`) }),
  limits: { files: 5, fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error('Only PNG, JPG or WEBP images are allowed'))
})
const aiUpload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 1, fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error('Only PNG, JPG or WEBP images are allowed'))
})
const itemIdentificationSchema = z.object({
  itemName: z.string().trim().min(1).max(120),
  category: z.string().trim().min(1).max(60),
  material: z.string().trim().min(1).max(120),
  condition: z.string().trim().min(1).max(80),
  estimatedWeightKg: z.number().finite().nonnegative().max(100000),
  confidence: z.number().finite().min(0).max(1),
  notes: z.string().trim().max(1000)
})
const identifyItem = async (req, res) => {
  if (!process.env.GEMINI_API_KEY) return send(res, 503, 'AI item identification is not configured')
  if (!req.file) return send(res, 400, 'An image is required')

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30_000)
  try {
    const configuredModels = (process.env.GEMINI_MODEL || 'gemini-2.5-flash,gemini-2.0-flash,gemini-1.5-flash')
      .split(',')
      .map((model) => model.trim().replace(/^models\//, ''))
      .filter(Boolean)
    const models = [...new Set([...configuredModels, 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'])]
    let response
    let lastProviderMessage = ''
    for (const model of models) {
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: 'Identify the recyclable item in this image. Return JSON only (no markdown) with exactly these fields: itemName, category, material, condition, estimatedWeightKg, confidence, notes. Use a number in kilograms for estimatedWeightKg and a number from 0 to 1 for confidence. Keep notes concise. If uncertain, say so in notes and lower confidence.' },
              { inlineData: { mimeType: req.file.mimetype, data: req.file.buffer.toString('base64') } }
            ]
          }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.2 }
        })
      })
      if (response.ok) break
      lastProviderMessage = await response.text()
      if (![400, 404, 429].includes(response.status)) break
    }
    if (!response.ok) {
      console.error(`Gemini item identification failed with status ${response.status}: ${lastProviderMessage.slice(0, 500)}`)
      if ([401, 403].includes(response.status)) return send(res, 502, 'Gemini rejected the API key. Update GEMINI_API_KEY in Render and redeploy the backend.')
      if (response.status === 429) return send(res, 503, 'Gemini is temporarily rate-limited. Please try again in a moment.')
      return send(res, 502, 'Gemini could not analyse this image. Check the configured model and Generative Language API access in Render.')
    }
    const payload = await response.json()
    const text = payload?.candidates?.[0]?.content?.parts?.find((part) => typeof part.text === 'string')?.text
    if (!text) return send(res, 502, 'The AI provider returned an invalid response')
    let parsed
    try {
      parsed = JSON.parse(text)
    } catch {
      return send(res, 502, 'The AI provider returned invalid item data')
    }
    const result = itemIdentificationSchema.safeParse(parsed)
    if (!result.success) return send(res, 502, 'The AI provider returned incomplete item data')
    return send(res, 200, 'Item identified', result.data)
  } catch (error) {
    if (error.name === 'AbortError') return send(res, 504, 'The AI provider timed out')
    console.error('Gemini item identification request failed', error)
    return send(res, 502, 'Unable to contact the AI provider')
  } finally {
    clearTimeout(timeout)
  }
}
app.post('/api/ai/identify-item', auth, aiUpload.single('image'), asyncRoute(identifyItem))
app.post('/api/pickups', auth, allow('CUSTOMER'), upload.array('images', 5), asyncRoute(async (req, res) => {
  const input = pickupSchema.parse(req.body)
  const pickup = await prisma.pickup.create({ data: { ...input, pickupCode: await codeFor(), pickupDate: new Date(input.pickupDate), imagesJson: JSON.stringify((req.files || []).map((file) => `/uploads/${file.filename}`)), customerId: req.user.id }, include: ownerInclude })
  await event(pickup.id, 'REQUESTED', req.user.id, 'Pickup request created')
  await notify(req.user.id, 'Pickup request created', `${pickup.pickupCode} is now requested.`, pickup.id)
  send(res, 201, 'Pickup request created', { pickup: normalizePickup(pickup) })
}))

app.post('/api/pickups/:id/match', auth, allow('CUSTOMER', 'ADMIN'), asyncRoute(async (req, res) => {
  const pickup = await prisma.pickup.findUnique({ where: { id: req.params.id } })
  if (!pickup || (req.user.role === 'CUSTOMER' && pickup.customerId !== req.user.id)) return send(res, 404, 'Pickup not found')
  if (!['REQUESTED', 'MATCHING', 'REJECTED'].includes(pickup.status)) return send(res, 409, 'Pickup is not available for matching')
  await prisma.pickup.update({ where: { id: pickup.id }, data: { status: 'MATCHING' } })
  await event(pickup.id, 'MATCHING', req.user.id, 'Smart collector matching started')
  const match = await matchPickup(pickup)
  send(res, 200, match ? 'Collector matched' : 'No available collector yet', { match })
}))

async function transition(req, res) {
  const pickup = await prisma.pickup.findUnique({ where: { id: req.params.id }, include: { customer: true } })
  if (!pickup) return send(res, 404, 'Pickup not found')
  const next = z.object({ status: z.enum(['REQUESTED', 'MATCHING', 'ASSIGNED', 'ACCEPTED', 'COLLECTOR_ON_THE_WAY', 'ARRIVED', 'COLLECTED', 'REJECTED', 'CANCELLED']), note: z.string().max(500).optional(), location: z.string().max(300).optional(), latitude: z.number().optional(), longitude: z.number().optional() }).parse(req.body)
  if (!statusTransitions[pickup.status].includes(next.status)) return send(res, 409, `Invalid transition from ${pickup.status} to ${next.status}`)
  const customer = req.user.role === 'CUSTOMER' && pickup.customerId === req.user.id
  const collector = req.user.role === 'COLLECTOR' && pickup.collectorId === req.user.id
  const customerCan = customer && next.status === 'CANCELLED' && !['COLLECTED', 'CANCELLED'].includes(pickup.status)
  const collectorCan = collector && ['ACCEPTED', 'REJECTED', 'COLLECTOR_ON_THE_WAY', 'ARRIVED', 'COLLECTED'].includes(next.status)
  if (collector && next.status === 'COLLECTED') return send(res, 409, 'Submit actual weight and collection proof through the collection form')
  if (!customerCan && !collectorCan && req.user.role !== 'ADMIN') return send(res, 403, 'You are not authorized for this status change')
  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.pickup.update({ where: { id: pickup.id }, data: { status: next.status, ...(next.status === 'REJECTED' ? { collectorId: null } : {}) }, include: ownerInclude })
    await tx.pickupStatusEvent.create({ data: { pickupId: pickup.id, status: next.status, actorId: req.user.id, note: next.note, location: next.location, latitude: next.latitude, longitude: next.longitude } })
    return result
  })
  await notify(pickup.customerId, `Pickup ${next.status.toLowerCase().replaceAll('_', ' ')}`, next.note || `Your pickup is now ${next.status.toLowerCase().replaceAll('_', ' ')}.`, pickup.id)
  if (pickup.collectorId && pickup.collectorId !== req.user.id) await notify(pickup.collectorId, `Pickup ${next.status.toLowerCase().replaceAll('_', ' ')}`, next.note || 'Pickup status changed.', pickup.id)
  if (next.status === 'COLLECTED') await awardPoints(pickup.id)
  send(res, 200, 'Pickup status updated', { pickup: normalizePickup(updated) })
}
app.patch('/api/pickups/:id/status', auth, asyncRoute(transition))

app.patch('/api/collector/requests/:id/collection', auth, allow('COLLECTOR'), upload.single('proof'), asyncRoute(async (req, res) => {
  const actualWeight = z.coerce.number().positive().max(100000).parse(req.body.actualWeight)
  const pickup = await prisma.pickup.findUnique({ where: { id: req.params.id } })
  if (!pickup || pickup.collectorId !== req.user.id) return send(res, 404, 'Pickup not found')
  if (pickup.status !== 'ARRIVED') return send(res, 409, 'Collection proof can be submitted after arrival')
  const proof = req.file ? [`/uploads/${req.file.filename}`] : []
  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.pickup.update({ where: { id: pickup.id }, data: { actualWeight, collectionProofJson: JSON.stringify(proof), status: 'COLLECTED' }, include: ownerInclude })
    await tx.pickupStatusEvent.create({ data: { pickupId: pickup.id, status: 'COLLECTED', actorId: req.user.id, note: `Collected and verified at ${actualWeight} kg` } })
    return result
  })
  await notify(pickup.customerId, 'Items collected', `${pickup.pickupCode} was collected at ${actualWeight} kg.`, pickup.id)
  await awardPoints(pickup.id)
  send(res, 200, 'Collection recorded', { pickup: normalizePickup(normalizeCollectionProof(updated)) })
}))

async function awardPoints(pickupId) {
  const pickup = await prisma.pickup.findUnique({ where: { id: pickupId } })
  if (!pickup || pickup.pointsAwarded > 0) return
  const rates = { metal: 6, paper: 3, plastic: 4, 'e-waste': 10, ewaste: 10, glass: 3, textile: 4 }
  const rate = rates[pickup.category.toLowerCase()] || 4
  const points = Math.max(10, Math.round(10 + (pickup.actualWeight ?? pickup.estimatedWeight ?? 0) * rate))
  await prisma.$transaction([prisma.pointTransaction.create({ data: { userId: pickup.customerId, pickupId, points, reason: `${pickup.category} pickup: 10 base + ${rate}/kg` } }), prisma.pickup.update({ where: { id: pickupId }, data: { pointsAwarded: points } })])
  await notify(pickup.customerId, 'Eco points earned', `You earned ${points} eco points.`, pickupId)
}
app.get('/api/points', auth, asyncRoute(async (req, res) => {
  const transactions = await prisma.pointTransaction.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' }, include: { pickup: { select: { pickupCode: true, category: true } } } })
  send(res, 200, 'Points loaded', { total: transactions.reduce((sum, x) => sum + x.points, 0), transactions })
}))

app.get('/api/notifications', auth, asyncRoute(async (req, res) => send(res, 200, 'Notifications loaded', { notifications: await prisma.notification.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' }, take: 100 }) })))
app.patch('/api/notifications/:id/read', auth, asyncRoute(async (req, res) => {
  const result = await prisma.notification.updateMany({ where: { id: req.params.id, userId: req.user.id }, data: { readAt: new Date() } })
  send(res, result.count ? 200 : 404, result.count ? 'Notification marked read' : 'Notification not found')
}))

app.get('/api/pickups/:id/qr', auth, asyncRoute(async (req, res) => {
  const pickup = await prisma.pickup.findUnique({ where: { id: req.params.id } })
  if (!pickup || (req.user.role === 'CUSTOMER' && pickup.customerId !== req.user.id) || (req.user.role === 'COLLECTOR' && pickup.collectorId !== req.user.id)) return send(res, 404, 'Pickup not found')
  const token = crypto.randomBytes(32).toString('hex')
  await prisma.pickup.update({ where: { id: pickup.id }, data: { qrTokenHash: crypto.createHash('sha256').update(token).digest('hex'), qrIssuedAt: new Date() } })
  send(res, 200, 'Pickup QR code generated', { token, pickupCode: pickup.pickupCode, expiresIn: 'single-use workflow token' })
}))
app.post('/api/pickups/qr/verify', auth, asyncRoute(async (req, res) => {
  const { token } = z.object({ token: z.string().min(20) }).parse(req.body)
  const pickup = await prisma.pickup.findUnique({ where: { qrTokenHash: crypto.createHash('sha256').update(token).digest('hex') }, include: { customer: { select: { name: true, phone: true } }, collector: { select: { name: true, phone: true } } } })
  if (!pickup) return send(res, 404, 'QR token is invalid or already replaced')
  send(res, 200, 'QR verified', { pickup: { id: pickup.id, pickupCode: pickup.pickupCode, status: pickup.status, customer: pickup.customer, collector: pickup.collector } })
}))

app.get('/api/collector/requests', auth, allow('COLLECTOR'), asyncRoute(async (req, res) => {
  const pickups = await prisma.pickup.findMany({ where: { OR: [{ collectorId: req.user.id }, { status: { in: ['REQUESTED', 'MATCHING'] } }] }, include: { customer: { select: { name: true, phone: true, address: true } }, events: { orderBy: { createdAt: 'desc' }, take: 1 } }, orderBy: { createdAt: 'desc' } })
  send(res, 200, 'Collector requests loaded', { pickups })
}))
app.post('/api/collector/requests/:id/accept', auth, allow('COLLECTOR'), asyncRoute(async (req, res) => {
  const pickup = await prisma.pickup.findUnique({ where: { id: req.params.id } })
  if (!pickup || !['ASSIGNED', 'MATCHING', 'REQUESTED'].includes(pickup.status)) return send(res, 409, 'This request is no longer available')
  if (pickup.collectorId && pickup.collectorId !== req.user.id) return send(res, 409, 'Request is assigned to another collector')
  await prisma.pickup.update({ where: { id: pickup.id }, data: { collectorId: req.user.id, status: 'ACCEPTED' } })
  await prisma.collectorMatch.upsert({ where: { pickupId_collectorId: { pickupId: pickup.id, collectorId: req.user.id } }, update: { status: 'ACCEPTED' }, create: { pickupId: pickup.id, collectorId: req.user.id, score: 0, status: 'ACCEPTED' } })
  await event(pickup.id, 'ACCEPTED', req.user.id, 'Collector accepted the request')
  await notify(pickup.customerId, 'Collector accepted', `A collector accepted ${pickup.pickupCode}.`, pickup.id)
  send(res, 200, 'Request accepted')
}))
app.get('/api/collector/history', auth, allow('COLLECTOR'), asyncRoute(async (req, res) => send(res, 200, 'History loaded', { pickups: await prisma.pickup.findMany({ where: { collectorId: req.user.id, status: { in: ['COLLECTED', 'CANCELLED', 'REJECTED'] } }, orderBy: { updatedAt: 'desc' } }) })))
app.patch('/api/collector/availability', auth, allow('COLLECTOR'), asyncRoute(async (req, res) => {
  const { available } = z.object({ available: z.boolean() }).parse(req.body)
  const user = await prisma.user.update({ where: { id: req.user.id }, data: { available } })
  send(res, 200, 'Availability updated', { available: user.available })
}))

app.post('/api/pickups/:id/review', auth, allow('CUSTOMER'), asyncRoute(async (req, res) => {
  const { rating, comment } = z.object({ rating: z.number().int().min(1).max(5), comment: z.string().max(1000).optional() }).parse(req.body)
  const pickup = await prisma.pickup.findUnique({ where: { id: req.params.id } })
  if (!pickup || pickup.customerId !== req.user.id) return send(res, 404, 'Pickup not found')
  if (pickup.status !== 'COLLECTED' || !pickup.collectorId) return send(res, 409, 'Reviews are available after collection')
  if (await prisma.review.findUnique({ where: { pickupId: pickup.id } })) return send(res, 409, 'This pickup has already been reviewed')
  const review = await prisma.review.create({ data: { pickupId: pickup.id, reviewerId: req.user.id, subjectId: pickup.collectorId, rating, comment } })
  const collector = await prisma.user.findUnique({ where: { id: pickup.collectorId } })
  await prisma.user.update({ where: { id: pickup.collectorId }, data: { totalRatings: { increment: 1 }, rating: ((collector.rating * collector.totalRatings) + rating) / (collector.totalRatings + 1) } })
  send(res, 201, 'Review submitted', { review })
}))
app.get('/api/reviews', auth, asyncRoute(async (req, res) => send(res, 200, 'Reviews loaded', { reviews: await prisma.review.findMany({ where: req.user.role === 'COLLECTOR' ? { subjectId: req.user.id } : { reviewerId: req.user.id }, include: { pickup: { select: { pickupCode: true } }, reviewer: { select: { name: true } }, subject: { select: { name: true } } }, orderBy: { createdAt: 'desc' } }) })))
app.post('/api/complaints', auth, allow('CUSTOMER'), asyncRoute(async (req, res) => {
  const data = z.object({ pickupId: z.string(), subject: z.string().min(3).max(100), description: z.string().min(5).max(2000) }).parse(req.body)
  const pickup = await prisma.pickup.findFirst({ where: { id: data.pickupId, customerId: req.user.id } })
  if (!pickup) return send(res, 404, 'Pickup not found')
  const complaint = await prisma.complaint.create({ data: { ...data, customerId: req.user.id, collectorId: pickup.collectorId } })
  send(res, 201, 'Complaint submitted', { complaint })
}))
app.get('/api/complaints', auth, asyncRoute(async (req, res) => send(res, 200, 'Complaints loaded', { complaints: await prisma.complaint.findMany({ where: req.user.role === 'CUSTOMER' ? { customerId: req.user.id } : { collectorId: req.user.id }, orderBy: { createdAt: 'desc' } }) })))

// Phase 3: collection hubs, batches and end-to-end chain of custody.
const hubWhere = (req) => req.user.role === 'ADMIN' ? {} : { hubId: req.user.id }
const batchInclude = { hub: { select: { id: true, name: true } }, recycler: { select: { id: true, name: true } }, pickups: { include: { pickup: { select: { id: true, pickupCode: true, category: true, actualWeight: true, customerId: true, collectorId: true } } } }, events: { include: { actor: { select: { name: true, role: true } } }, orderBy: { createdAt: 'asc' } }, stages: { orderBy: { createdAt: 'asc' } }, certificate: true }
app.get('/api/hub/dashboard', auth, allow('HUB_MANAGER', 'ADMIN'), asyncRoute(async (req, res) => {
  const where = hubWhere(req)
  const [batches, collected, total] = await Promise.all([
    prisma.batch.findMany({ where, orderBy: { createdAt: 'desc' }, take: 10, include: batchInclude }),
    prisma.pickup.count({ where: { status: 'COLLECTED', batchPickups: { none: {} } } }),
    prisma.batch.aggregate({ where, _sum: { totalWeight: true } })
  ])
  send(res, 200, 'Hub dashboard loaded', { stats: { batches: batches.length, collected, totalWeight: total._sum.totalWeight || 0 }, batches })
}))
app.get('/api/hub/collections', auth, allow('HUB_MANAGER', 'ADMIN'), asyncRoute(async (req, res) => {
  const pickups = await prisma.pickup.findMany({ where: { status: 'COLLECTED', batchPickups: { none: {} } }, include: { customer: { select: { name: true } }, collector: { select: { name: true } } }, orderBy: { updatedAt: 'desc' } })
  send(res, 200, 'Hub collections loaded', { pickups })
}))
app.post('/api/hub/collections/:id/verify', auth, allow('HUB_MANAGER', 'ADMIN'), asyncRoute(async (req, res) => {
  const data = z.object({ actualWeight: z.coerce.number().positive().max(100000), note: z.string().max(500).optional() }).parse(req.body)
  const pickup = await prisma.pickup.findFirst({ where: { id: req.params.id, status: 'COLLECTED', batchPickups: { none: {} } } })
  if (!pickup) return send(res, 404, 'Collected pickup not found')
  const updated = await prisma.pickup.update({ where: { id: pickup.id }, data: { actualWeight: data.actualWeight } })
  await chain({ entityType: 'PICKUP', entityId: pickup.id, pickupId: pickup.id, actorId: req.user.id, fromRole: 'COLLECTOR', toRole: 'HUB_MANAGER', status: 'VERIFIED', note: data.note || `Hub verified ${data.actualWeight} kg` })
  await audit(req.user.id, 'VERIFY_COLLECTION', 'PICKUP', pickup.id, { actualWeight: data.actualWeight })
  send(res, 200, 'Collection verified', { pickup: updated })
}))
app.get('/api/hub/batches', auth, allow('HUB_MANAGER', 'ADMIN'), asyncRoute(async (req, res) => send(res, 200, 'Hub batches loaded', { batches: await prisma.batch.findMany({ where: hubWhere(req), include: batchInclude, orderBy: { createdAt: 'desc' } }) })))
app.get('/api/hub/batches/:id', auth, allow('HUB_MANAGER', 'ADMIN'), asyncRoute(async (req, res) => {
  const batch = await prisma.batch.findFirst({ where: { id: req.params.id, ...hubWhere(req) }, include: batchInclude })
  if (!batch) return send(res, 404, 'Batch not found')
  send(res, 200, 'Hub batch loaded', { batch })
}))
app.get('/api/hub/recyclers', auth, allow('HUB_MANAGER', 'ADMIN'), asyncRoute(async (_req, res) => send(res, 200, 'Recyclers loaded', { users: await prisma.user.findMany({ where: { role: 'RECYCLER', status: 'ACTIVE' }, select: { id: true, name: true, email: true, verified: true, rating: true }, orderBy: { name: 'asc' } }) })))
app.post('/api/hub/batches', auth, allow('HUB_MANAGER', 'ADMIN'), asyncRoute(async (req, res) => {
  const data = z.object({ pickupIds: z.array(z.string()).min(1), recyclerId: z.string().optional(), notes: z.string().max(500).optional() }).parse(req.body)
  const pickups = await prisma.pickup.findMany({ where: { id: { in: data.pickupIds }, status: 'COLLECTED', batchPickups: { none: {} } } })
  if (pickups.length !== data.pickupIds.length) return send(res, 409, 'Every pickup must be collected and not already batched')
  const categories = [...new Set(pickups.map((p) => p.category))]
  const hubId = req.user.role === 'ADMIN' ? req.body.hubId : req.user.id
  if (!hubId || !(await prisma.user.findFirst({ where: { id: hubId, role: 'HUB_MANAGER' } }))) return send(res, 400, 'A valid hubId is required')
  const batch = await prisma.$transaction(async (tx) => {
    const created = await tx.batch.create({ data: { batchCode: await batchCode(), hubId, recyclerId: data.recyclerId, notes: data.notes, totalWeight: pickups.reduce((s, p) => s + (p.actualWeight || p.estimatedWeight || 0), 0), categoriesJson: JSON.stringify(categories) } })
    await tx.batchPickup.createMany({ data: pickups.map((p) => ({ batchId: created.id, pickupId: p.id, weight: p.actualWeight || p.estimatedWeight || 0 })) })
    return created
  })
  await chain({ entityType: 'BATCH', entityId: batch.id, batchId: batch.id, actorId: req.user.id, fromRole: 'HUB_MANAGER', toRole: 'HUB', status: 'CREATED', note: `Batch ${batch.batchCode} created` })
  await audit(req.user.id, 'CREATE_BATCH', 'BATCH', batch.id, { pickupCount: pickups.length })
  send(res, 201, 'Batch created', { batch: await prisma.batch.findUnique({ where: { id: batch.id }, include: batchInclude }) })
}))
app.post('/api/hub/batches/:id/pickups', auth, allow('HUB_MANAGER', 'ADMIN'), asyncRoute(async (req, res) => {
  const { pickupIds } = z.object({ pickupIds: z.array(z.string()).min(1) }).parse(req.body)
  const batch = await prisma.batch.findFirst({ where: { id: req.params.id, ...hubWhere(req) } })
  if (!batch || !['CREATED', 'READY_FOR_RECYCLER'].includes(batch.status)) return send(res, 404, 'Batch not found or locked')
  const pickups = await prisma.pickup.findMany({ where: { id: { in: pickupIds }, status: 'COLLECTED', batchPickups: { none: {} } } })
  if (pickups.length !== pickupIds.length) return send(res, 409, 'Some pickups are unavailable')
  await prisma.batchPickup.createMany({ data: pickups.map((p) => ({ batchId: batch.id, pickupId: p.id, weight: p.actualWeight || p.estimatedWeight || 0 })) })
  const all = await prisma.batchPickup.findMany({ where: { batchId: batch.id }, include: { pickup: true } })
  const updated = await prisma.batch.update({ where: { id: batch.id }, data: { totalWeight: all.reduce((s, p) => s + p.weight, 0), categoriesJson: JSON.stringify([...new Set(all.map((p) => p.pickup.category))]), status: 'READY_FOR_RECYCLER' } })
  await audit(req.user.id, 'ADD_PICKUPS_TO_BATCH', 'BATCH', batch.id, { pickupCount: pickupIds.length })
  send(res, 200, 'Pickups added to batch', { batch: updated })
}))
app.get('/api/hub/inventory', auth, allow('HUB_MANAGER', 'ADMIN'), asyncRoute(async (req, res) => {
  const batches = await prisma.batch.findMany({ where: { ...hubWhere(req), status: { not: 'COMPLETED' } }, include: batchInclude, orderBy: { updatedAt: 'desc' } })
  send(res, 200, 'Hub inventory loaded', { batches })
}))
app.get('/api/hub/analytics', auth, allow('HUB_MANAGER', 'ADMIN'), asyncRoute(async (req, res) => {
  const where = hubWhere(req); const batches = await prisma.batch.findMany({ where, select: { status: true, totalWeight: true, categoriesJson: true, createdAt: true } })
  const category = {}; batches.forEach((b) => JSON.parse(b.categoriesJson || '[]').forEach((c) => { category[c] = (category[c] || 0) + b.totalWeight }))
  send(res, 200, 'Hub analytics loaded', { byStatus: batches.reduce((a, b) => ({ ...a, [b.status]: (a[b.status] || 0) + 1 }), {}), category, totalWeight: batches.reduce((s, b) => s + b.totalWeight, 0), batches })
}))
app.post('/api/hub/batches/:id/qr', auth, allow('HUB_MANAGER', 'ADMIN'), asyncRoute(async (req, res) => {
  const batch = await prisma.batch.findFirst({ where: { id: req.params.id, ...hubWhere(req) } }); if (!batch) return send(res, 404, 'Batch not found')
  const token = crypto.randomBytes(32).toString('hex')
  await prisma.batch.update({ where: { id: batch.id }, data: { qrTokenHash: crypto.createHash('sha256').update(token).digest('hex'), qrIssuedAt: new Date() } })
  await audit(req.user.id, 'GENERATE_BATCH_QR', 'BATCH', batch.id)
  send(res, 200, 'Batch handoff QR generated', { token, batchCode: batch.batchCode, qrDataUrl: await QRCode.toDataURL(`kabadivala://batch/${batch.id}?token=${token}`) })
}))
app.post('/api/hub/batches/qr/verify', auth, allow('HUB_MANAGER', 'RECYCLER', 'ADMIN'), asyncRoute(async (req, res) => {
  const { token } = z.object({ token: z.string().min(20) }).parse(req.body)
  const batch = await prisma.batch.findUnique({ where: { qrTokenHash: crypto.createHash('sha256').update(token).digest('hex') }, include: { hub: { select: { name: true } }, recycler: { select: { name: true } } } })
  if (!batch) return send(res, 404, 'Batch QR token is invalid or replaced')
  send(res, 200, 'Batch handoff QR verified', { batch })
}))
app.post('/api/hub/batches/:id/send', auth, allow('HUB_MANAGER', 'ADMIN'), asyncRoute(async (req, res) => {
  const { recyclerId } = z.object({ recyclerId: z.string() }).parse(req.body)
  const batch = await prisma.batch.findFirst({ where: { id: req.params.id, ...hubWhere(req), status: { in: ['CREATED', 'READY_FOR_RECYCLER'] } } })
  if (!batch) return send(res, 404, 'Batch is not ready to send')
  const recycler = await prisma.user.findFirst({ where: { id: recyclerId, role: 'RECYCLER', status: 'ACTIVE' } }); if (!recycler) return send(res, 404, 'Recycler not found')
  const updated = await prisma.batch.update({ where: { id: batch.id }, data: { recyclerId, status: 'SENT_TO_RECYCLER', sentAt: new Date() } })
  await chain({ entityType: 'BATCH', entityId: batch.id, batchId: batch.id, actorId: req.user.id, fromRole: 'HUB_MANAGER', toRole: 'RECYCLER', status: 'SENT_TO_RECYCLER', note: `Sent to ${recycler.name}` })
  await notify(recycler.id, 'New batch received for review', `${batch.batchCode} is ready for acceptance.`)
  await audit(req.user.id, 'SEND_BATCH_TO_RECYCLER', 'BATCH', batch.id, { recyclerId })
  send(res, 200, 'Batch sent to recycler', { batch: updated })
}))

app.get('/api/recycler/dashboard', auth, allow('RECYCLER', 'ADMIN'), asyncRoute(async (req, res) => {
  const where = req.user.role === 'ADMIN' ? {} : { recyclerId: req.user.id }
  const [batches, total] = await Promise.all([prisma.batch.findMany({ where, include: batchInclude, orderBy: { updatedAt: 'desc' }, take: 10 }), prisma.batch.aggregate({ where, _sum: { totalWeight: true } })])
  send(res, 200, 'Recycler dashboard loaded', { stats: { totalWeight: total._sum.totalWeight || 0, totalBatches: batches.length, processing: batches.filter((b) => b.status === 'PROCESSING').length }, batches })
}))
app.get('/api/recycler/batches', auth, allow('RECYCLER', 'ADMIN'), asyncRoute(async (req, res) => send(res, 200, 'Recycler batches loaded', { batches: await prisma.batch.findMany({ where: req.user.role === 'ADMIN' ? {} : { recyclerId: req.user.id }, include: batchInclude, orderBy: { updatedAt: 'desc' } }) })))
app.get('/api/recycler/batches/:id', auth, allow('RECYCLER', 'ADMIN'), asyncRoute(async (req, res) => {
  const batch = await prisma.batch.findFirst({ where: { id: req.params.id, ...(req.user.role === 'ADMIN' ? {} : { recyclerId: req.user.id }) }, include: batchInclude })
  if (!batch) return send(res, 404, 'Batch not found')
  send(res, 200, 'Batch loaded', { batch })
}))
app.post('/api/recycler/batches/:id/accept', auth, allow('RECYCLER'), asyncRoute(async (req, res) => {
  const batch = await prisma.batch.findFirst({ where: { id: req.params.id, recyclerId: req.user.id, status: 'SENT_TO_RECYCLER' } }); if (!batch) return send(res, 404, 'Batch not available')
  const updated = await prisma.batch.update({ where: { id: batch.id }, data: { status: 'RECEIVED', receivedAt: new Date() } })
  await chain({ entityType: 'BATCH', entityId: batch.id, batchId: batch.id, actorId: req.user.id, fromRole: 'HUB_MANAGER', toRole: 'RECYCLER', status: 'RECEIVED', note: 'Recycler received batch' })
  await audit(req.user.id, 'RECEIVE_BATCH', 'BATCH', batch.id)
  send(res, 200, 'Batch received', { batch: updated })
}))
app.post('/api/recycler/batches/:id/reject', auth, allow('RECYCLER'), asyncRoute(async (req, res) => {
  const { reason } = z.object({ reason: z.string().min(3).max(500) }).parse(req.body)
  const batch = await prisma.batch.findFirst({ where: { id: req.params.id, recyclerId: req.user.id, status: 'SENT_TO_RECYCLER' } }); if (!batch) return send(res, 404, 'Batch not available')
  const updated = await prisma.batch.update({ where: { id: batch.id }, data: { status: 'CREATED', recyclerId: null, notes: reason } })
  await chain({ entityType: 'BATCH', entityId: batch.id, batchId: batch.id, actorId: req.user.id, fromRole: 'RECYCLER', toRole: 'HUB_MANAGER', status: 'REJECTED', note: reason })
  await audit(req.user.id, 'REJECT_BATCH', 'BATCH', batch.id, { reason })
  send(res, 200, 'Batch rejected', { batch: updated })
}))
app.post('/api/recycler/batches/:id/processing', auth, allow('RECYCLER'), asyncRoute(async (req, res) => {
  const data = z.object({ stage: z.string().min(2).max(80), status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']), recoveredMaterial: z.record(z.string(), z.number().nonnegative()).optional(), notes: z.string().max(1000).optional() }).parse(req.body)
  const batch = await prisma.batch.findFirst({ where: { id: req.params.id, recyclerId: req.user.id, status: { in: ['RECEIVED', 'PROCESSING'] } } }); if (!batch) return send(res, 404, 'Batch is not in processing')
  const stage = await prisma.processingStage.upsert({ where: { batchId_stage: { batchId: batch.id, stage: data.stage } }, update: { status: data.status, recoveredMaterialJson: JSON.stringify(data.recoveredMaterial || {}), notes: data.notes, startedAt: data.status === 'IN_PROGRESS' ? new Date() : undefined, completedAt: data.status === 'COMPLETED' ? new Date() : undefined }, create: { batchId: batch.id, stage: data.stage, status: data.status, recoveredMaterialJson: JSON.stringify(data.recoveredMaterial || {}), notes: data.notes, startedAt: data.status === 'IN_PROGRESS' ? new Date() : undefined, completedAt: data.status === 'COMPLETED' ? new Date() : undefined } })
  const updated = await prisma.batch.update({ where: { id: batch.id }, data: { status: 'PROCESSING' } })
  await chain({ entityType: 'BATCH', entityId: batch.id, batchId: batch.id, actorId: req.user.id, fromRole: 'RECYCLER', toRole: 'RECYCLER', status: `PROCESSING_${data.status}`, note: data.stage })
  await audit(req.user.id, 'UPDATE_PROCESSING_STAGE', 'BATCH', batch.id, { stage: data.stage, status: data.status })
  send(res, 200, 'Processing stage updated', { stage, batch: updated })
}))
app.get('/api/recycler/processing', auth, allow('RECYCLER', 'ADMIN'), asyncRoute(async (req, res) => send(res, 200, 'Processing loaded', { batches: await prisma.batch.findMany({ where: { ...(req.user.role === 'ADMIN' ? {} : { recyclerId: req.user.id }), status: 'PROCESSING' }, include: batchInclude }) })))
app.get('/api/recycler/history', auth, allow('RECYCLER', 'ADMIN'), asyncRoute(async (req, res) => send(res, 200, 'Recycler history loaded', { batches: await prisma.batch.findMany({ where: { ...(req.user.role === 'ADMIN' ? {} : { recyclerId: req.user.id }), status: { in: ['RECYCLED', 'COMPLETED'] } }, include: batchInclude, orderBy: { completedAt: 'desc' } }) })))
app.post('/api/recycler/batches/:id/recycle', auth, allow('RECYCLER'), asyncRoute(async (req, res) => {
  const data = z.object({ recoveredMaterial: z.record(z.string(), z.number().nonnegative()).optional() }).parse(req.body)
  const batch = await prisma.batch.findFirst({ where: { id: req.params.id, recyclerId: req.user.id, status: 'PROCESSING' }, include: { pickups: { include: { pickup: { include: { customer: true } } } } } })
  if (!batch) return send(res, 404, 'Batch is not processing')
  const recycled = await prisma.batch.update({ where: { id: batch.id }, data: { status: 'RECYCLED' }, include: { hub: true, recycler: true } })
  await prisma.processingStage.upsert({ where: { batchId_stage: { batchId: batch.id, stage: 'RECYCLED' } }, update: { status: 'COMPLETED', recoveredMaterialJson: JSON.stringify(data.recoveredMaterial || {}), completedAt: new Date() }, create: { batchId: batch.id, stage: 'RECYCLED', status: 'COMPLETED', recoveredMaterialJson: JSON.stringify(data.recoveredMaterial || {}), completedAt: new Date() } })
  await chain({ entityType: 'BATCH', entityId: batch.id, batchId: batch.id, actorId: req.user.id, fromRole: 'RECYCLER', toRole: 'SYSTEM', status: 'RECYCLED', note: 'Material recycled successfully' })
  const customers = [...new Map(batch.pickups.map((p) => [p.pickup.customerId, p.pickup.customer])).values()]
  const certificate = await prisma.recyclingCertificate.create({ data: { certificateNo: await certificateCode(), batchId: batch.id, customerName: customers.map((c) => c.name).join(', '), recyclerName: recycled.recycler?.name || req.user.name, totalWeight: batch.totalWeight, categoriesJson: batch.categoriesJson, recycledAt: new Date() } })
  await prisma.batch.update({ where: { id: batch.id }, data: { status: 'COMPLETED', completedAt: new Date() } })
  await audit(req.user.id, 'COMPLETE_RECYCLING', 'BATCH', batch.id, { certificateId: certificate.id })
  for (const customer of customers) await notify(customer.id, 'Digital recycling certificate ready', `Certificate ${certificate.certificateNo} is ready to download.`)
  send(res, 200, 'Recycling completed', { certificate, batch: recycled })
}))
app.get('/api/recycler/analytics', auth, allow('RECYCLER', 'ADMIN'), asyncRoute(async (req, res) => {
  const batches = await prisma.batch.findMany({ where: req.user.role === 'ADMIN' ? {} : { recyclerId: req.user.id }, select: { status: true, totalWeight: true, categoriesJson: true, createdAt: true } })
  send(res, 200, 'Recycler analytics loaded', { batches, totalWeight: batches.reduce((s, b) => s + b.totalWeight, 0), byStatus: batches.reduce((a, b) => ({ ...a, [b.status]: (a[b.status] || 0) + 1 }), {}) })
}))
app.get('/api/traceability/:entity/:id', auth, asyncRoute(async (req, res) => {
  const events = await prisma.chainOfCustodyEvent.findMany({ where: { entityType: req.params.entity.toUpperCase(), entityId: req.params.id }, include: { actor: { select: { name: true, role: true } } }, orderBy: { createdAt: 'asc' } })
  send(res, 200, 'Traceability timeline loaded', { events })
}))
app.get('/api/certificates', auth, asyncRoute(async (req, res) => {
  if (!['CUSTOMER', 'RECYCLER', 'ADMIN'].includes(req.user.role)) return send(res, 403, 'You do not have permission to access certificates')
  const certificates = await prisma.recyclingCertificate.findMany({ where: req.user.role === 'CUSTOMER' ? { batch: { pickups: { some: { pickup: { customerId: req.user.id } } } } } : req.user.role === 'RECYCLER' ? { batch: { recyclerId: req.user.id } } : {}, include: { batch: { select: { id: true, batchCode: true, totalWeight: true } } }, orderBy: { recycledAt: 'desc' } })
  send(res, 200, 'Certificates loaded', { certificates })
}))
app.get('/api/certificates/:id/download', auth, asyncRoute(async (req, res) => {
  const certificate = await prisma.recyclingCertificate.findUnique({ where: { id: req.params.id }, include: { batch: { include: { pickups: { include: { pickup: { select: { customerId: true } } } } } } } })
  if (!certificate) return send(res, 404, 'Certificate not found')
  const customerOwns = certificate.batch.pickups.some((p) => p.pickup.customerId === req.user.id)
  const recyclerOwns = certificate.batch.recyclerId === req.user.id
  if (req.user.role !== 'ADMIN' && !(req.user.role === 'CUSTOMER' && customerOwns) && !(req.user.role === 'RECYCLER' && recyclerOwns)) return send(res, 403, 'You cannot access this certificate')
  const doc = new PDFDocument({ margin: 50 }); res.setHeader('Content-Type', 'application/pdf'); res.setHeader('Content-Disposition', `attachment; filename="${certificate.certificateNo}.pdf"`); doc.pipe(res)
  doc.fontSize(26).fillColor('#14532d').text('KABADIVALA', { align: 'center' }); doc.moveDown(); doc.fontSize(18).fillColor('#111827').text('Digital Recycling Certificate', { align: 'center' }); doc.moveDown(2)
  doc.fontSize(12).text(`Certificate number: ${certificate.certificateNo}`).moveDown().text(`Batch: ${certificate.batch.batchCode}`).text(`Customer(s): ${certificate.customerName}`).text(`Recycler: ${certificate.recyclerName}`).text(`Total recycled weight: ${certificate.totalWeight.toFixed(2)} kg`).text(`Categories: ${JSON.parse(certificate.categoriesJson || '[]').join(', ')}`).text(`Recycled on: ${new Date(certificate.recycledAt).toLocaleDateString()}`)
  doc.moveDown(3).fillColor('#14532d').text('Thank you for keeping materials in the circular economy.', { align: 'center' }); doc.end()
}))

// Phase 3: admin operations and operational analytics.
app.get('/api/admin/dashboard', auth, allow('ADMIN'), asyncRoute(async (_req, res) => {
  const [users, pickups, batches, complaints] = await Promise.all([prisma.user.count(), prisma.pickup.count(), prisma.batch.count(), prisma.complaint.count({ where: { status: { not: 'CLOSED' } } })])
  send(res, 200, 'Admin dashboard loaded', { stats: { users, pickups, batches, openComplaints: complaints } })
}))
app.get('/api/admin/users', auth, allow('ADMIN'), asyncRoute(async (req, res) => {
  const role = req.query.role ? String(req.query.role) : undefined
  const users = await prisma.user.findMany({ where: { ...(role ? { role } : {}), ...(req.query.search ? { OR: [{ name: { contains: String(req.query.search) } }, { email: { contains: String(req.query.search) } }] } : {}) }, select: { id: true, name: true, email: true, phone: true, role: true, status: true, verified: true, rating: true, createdAt: true }, orderBy: { createdAt: 'desc' } })
  send(res, 200, 'Users loaded', { users })
}))
app.patch('/api/admin/users/:id', auth, allow('ADMIN'), asyncRoute(async (req, res) => {
  const data = z.object({ status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(), verified: z.boolean().optional(), role: z.enum(['ADMIN', 'CUSTOMER', 'COLLECTOR', 'HUB_MANAGER', 'RECYCLER']).optional() }).parse(req.body)
  const user = await prisma.user.update({ where: { id: req.params.id }, data }); await audit(req.user.id, 'UPDATE_USER', 'USER', user.id, data); send(res, 200, 'User updated', { user: publicUser(user) })
}))
const adminRoleList = (role) => asyncRoute(async (_req, res) => send(res, 200, `${role} records loaded`, { users: await prisma.user.findMany({ where: { role }, select: { id: true, name: true, email: true, phone: true, status: true, verified: true, rating: true, serviceArea: true, capacityKg: true }, orderBy: { name: 'asc' } }) }))
app.get('/api/admin/collectors', auth, allow('ADMIN'), adminRoleList('COLLECTOR'))
app.get('/api/admin/recyclers', auth, allow('ADMIN'), adminRoleList('RECYCLER'))
app.get('/api/admin/hubs', auth, allow('ADMIN'), adminRoleList('HUB_MANAGER'))
app.get('/api/admin/pickups', auth, allow('ADMIN'), asyncRoute(async (_req, res) => send(res, 200, 'Pickups loaded', { pickups: await prisma.pickup.findMany({ include: { customer: { select: { name: true } }, collector: { select: { name: true } }, batchPickups: { include: { batch: { select: { batchCode: true, status: true } } } } }, orderBy: { createdAt: 'desc' } }) })))
app.get('/api/admin/batches', auth, allow('ADMIN'), asyncRoute(async (_req, res) => send(res, 200, 'Batches loaded', { batches: await prisma.batch.findMany({ include: batchInclude, orderBy: { createdAt: 'desc' } }) })))
app.get('/api/admin/complaints', auth, allow('ADMIN'), asyncRoute(async (_req, res) => send(res, 200, 'Complaints loaded', { complaints: await prisma.complaint.findMany({ include: { customer: { select: { name: true, email: true } }, collector: { select: { name: true } }, pickup: { select: { pickupCode: true } } }, orderBy: { updatedAt: 'desc' } }) })))
app.patch('/api/admin/complaints/:id', auth, allow('ADMIN'), asyncRoute(async (req, res) => {
  const { status } = z.object({ status: z.enum(['OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED']) }).parse(req.body)
  const complaint = await prisma.complaint.update({ where: { id: req.params.id }, data: { status } }); await audit(req.user.id, 'UPDATE_COMPLAINT', 'COMPLAINT', complaint.id, { status }); send(res, 200, 'Complaint updated', { complaint })
}))
app.get('/api/admin/reviews', auth, allow('ADMIN'), asyncRoute(async (_req, res) => send(res, 200, 'Reviews loaded', { reviews: await prisma.review.findMany({ include: { reviewer: { select: { name: true } }, subject: { select: { name: true } }, pickup: { select: { pickupCode: true } } }, orderBy: { createdAt: 'desc' } }) })))
app.get('/api/admin/notifications', auth, allow('ADMIN'), asyncRoute(async (_req, res) => send(res, 200, 'Notifications loaded', { notifications: await prisma.notification.findMany({ include: { user: { select: { name: true, email: true } } }, orderBy: { createdAt: 'desc' }, take: 200 }) })))
app.get('/api/admin/audit-logs', auth, allow('ADMIN'), asyncRoute(async (_req, res) => send(res, 200, 'Audit logs loaded', { logs: await prisma.auditLog.findMany({ include: { actor: { select: { name: true, role: true } } }, orderBy: { createdAt: 'desc' }, take: 300 }) })))
app.get('/api/admin/analytics', auth, allow('ADMIN'), asyncRoute(async (_req, res) => {
  const [pickups, batches, complaints, collectors, recyclers] = await Promise.all([prisma.pickup.findMany({ select: { status: true, category: true, actualWeight: true, createdAt: true } }), prisma.batch.findMany({ select: { status: true, totalWeight: true, createdAt: true } }), prisma.complaint.findMany({ select: { status: true } }), prisma.user.findMany({ where: { role: { in: ['COLLECTOR', 'RECYCLER'] } }, select: { name: true, role: true, rating: true } }), prisma.user.count({ where: { role: 'RECYCLER' } })])
  send(res, 200, 'Admin analytics loaded', { monthlyCollection: pickups.reduce((a, p) => { const key = new Date(p.createdAt).toISOString().slice(0, 7); a[key] = (a[key] || 0) + (p.actualWeight || 0); return a }, {}), pickupStatus: pickups.reduce((a, p) => ({ ...a, [p.status]: (a[p.status] || 0) + 1 }), {}), recyclingProgress: batches.reduce((a, b) => ({ ...a, [b.status]: (a[b.status] || 0) + b.totalWeight }), {}), complaints: complaints.reduce((a, c) => ({ ...a, [c.status]: (a[c.status] || 0) + 1 }), {}), collectorPerformance: collectors.filter((u) => u.role === 'COLLECTOR'), recyclerPerformance: collectors.filter((u) => u.role === 'RECYCLER'), recyclerCount: recyclers })
}))

// Bulk pickups and campus drives use the same authenticated, persisted workflow.
app.post('/api/bulk-pickups', auth, allow('CUSTOMER', 'ADMIN'), asyncRoute(async (req, res) => {
  const data = z.object({ organization: z.string().min(2).max(160), contactName: z.string().min(2).max(80), contactPhone: z.string().min(7).max(20), address: z.string().min(5).max(500), category: z.string().min(2).max(60), estimatedWeight: z.coerce.number().positive().optional(), scheduledDate: z.coerce.date(), notes: z.string().max(1000).optional() }).parse(req.body)
  const bulk = await prisma.bulkPickup.create({ data: { ...data, customerId: req.user.id, requestCode: `BULK-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}` } }); await audit(req.user.id, 'CREATE_BULK_PICKUP', 'BULK_PICKUP', bulk.id); send(res, 201, 'Bulk pickup requested', { bulkPickup: bulk })
}))
app.get('/api/bulk-pickups', auth, asyncRoute(async (req, res) => {
  const where = req.user.role === 'ADMIN' ? {} : req.user.role === 'COLLECTOR' ? { OR: [{ collectorId: req.user.id }, { collectorId: null }] } : { customerId: req.user.id }
  send(res, 200, 'Bulk pickups loaded', { bulkPickups: await prisma.bulkPickup.findMany({ where, include: { customer: { select: { name: true, email: true } }, collector: { select: { name: true } } }, orderBy: { createdAt: 'desc' } }) })
}))
app.patch('/api/admin/bulk-pickups/:id', auth, allow('ADMIN'), asyncRoute(async (req, res) => {
  const data = z.object({ status: z.string().min(2).max(40), collectorId: z.string().optional().nullable() }).parse(req.body)
  const bulk = await prisma.bulkPickup.update({ where: { id: req.params.id }, data }); await audit(req.user.id, 'MANAGE_BULK_PICKUP', 'BULK_PICKUP', bulk.id, data); send(res, 200, 'Bulk pickup updated', { bulkPickup: bulk })
}))
app.post('/api/campus-drives', auth, allow('ADMIN', 'HUB_MANAGER'), asyncRoute(async (req, res) => {
  const data = z.object({ name: z.string().min(2).max(160), campus: z.string().min(2).max(160), startDate: z.coerce.date(), endDate: z.coerce.date(), targetWeight: z.coerce.number().positive().optional(), departments: z.array(z.string().min(1).max(100)).default([]) }).parse(req.body)
  const drive = await prisma.campusDrive.create({ data: { name: data.name, campus: data.campus, startDate: data.startDate, endDate: data.endDate, targetWeight: data.targetWeight, createdById: req.user.id, departments: { create: data.departments.map((name) => ({ name })) } }, include: { departments: true } }); await audit(req.user.id, 'CREATE_CAMPUS_DRIVE', 'CAMPUS_DRIVE', drive.id); send(res, 201, 'Campus drive created', { drive })
}))
app.get('/api/campus-drives', auth, asyncRoute(async (_req, res) => send(res, 200, 'Campus drives loaded', { drives: await prisma.campusDrive.findMany({ include: { departments: { orderBy: { weight: 'desc' } } }, orderBy: { startDate: 'desc' } }) })))
app.get('/api/campus-drives/:id/leaderboard', auth, asyncRoute(async (req, res) => {
  const drive = await prisma.campusDrive.findUnique({ where: { id: req.params.id }, include: { departments: { orderBy: [{ weight: 'desc' }, { participants: 'desc' }] } } })
  if (!drive) return send(res, 404, 'Campus drive not found')
  const collected = drive.departments.reduce((sum, department) => sum + department.weight, 0)
  send(res, 200, 'Campus leaderboard loaded', { drive: { id: drive.id, name: drive.name, status: drive.status, targetWeight: drive.targetWeight, collectedWeight: collected, progress: drive.targetWeight ? Math.min(100, Math.round(collected / drive.targetWeight * 100)) : 0 }, leaderboard: drive.departments })
}))
app.patch('/api/campus-drives/:id', auth, allow('ADMIN', 'HUB_MANAGER'), asyncRoute(async (req, res) => {
  const { status } = z.object({ status: z.enum(['PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED']) }).parse(req.body)
  const drive = await prisma.campusDrive.update({ where: { id: req.params.id }, data: { status } }); await audit(req.user.id, 'UPDATE_CAMPUS_DRIVE', 'CAMPUS_DRIVE', drive.id, { status }); send(res, 200, 'Campus drive status updated', { drive })
}))
app.patch('/api/campus-drives/:id/departments/:departmentId', auth, allow('ADMIN', 'HUB_MANAGER'), asyncRoute(async (req, res) => {
  const data = z.object({ weight: z.coerce.number().nonnegative(), participants: z.coerce.number().int().nonnegative().optional() }).parse(req.body)
  const department = await prisma.campusDepartment.update({ where: { id: req.params.departmentId }, data }); send(res, 200, 'Campus progress updated', { department })
}))

app.use((error, _req, res, _next) => {
  if (error instanceof z.ZodError) return send(res, 400, 'Please check the submitted fields', { issues: error.issues })
  if (error instanceof multer.MulterError || error.message?.includes('image')) return send(res, 400, 'Only PNG, JPG or WEBP images up to 5MB are allowed')
  console.error(error)
  return send(res, 500, 'Something went wrong on the server')
})

const server = app.listen(PORT, () => console.log(`Kabadivala API running on http://localhost:${PORT}`))
const shutdown = async () => { await prisma.$disconnect(); server.close(() => process.exit(0)) }
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
export { app, prisma, matchPickup }
