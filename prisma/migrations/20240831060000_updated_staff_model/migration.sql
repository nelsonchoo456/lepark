/*
  Warnings:

  - You are about to drop the column `passwordHash` on the `Staff` table. All the data in the column will be lost.
  - You are about to drop the column `salt` on the `Staff` table. All the data in the column will be lost.
  - Added the required column `password` to the `Staff` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Staff" DROP COLUMN "passwordHash",
DROP COLUMN "salt",
ADD COLUMN     "password" TEXT NOT NULL;
