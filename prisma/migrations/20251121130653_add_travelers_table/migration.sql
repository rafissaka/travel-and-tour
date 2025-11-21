-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "ProcessStatus" AS ENUM ('INQUIRY', 'DOCUMENTS_PENDING', 'DOCUMENTS_RECEIVED', 'DOCUMENTS_VERIFIED', 'PAYMENT_PENDING', 'PAYMENT_PARTIAL', 'PAYMENT_COMPLETE', 'VISA_PROCESSING', 'VISA_APPROVED', 'VISA_REJECTED', 'TRAVEL_ARRANGED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "travelers" (
    "id" TEXT NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "middle_name" VARCHAR(100),
    "surname" VARCHAR(100) NOT NULL,
    "sex" "Sex" NOT NULL,
    "nationality" VARCHAR(100) NOT NULL,
    "date_of_birth" DATE NOT NULL,
    "place_of_birth" VARCHAR(200) NOT NULL,
    "passport_number" VARCHAR(50) NOT NULL,
    "work_title" VARCHAR(200),
    "email" VARCHAR(255),
    "phone" VARCHAR(20),
    "address" TEXT,
    "payment_amount" DECIMAL(10,2),
    "payment_date" TIMESTAMP(3),
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "process_status" "ProcessStatus" NOT NULL DEFAULT 'INQUIRY',
    "notes" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "travelers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "travelers" ADD CONSTRAINT "travelers_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
