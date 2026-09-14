-- CreateTable
CREATE TABLE "SubscriptionPrice" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SubscriptionPrice_subscriptionId_effectiveFrom_idx" ON "SubscriptionPrice"("subscriptionId", "effectiveFrom");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPrice_subscriptionId_effectiveFrom_key" ON "SubscriptionPrice"("subscriptionId", "effectiveFrom");

-- AddForeignKey
ALTER TABLE "SubscriptionPrice" ADD CONSTRAINT "SubscriptionPrice_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "CustomerSubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
