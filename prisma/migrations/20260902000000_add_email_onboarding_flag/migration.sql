-- AlterTable
ALTER TABLE "user" ADD COLUMN     "onboardingEmailSentAt" TIMESTAMP(3);

-- Grandfather existing accounts. Email OTP verification is introduced with
-- this migration; users who signed up before it must not be locked out.
UPDATE "user" SET "emailVerified" = true WHERE "emailVerified" = false;

-- Existing accounts are already onboarded, so mark the welcome email as sent
-- to avoid blasting the whole user base on their next sign-in.
UPDATE "user" SET "onboardingEmailSentAt" = NOW() WHERE "onboardingEmailSentAt" IS NULL;
