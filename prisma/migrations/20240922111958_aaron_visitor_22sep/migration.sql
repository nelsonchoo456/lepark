-- AlterTable
ALTER TABLE "Visitor" ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenUsed" BOOLEAN NOT NULL DEFAULT false;
