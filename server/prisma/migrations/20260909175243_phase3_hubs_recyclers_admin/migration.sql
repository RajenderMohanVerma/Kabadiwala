/*
  Warnings:

  - Added the required column `updatedAt` to the `Complaint` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Batch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "batchCode" TEXT NOT NULL,
    "qrTokenHash" TEXT,
    "qrIssuedAt" DATETIME,
    "hubId" TEXT NOT NULL,
    "recyclerId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "totalWeight" REAL NOT NULL DEFAULT 0,
    "categoriesJson" TEXT NOT NULL DEFAULT '[]',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "receivedAt" DATETIME,
    "sentAt" DATETIME,
    "completedAt" DATETIME,
    CONSTRAINT "Batch_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Batch_recyclerId_fkey" FOREIGN KEY ("recyclerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BatchPickup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "batchId" TEXT NOT NULL,
    "pickupId" TEXT NOT NULL,
    "weight" REAL NOT NULL,
    "addedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BatchPickup_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BatchPickup_pickupId_fkey" FOREIGN KEY ("pickupId") REFERENCES "Pickup" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChainOfCustodyEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChainOfCustodyEvent_pickupId_fkey" FOREIGN KEY ("pickupId") REFERENCES "Pickup" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChainOfCustodyEvent_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChainOfCustodyEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProcessingStage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "batchId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "recoveredMaterialJson" TEXT NOT NULL DEFAULT '{}',
    "notes" TEXT,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProcessingStage_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RecyclingCertificate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "certificateNo" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "recyclerName" TEXT NOT NULL,
    "totalWeight" REAL NOT NULL,
    "categoriesJson" TEXT NOT NULL DEFAULT '[]',
    "recycledAt" DATETIME NOT NULL,
    "filePath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RecyclingCertificate_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "metadataJson" TEXT NOT NULL DEFAULT '{}',
    "ipAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BulkPickup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestCode" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "collectorId" TEXT,
    "organization" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "estimatedWeight" REAL,
    "scheduledDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BulkPickup_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BulkPickup_collectorId_fkey" FOREIGN KEY ("collectorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CampusDrive" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "campus" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "targetWeight" REAL,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CampusDrive_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CampusDepartment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "driveId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "weight" REAL NOT NULL DEFAULT 0,
    "participants" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CampusDepartment_driveId_fkey" FOREIGN KEY ("driveId") REFERENCES "CampusDrive" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Complaint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pickupId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "collectorId" TEXT,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Complaint_pickupId_fkey" FOREIGN KEY ("pickupId") REFERENCES "Pickup" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Complaint_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Complaint_collectorId_fkey" FOREIGN KEY ("collectorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Complaint" ("collectorId", "createdAt", "customerId", "description", "id", "pickupId", "status", "subject") SELECT "collectorId", "createdAt", "customerId", "description", "id", "pickupId", "status", "subject" FROM "Complaint";
DROP TABLE "Complaint";
ALTER TABLE "new_Complaint" RENAME TO "Complaint";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

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
