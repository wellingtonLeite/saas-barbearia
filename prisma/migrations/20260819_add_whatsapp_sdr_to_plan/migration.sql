-- AlterTable: add has_whatsapp_sdr column to Plan table
ALTER TABLE "Plan" ADD COLUMN "has_whatsapp_sdr" BOOLEAN NOT NULL DEFAULT false;
