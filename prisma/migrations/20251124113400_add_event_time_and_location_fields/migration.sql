-- AlterTable
ALTER TABLE "events" ADD COLUMN     "end_time" VARCHAR(20),
ADD COLUMN     "location_lat" DOUBLE PRECISION,
ADD COLUMN     "location_lng" DOUBLE PRECISION,
ADD COLUMN     "start_time" VARCHAR(20);
