-- Sprint 5: Inventaris/Sarpras

CREATE TABLE "asset_categories" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "asset_categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "asset_locations" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "room_id" BIGINT,
    "building" TEXT,
    "floor" TEXT,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "asset_locations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "assets" (
    "id" TEXT NOT NULL,
    "asset_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category_id" TEXT,
    "location_id" TEXT,
    "room_id" BIGINT,
    "responsible_staff_id" TEXT,
    "brand" TEXT,
    "model" TEXT,
    "serial_number" TEXT,
    "purchase_date" DATE,
    "purchase_price" DECIMAL(14,2),
    "source" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "condition" TEXT NOT NULL DEFAULT 'GOOD',
    "qr_code" TEXT,
    "image_url" TEXT,
    "notes" TEXT,
    "created_by" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "asset_location_histories" (
    "id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "from_location_id" TEXT,
    "to_location_id" TEXT,
    "from_room_id" BIGINT,
    "to_room_id" BIGINT,
    "moved_by" TEXT,
    "moved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "asset_location_histories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "asset_condition_histories" (
    "id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "status" TEXT,
    "checked_by" TEXT,
    "checked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "photo_url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "asset_condition_histories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "asset_loans" (
    "id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "room_id" BIGINT,
    "borrower_name" TEXT NOT NULL,
    "borrower_type" TEXT NOT NULL DEFAULT 'STAFF',
    "requester_id" TEXT,
    "approved_by" TEXT,
    "purpose" TEXT NOT NULL,
    "start_at" TIMESTAMP(3) NOT NULL,
    "due_at" TIMESTAMP(3) NOT NULL,
    "returned_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "condition_out" TEXT,
    "condition_in" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "asset_loans_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "asset_maintenances" (
    "id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "technician_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "cost" DECIMAL(14,2),
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "result_note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "asset_maintenances_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "asset_categories_code_key" ON "asset_categories"("code");
CREATE UNIQUE INDEX "asset_locations_code_key" ON "asset_locations"("code");
CREATE UNIQUE INDEX "assets_asset_code_key" ON "assets"("asset_code");

CREATE INDEX "asset_locations_room_id_idx" ON "asset_locations"("room_id");
CREATE INDEX "assets_category_id_idx" ON "assets"("category_id");
CREATE INDEX "assets_location_id_idx" ON "assets"("location_id");
CREATE INDEX "assets_room_id_idx" ON "assets"("room_id");
CREATE INDEX "assets_status_condition_idx" ON "assets"("status", "condition");
CREATE INDEX "asset_location_histories_asset_id_moved_at_idx" ON "asset_location_histories"("asset_id", "moved_at");
CREATE INDEX "asset_location_histories_to_location_id_idx" ON "asset_location_histories"("to_location_id");
CREATE INDEX "asset_location_histories_to_room_id_idx" ON "asset_location_histories"("to_room_id");
CREATE INDEX "asset_condition_histories_asset_id_checked_at_idx" ON "asset_condition_histories"("asset_id", "checked_at");
CREATE INDEX "asset_condition_histories_condition_idx" ON "asset_condition_histories"("condition");
CREATE INDEX "asset_loans_asset_id_status_idx" ON "asset_loans"("asset_id", "status");
CREATE INDEX "asset_loans_room_id_status_idx" ON "asset_loans"("room_id", "status");
CREATE INDEX "asset_loans_start_at_due_at_idx" ON "asset_loans"("start_at", "due_at");
CREATE INDEX "asset_maintenances_asset_id_scheduled_at_idx" ON "asset_maintenances"("asset_id", "scheduled_at");
CREATE INDEX "asset_maintenances_status_scheduled_at_idx" ON "asset_maintenances"("status", "scheduled_at");

ALTER TABLE "asset_locations" ADD CONSTRAINT "asset_locations_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "assets" ADD CONSTRAINT "assets_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "asset_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "assets" ADD CONSTRAINT "assets_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "asset_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "assets" ADD CONSTRAINT "assets_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "assets" ADD CONSTRAINT "assets_responsible_staff_id_fkey" FOREIGN KEY ("responsible_staff_id") REFERENCES "gtk"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "asset_location_histories" ADD CONSTRAINT "asset_location_histories_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "asset_location_histories" ADD CONSTRAINT "asset_location_histories_from_location_id_fkey" FOREIGN KEY ("from_location_id") REFERENCES "asset_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "asset_location_histories" ADD CONSTRAINT "asset_location_histories_to_location_id_fkey" FOREIGN KEY ("to_location_id") REFERENCES "asset_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "asset_location_histories" ADD CONSTRAINT "asset_location_histories_from_room_id_fkey" FOREIGN KEY ("from_room_id") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "asset_location_histories" ADD CONSTRAINT "asset_location_histories_to_room_id_fkey" FOREIGN KEY ("to_room_id") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "asset_location_histories" ADD CONSTRAINT "asset_location_histories_moved_by_fkey" FOREIGN KEY ("moved_by") REFERENCES "gtk"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "asset_condition_histories" ADD CONSTRAINT "asset_condition_histories_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "asset_condition_histories" ADD CONSTRAINT "asset_condition_histories_checked_by_fkey" FOREIGN KEY ("checked_by") REFERENCES "gtk"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "asset_loans" ADD CONSTRAINT "asset_loans_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "asset_loans" ADD CONSTRAINT "asset_loans_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "asset_loans" ADD CONSTRAINT "asset_loans_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "gtk"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "asset_loans" ADD CONSTRAINT "asset_loans_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "gtk"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "asset_maintenances" ADD CONSTRAINT "asset_maintenances_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "asset_maintenances" ADD CONSTRAINT "asset_maintenances_technician_id_fkey" FOREIGN KEY ("technician_id") REFERENCES "gtk"("id") ON DELETE SET NULL ON UPDATE CASCADE;
