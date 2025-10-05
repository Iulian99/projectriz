-- AlterTable
ALTER TABLE "users" ADD COLUMN "backgroundColor" TEXT DEFAULT '#f9fafb';
ALTER TABLE "users" ADD COLUMN "resetToken" TEXT;
ALTER TABLE "users" ADD COLUMN "resetTokenExpiry" DATETIME;
