-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('SIGNUP', 'LOGIN', 'CHANGE_PHONE');

-- CreateTable
CREATE TABLE "OtpVerification" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "purpose" "OtpPurpose" NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OtpVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OtpVerification_phone_code_idx" ON "OtpVerification"("phone", "code");

-- CreateIndex
CREATE UNIQUE INDEX "OtpVerification_phone_code_key" ON "OtpVerification"("phone", "code");
