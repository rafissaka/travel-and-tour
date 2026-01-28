-- Drop and recreate ReservationStatus enum
DROP TYPE IF EXISTS "ReservationStatus" CASCADE;
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING_QUOTE', 'QUOTE_SENT', 'QUOTE_APPROVED', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- Create FlightReservation table
CREATE TABLE IF NOT EXISTS "flight_reservations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    
    -- Flight Details
    "origin" VARCHAR(10) NOT NULL,
    "destination" VARCHAR(10) NOT NULL,
    "departure_date" TIMESTAMP(3) NOT NULL,
    "return_date" TIMESTAMP(3),
    "adults" INTEGER NOT NULL DEFAULT 1,
    "children" INTEGER NOT NULL DEFAULT 0,
    "infants" INTEGER NOT NULL DEFAULT 0,
    "cabin" VARCHAR(20) NOT NULL,
    
    -- Selected Flight Info
    "airline" VARCHAR(200),
    "flight_number" VARCHAR(50),
    "departure_time" VARCHAR(20),
    "arrival_time" VARCHAR(20),
    "duration" VARCHAR(50),
    "stops" INTEGER,
    "flight_details" JSONB,
    
    -- Pricing
    "base_price_usd" DECIMAL(10,2),
    "base_price_ghs" DECIMAL(10,2),
    "service_fee" DECIMAL(10,2),
    "total_amount" DECIMAL(10,2),
    "exchange_rate" DECIMAL(10,4),
    
    -- Quote System
    "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING_QUOTE',
    "quote_notes" TEXT,
    "admin_notes" TEXT,
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    
    -- Payment
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "payment_reference" VARCHAR(200),
    "paid_at" TIMESTAMP(3),
    
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "flight_reservations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create HotelReservation table
CREATE TABLE IF NOT EXISTS "hotel_reservations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    
    -- Hotel Search
    "city" VARCHAR(200) NOT NULL,
    "country" VARCHAR(100),
    "check_in_date" TIMESTAMP(3) NOT NULL,
    "check_out_date" TIMESTAMP(3) NOT NULL,
    "adults" INTEGER NOT NULL DEFAULT 1,
    "children" INTEGER NOT NULL DEFAULT 0,
    "rooms" INTEGER NOT NULL DEFAULT 1,
    
    -- Selected Hotel Info
    "hotel_name" VARCHAR(300),
    "hotel_address" TEXT,
    "room_type" VARCHAR(200),
    "amenities" JSONB,
    "star_rating" INTEGER,
    "hotel_details" JSONB,
    
    -- Pricing
    "base_price_usd" DECIMAL(10,2),
    "base_price_ghs" DECIMAL(10,2),
    "service_fee" DECIMAL(10,2),
    "total_amount" DECIMAL(10,2),
    "exchange_rate" DECIMAL(10,4),
    "nights" INTEGER,
    
    -- Quote System
    "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING_QUOTE',
    "quote_notes" TEXT,
    "admin_notes" TEXT,
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    
    -- Payment
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "payment_reference" VARCHAR(200),
    "paid_at" TIMESTAMP(3),
    
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "hotel_reservations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create PackageReservation table
CREATE TABLE IF NOT EXISTS "package_reservations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "flight_reservation_id" TEXT NOT NULL,
    "hotel_reservation_id" TEXT NOT NULL,
    
    -- Package Discount
    "package_discount" DECIMAL(10,2),
    "discount_percent" DECIMAL(5,2),
    
    -- Pricing
    "total_amount" DECIMAL(10,2),
    
    -- Quote System
    "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING_QUOTE',
    "admin_notes" TEXT,
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    
    -- Payment
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "payment_reference" VARCHAR(200),
    "paid_at" TIMESTAMP(3),
    
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "package_reservations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "package_reservations_flight_reservation_id_fkey" FOREIGN KEY ("flight_reservation_id") REFERENCES "flight_reservations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "package_reservations_hotel_reservation_id_fkey" FOREIGN KEY ("hotel_reservation_id") REFERENCES "hotel_reservations"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "flight_reservations_user_id_idx" ON "flight_reservations"("user_id");
CREATE INDEX IF NOT EXISTS "flight_reservations_status_idx" ON "flight_reservations"("status");
CREATE INDEX IF NOT EXISTS "flight_reservations_created_at_idx" ON "flight_reservations"("created_at");

CREATE INDEX IF NOT EXISTS "hotel_reservations_user_id_idx" ON "hotel_reservations"("user_id");
CREATE INDEX IF NOT EXISTS "hotel_reservations_status_idx" ON "hotel_reservations"("status");
CREATE INDEX IF NOT EXISTS "hotel_reservations_created_at_idx" ON "hotel_reservations"("created_at");

CREATE INDEX IF NOT EXISTS "package_reservations_user_id_idx" ON "package_reservations"("user_id");
CREATE INDEX IF NOT EXISTS "package_reservations_status_idx" ON "package_reservations"("status");

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at on all reservation tables
DROP TRIGGER IF EXISTS update_flight_reservations_updated_at ON flight_reservations;
CREATE TRIGGER update_flight_reservations_updated_at 
    BEFORE UPDATE ON flight_reservations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_hotel_reservations_updated_at ON hotel_reservations;
CREATE TRIGGER update_hotel_reservations_updated_at 
    BEFORE UPDATE ON hotel_reservations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_package_reservations_updated_at ON package_reservations;
CREATE TRIGGER update_package_reservations_updated_at 
    BEFORE UPDATE ON package_reservations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
