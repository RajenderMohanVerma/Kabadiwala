import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const accounts = [
  ['Admin Demo', 'admin@kabadivala.demo', 'ADMIN'],
  ['Customer Demo', 'customer@kabadivala.demo', 'CUSTOMER'],
  ['Collector Demo', 'collector@kabadivala.demo', 'COLLECTOR'],
  ['Hub Manager Demo', 'hub@kabadivala.demo', 'HUB_MANAGER'],
  ['Recycler Demo', 'recycler@kabadivala.demo', 'RECYCLER']
]

for (const [name, email, role] of accounts) {
  await prisma.user.upsert({
    where: { email },
    update: { name, role, status: 'ACTIVE', verified: true, ...(role === 'COLLECTOR' ? { available: true, serviceArea: 'Delhi', supportedCategories: 'metal,paper,plastic,e-waste', capacityKg: 500 } : {}), ...(role === 'HUB_MANAGER' ? { address: 'Okhla Collection Hub, Delhi', serviceArea: 'South Delhi' } : {}), ...(role === 'RECYCLER' ? { address: 'GreenLoop Recycling Facility, Delhi', supportedCategories: 'metal,plastic,e-waste' } : {}) },
    create: { name, email, role, verified: true, ...(role === 'COLLECTOR' ? { available: true, serviceArea: 'Delhi', supportedCategories: 'metal,paper,plastic,e-waste', capacityKg: 500 } : {}), ...(role === 'HUB_MANAGER' ? { address: 'Okhla Collection Hub, Delhi', serviceArea: 'South Delhi' } : {}), ...(role === 'RECYCLER' ? { address: 'GreenLoop Recycling Facility, Delhi', supportedCategories: 'metal,plastic,e-waste' } : {}), passwordHash: await bcrypt.hash('Demo@12345', 12) }
  })
}
const customer = await prisma.user.findUniqueOrThrow({ where: { email: 'customer@kabadivala.demo' } })
const collector = await prisma.user.findUniqueOrThrow({ where: { email: 'collector@kabadivala.demo' } })
const hub = await prisma.user.findUniqueOrThrow({ where: { email: 'hub@kabadivala.demo' } })
const recycler = await prisma.user.findUniqueOrThrow({ where: { email: 'recycler@kabadivala.demo' } })
let pickup = await prisma.pickup.findUnique({ where: { pickupCode: 'KC-2026-000001' } })
if (!pickup) {
  pickup = await prisma.pickup.create({ data: { pickupCode: 'KC-2026-000001', customerId: customer.id, collectorId: collector.id, category: 'e-waste', itemDetails: 'Laptop and charger', quantity: 2, estimatedWeight: 7.5, actualWeight: 7.2, address: 'Green Park, Delhi', pickupDate: new Date('2026-09-01'), timeSlot: '10:00-12:00', status: 'COLLECTED' } })
  await prisma.pickupStatusEvent.create({ data: { pickupId: pickup.id, actorId: collector.id, status: 'COLLECTED', note: 'Seeded verified collection' } })
}
let batch = await prisma.batch.findUnique({ where: { batchCode: 'B-2026-000001' } })
if (!batch) {
  batch = await prisma.batch.create({ data: { batchCode: 'B-2026-000001', hubId: hub.id, recyclerId: recycler.id, status: 'COMPLETED', totalWeight: pickup.actualWeight || 7.2, categoriesJson: JSON.stringify(['e-waste']), receivedAt: new Date('2026-09-03'), sentAt: new Date('2026-09-04'), completedAt: new Date('2026-09-08') } })
  await prisma.batchPickup.create({ data: { batchId: batch.id, pickupId: pickup.id, weight: pickup.actualWeight || 7.2 } })
  await prisma.chainOfCustodyEvent.createMany({ data: [{ entityType: 'BATCH', entityId: batch.id, batchId: batch.id, actorId: hub.id, fromRole: 'HUB_MANAGER', toRole: 'RECYCLER', status: 'SENT_TO_RECYCLER', note: 'Seeded hub handoff' }, { entityType: 'BATCH', entityId: batch.id, batchId: batch.id, actorId: recycler.id, fromRole: 'RECYCLER', toRole: 'SYSTEM', status: 'RECYCLED', note: 'Seeded recycling completion' }] })
  await prisma.processingStage.create({ data: { batchId: batch.id, stage: 'Material recovery', status: 'COMPLETED', recoveredMaterialJson: JSON.stringify({ copper: 2.1, aluminium: 1.4 }), completedAt: new Date('2026-09-08') } })
  await prisma.recyclingCertificate.create({ data: { certificateNo: 'KDC-2026-DEMO01', batchId: batch.id, customerName: customer.name, recyclerName: recycler.name, totalWeight: pickup.actualWeight || 7.2, categoriesJson: JSON.stringify(['e-waste']), recycledAt: new Date('2026-09-08') } })
}
console.log(`Seeded ${accounts.length} demo users (password: Demo@12345)`)
await prisma.$disconnect()
