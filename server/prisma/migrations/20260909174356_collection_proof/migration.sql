-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Pickup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pickupCode" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "collectorId" TEXT,
    "category" TEXT NOT NULL,
    "itemDetails" TEXT NOT NULL,
    "brand" TEXT,
    "condition" TEXT,
    "quantity" INTEGER NOT NULL,
    "estimatedWeight" REAL,
    "actualWeight" REAL,
    "imagesJson" TEXT NOT NULL DEFAULT '[]',
    "collectionProofJson" TEXT NOT NULL DEFAULT '[]',
    "address" TEXT NOT NULL,
    "latitude" REAL,
    "longitude" REAL,
    "pickupDate" DATETIME NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "qrTokenHash" TEXT,
    "qrIssuedAt" DATETIME,
    "pointsAwarded" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Pickup_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Pickup_collectorId_fkey" FOREIGN KEY ("collectorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Pickup" ("address", "brand", "category", "collectorId", "condition", "createdAt", "customerId", "estimatedWeight", "id", "imagesJson", "itemDetails", "latitude", "longitude", "notes", "pickupCode", "pickupDate", "pointsAwarded", "qrIssuedAt", "qrTokenHash", "quantity", "status", "timeSlot", "updatedAt") SELECT "address", "brand", "category", "collectorId", "condition", "createdAt", "customerId", "estimatedWeight", "id", "imagesJson", "itemDetails", "latitude", "longitude", "notes", "pickupCode", "pickupDate", "pointsAwarded", "qrIssuedAt", "qrTokenHash", "quantity", "status", "timeSlot", "updatedAt" FROM "Pickup";
DROP TABLE "Pickup";
ALTER TABLE "new_Pickup" RENAME TO "Pickup";
CREATE UNIQUE INDEX "Pickup_pickupCode_key" ON "Pickup"("pickupCode");
CREATE UNIQUE INDEX "Pickup_qrTokenHash_key" ON "Pickup"("qrTokenHash");
CREATE INDEX "Pickup_customerId_status_idx" ON "Pickup"("customerId", "status");
CREATE INDEX "Pickup_collectorId_status_idx" ON "Pickup"("collectorId", "status");
CREATE INDEX "Pickup_pickupDate_idx" ON "Pickup"("pickupDate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
