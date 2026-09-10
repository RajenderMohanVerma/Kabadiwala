-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'CUSTOMER', 'COLLECTOR', 'HUB_MANAGER', 'RECYCLER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "PickupStatus" AS ENUM ('REQUESTED', 'MATCHING', 'ASSIGNED', 'ACCEPTED', 'COLLECTOR_ON_THE_WAY', 'ARRIVED', 'COLLECTED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('PROPOSED', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('CREATED', 'READY_FOR_RECYCLER', 'SENT_TO_RECYCLER', 'RECEIVED', 'PROCESSING', 'RECYCLED', 'COMPLETED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "address" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "serviceArea" TEXT,
    "supportedCategories" TEXT,
    "capacityKg" DOUBLE PRECISION,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "totalRatings" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pickup" (
    "id" TEXT NOT NULL,
    "pickupCode" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "collectorId" TEXT,
    "category" TEXT NOT NULL,
    "itemDetails" TEXT NOT NULL,
    "brand" TEXT,
    "condition" TEXT,
    "quantity" INTEGER NOT NULL,
    "estimatedWeight" DOUBLE PRECISION,
    "actualWeight" DOUBLE PRECISION,
    "imagesJson" TEXT NOT NULL DEFAULT '[]',
    "collectionProofJson" TEXT NOT NULL DEFAULT '[]',
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "pickupDate" TIMESTAMP(3) NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "notes" TEXT,
    "status" "PickupStatus" NOT NULL DEFAULT 'REQUESTED',
    "qrTokenHash" TEXT,
    "qrIssuedAt" TIMESTAMP(3),
    "pointsAwarded" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pickup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PickupStatusEvent" (
    "id" TEXT NOT NULL,
    "pickupId" TEXT NOT NULL,
    "actorId" TEXT,
    "status" "PickupStatus" NOT NULL,
    "note" TEXT,
    "location" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PickupStatusEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollectorMatch" (
    "id" TEXT NOT NULL,
    "pickupId" TEXT NOT NULL,
    "collectorId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "reasons" TEXT NOT NULL DEFAULT '[]',
    "status" "MatchStatus" NOT NULL DEFAULT 'PROPOSED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CollectorMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "pickupId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PointTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pickupId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PointTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pickupId" TEXT,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Complaint" (
    "id" TEXT NOT NULL,
    "pickupId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "collectorId" TEXT,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Complaint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Batch" (
    "id" TEXT NOT NULL,
    "batchCode" TEXT NOT NULL,
    "qrTokenHash" TEXT,
    "qrIssuedAt" TIMESTAMP(3),
    "hubId" TEXT NOT NULL,
    "recyclerId" TEXT,
    "status" "BatchStatus" NOT NULL DEFAULT 'CREATED',
    "totalWeight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "categoriesJson" TEXT NOT NULL DEFAULT '[]',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "receivedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BatchPickup" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "pickupId" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BatchPickup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChainOfCustodyEvent" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "pickupId" TEXT,
    "batchId" TEXT,
    "actorId" TEXT,
    "fromRole" TEXT,
    "toRole" TEXT,
    "status" TEXT NOT NULL,
    "note" TEXT,
    "metadataJson" TEXT NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChainOfCustodyEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessingStage" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "recoveredMaterialJson" TEXT NOT NULL DEFAULT '{}',
    "notes" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessingStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecyclingCertificate" (
    "id" TEXT NOT NULL,
    "certificateNo" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "recyclerName" TEXT NOT NULL,
    "totalWeight" DOUBLE PRECISION NOT NULL,
    "categoriesJson" TEXT NOT NULL DEFAULT '[]',
    "recycledAt" TIMESTAMP(3) NOT NULL,
    "filePath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecyclingCertificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "metadataJson" TEXT NOT NULL DEFAULT '{}',
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BulkPickup" (
    "id" TEXT NOT NULL,
    "requestCode" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "collectorId" TEXT,
    "organization" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "estimatedWeight" DOUBLE PRECISION,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BulkPickup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampusDrive" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "campus" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "targetWeight" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampusDrive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampusDepartment" (
    "id" TEXT NOT NULL,
    "driveId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "participants" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampusDepartment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_available_idx" ON "User"("role", "available");

-- CreateIndex
CREATE UNIQUE INDEX "Pickup_pickupCode_key" ON "Pickup"("pickupCode");

-- CreateIndex
CREATE UNIQUE INDEX "Pickup_qrTokenHash_key" ON "Pickup"("qrTokenHash");

-- CreateIndex
CREATE INDEX "Pickup_customerId_status_idx" ON "Pickup"("customerId", "status");

-- CreateIndex
CREATE INDEX "Pickup_collectorId_status_idx" ON "Pickup"("collectorId", "status");

-- CreateIndex
CREATE INDEX "Pickup_pickupDate_idx" ON "Pickup"("pickupDate");

-- CreateIndex
CREATE INDEX "PickupStatusEvent_pickupId_createdAt_idx" ON "PickupStatusEvent"("pickupId", "createdAt");

-- CreateIndex
CREATE INDEX "CollectorMatch_collectorId_status_idx" ON "CollectorMatch"("collectorId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CollectorMatch_pickupId_collectorId_key" ON "CollectorMatch"("pickupId", "collectorId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_pickupId_key" ON "Review"("pickupId");

-- CreateIndex
CREATE UNIQUE INDEX "PointTransaction_pickupId_key" ON "PointTransaction"("pickupId");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");

-- CreateIndex
CREATE UNIQUE INDEX "Batch_batchCode_key" ON "Batch"("batchCode");

-- CreateIndex
CREATE UNIQUE INDEX "Batch_qrTokenHash_key" ON "Batch"("qrTokenHash");

-- CreateIndex
CREATE INDEX "Batch_hubId_status_idx" ON "Batch"("hubId", "status");

-- CreateIndex
CREATE INDEX "Batch_recyclerId_status_idx" ON "Batch"("recyclerId", "status");

-- CreateIndex
CREATE INDEX "BatchPickup_pickupId_idx" ON "BatchPickup"("pickupId");

-- CreateIndex
CREATE UNIQUE INDEX "BatchPickup_batchId_pickupId_key" ON "BatchPickup"("batchId", "pickupId");

-- CreateIndex
CREATE INDEX "ChainOfCustodyEvent_entityType_entityId_createdAt_idx" ON "ChainOfCustodyEvent"("entityType", "entityId", "createdAt");

-- CreateIndex
CREATE INDEX "ChainOfCustodyEvent_pickupId_createdAt_idx" ON "ChainOfCustodyEvent"("pickupId", "createdAt");

-- CreateIndex
CREATE INDEX "ChainOfCustodyEvent_batchId_createdAt_idx" ON "ChainOfCustodyEvent"("batchId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessingStage_batchId_stage_key" ON "ProcessingStage"("batchId", "stage");

-- CreateIndex
CREATE UNIQUE INDEX "RecyclingCertificate_certificateNo_key" ON "RecyclingCertificate"("certificateNo");

-- CreateIndex
CREATE UNIQUE INDEX "RecyclingCertificate_batchId_key" ON "RecyclingCertificate"("batchId");

-- CreateIndex
CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "BulkPickup_requestCode_key" ON "BulkPickup"("requestCode");

-- CreateIndex
CREATE INDEX "BulkPickup_customerId_status_idx" ON "BulkPickup"("customerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CampusDepartment_driveId_name_key" ON "CampusDepartment"("driveId", "name");

-- AddForeignKey
ALTER TABLE "Pickup" ADD CONSTRAINT "Pickup_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pickup" ADD CONSTRAINT "Pickup_collectorId_fkey" FOREIGN KEY ("collectorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickupStatusEvent" ADD CONSTRAINT "PickupStatusEvent_pickupId_fkey" FOREIGN KEY ("pickupId") REFERENCES "Pickup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickupStatusEvent" ADD CONSTRAINT "PickupStatusEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectorMatch" ADD CONSTRAINT "CollectorMatch_pickupId_fkey" FOREIGN KEY ("pickupId") REFERENCES "Pickup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectorMatch" ADD CONSTRAINT "CollectorMatch_collectorId_fkey" FOREIGN KEY ("collectorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_pickupId_fkey" FOREIGN KEY ("pickupId") REFERENCES "Pickup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointTransaction" ADD CONSTRAINT "PointTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointTransaction" ADD CONSTRAINT "PointTransaction_pickupId_fkey" FOREIGN KEY ("pickupId") REFERENCES "Pickup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_pickupId_fkey" FOREIGN KEY ("pickupId") REFERENCES "Pickup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_pickupId_fkey" FOREIGN KEY ("pickupId") REFERENCES "Pickup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_collectorId_fkey" FOREIGN KEY ("collectorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_recyclerId_fkey" FOREIGN KEY ("recyclerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchPickup" ADD CONSTRAINT "BatchPickup_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchPickup" ADD CONSTRAINT "BatchPickup_pickupId_fkey" FOREIGN KEY ("pickupId") REFERENCES "Pickup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChainOfCustodyEvent" ADD CONSTRAINT "ChainOfCustodyEvent_pickupId_fkey" FOREIGN KEY ("pickupId") REFERENCES "Pickup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChainOfCustodyEvent" ADD CONSTRAINT "ChainOfCustodyEvent_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChainOfCustodyEvent" ADD CONSTRAINT "ChainOfCustodyEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessingStage" ADD CONSTRAINT "ProcessingStage_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecyclingCertificate" ADD CONSTRAINT "RecyclingCertificate_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkPickup" ADD CONSTRAINT "BulkPickup_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkPickup" ADD CONSTRAINT "BulkPickup_collectorId_fkey" FOREIGN KEY ("collectorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampusDrive" ADD CONSTRAINT "CampusDrive_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampusDepartment" ADD CONSTRAINT "CampusDepartment_driveId_fkey" FOREIGN KEY ("driveId") REFERENCES "CampusDrive"("id") ON DELETE CASCADE ON UPDATE CASCADE;

