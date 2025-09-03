-- CreateEnum
CREATE TYPE "public"."claimcommunication_type" AS ENUM ('EMAIL', 'PHONE', 'SMS', 'WHATSAPP', 'INTERNAL_NOTE');

-- CreateEnum
CREATE TYPE "public"."claimcommunication_direction" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "public"."whatsappconnectionstatus_status" AS ENUM ('DISCONNECTED', 'CONNECTING', 'CONNECTED', 'ERROR');

-- CreateEnum
CREATE TYPE "public"."document_category" AS ENUM ('IDENTIFICATION', 'CONTRACT', 'POLICY', 'PROPOSAL', 'PHOTO', 'FINANCIAL', 'LEGAL', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."whatsappqrcodehistory_action" AS ENUM ('GENERATED', 'VIEWED', 'DOWNLOADED', 'EXPIRED', 'USED', 'REGENERATED', 'DELETED', 'ACCESSED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."whatsappqrcode_status" AS ENUM ('ACTIVE', 'EXPIRED', 'USED');

-- CreateEnum
CREATE TYPE "public"."whatsappqrcodehistory_status" AS ENUM ('ACTIVE', 'EXPIRED', 'USED');

-- CreateEnum
CREATE TYPE "public"."whatsappmessage_messageType" AS ENUM ('TEXT', 'IMAGE', 'DOCUMENT', 'AUDIO', 'VIDEO', 'LOCATION');

-- CreateEnum
CREATE TYPE "public"."whatsappmessage_direction" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "public"."claim_status" AS ENUM ('REPORTED', 'UNDER_REVIEW', 'INVESTIGATING', 'APPROVED', 'REJECTED', 'SETTLED', 'CLOSED');

-- CreateEnum
CREATE TYPE "public"."whatsappmessage_status" AS ENUM ('SENT', 'DELIVERED', 'READ', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."claim_priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateTable
CREATE TABLE "public"."veiculofipe" (
    "id" TEXT NOT NULL,
    "cod_fipe" TEXT NOT NULL,
    "num_passageiros" INTEGER,
    "cod_marca" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "cod_modelo" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "cod_categoria_suhai" TEXT NOT NULL,
    "categoria_suhai" TEXT NOT NULL,
    "cod_categoria_tarifaria" TEXT,
    "valorFipe" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "veiculofipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."activity" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."address" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "type" VARCHAR(15),
    "street" VARCHAR(100),
    "number" TEXT,
    "complement" TEXT,
    "district" VARCHAR(100),
    "city" VARCHAR(100),
    "state" VARCHAR(2),
    "zipCode" VARCHAR(8),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."branch" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'A',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."claim" (
    "id" TEXT NOT NULL,
    "claimNumber" VARCHAR(50) NOT NULL,
    "customerId" TEXT NOT NULL,
    "policyId" TEXT,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "incidentDate" TIMESTAMP(3) NOT NULL,
    "reportedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "public"."claim_status" NOT NULL DEFAULT 'REPORTED',
    "priority" "public"."claim_priority" NOT NULL DEFAULT 'MEDIUM',
    "claimType" VARCHAR(50) NOT NULL,
    "estimatedValue" DECIMAL(15,2),
    "approvedValue" DECIMAL(15,2),
    "deductible" DECIMAL(15,2),
    "location" VARCHAR(255),
    "witnesses" TEXT,
    "policeReport" VARCHAR(100),
    "assignedTo" TEXT,
    "createdBy" TEXT,
    "closedAt" TIMESTAMP(3),
    "closedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "claim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."claimcommunication" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "type" "public"."claimcommunication_type" NOT NULL,
    "direction" "public"."claimcommunication_direction" NOT NULL,
    "subject" VARCHAR(255),
    "content" TEXT NOT NULL,
    "fromEmail" VARCHAR(255),
    "toEmail" VARCHAR(255),
    "fromPhone" VARCHAR(20),
    "toPhone" VARCHAR(20),
    "userId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "claimcommunication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."claimdocument" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "originalName" VARCHAR(255) NOT NULL,
    "mimeType" VARCHAR(100) NOT NULL,
    "size" INTEGER NOT NULL,
    "filePath" VARCHAR(500) NOT NULL,
    "description" TEXT,
    "uploadedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "claimdocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."claimtimeline" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "userId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "claimtimeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."commission" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "producerId" TEXT NOT NULL,
    "value" DECIMAL(15,2) NOT NULL,
    "paymentDate" VARCHAR(20) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "percentual" DECIMAL(5,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."condutor" (
    "id" TEXT NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "cpf" VARCHAR(14) NOT NULL,
    "dataNascimento" TIMESTAMP(3),
    "parentesco" VARCHAR(50),
    "genero" VARCHAR(20),
    "estadoCivil" VARCHAR(30),
    "profissao" VARCHAR(100),
    "itemAutomovelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "condutor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contact" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "type" VARCHAR(10),
    "name" VARCHAR(100) NOT NULL,
    "birthDate" VARCHAR(10),
    "gender" VARCHAR(10),
    "email" TEXT,
    "phone" VARCHAR(15),
    "cellPhone" VARCHAR(15),
    "position" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."customer" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "status" TEXT DEFAULT '1',
    "socialName" VARCHAR(100),
    "birthDate" VARCHAR(10),
    "gender" VARCHAR(10),
    "personType" VARCHAR(8),
    "cnpjCpf" TEXT,
    "email" TEXT,
    "website" VARCHAR(100),
    "clientSince" VARCHAR(7),
    "revenue" VARCHAR(10),
    "business" VARCHAR(100),
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cnhExpiration" VARCHAR(20),
    "cnhNumber" VARCHAR(20),
    "documentDateExpedition" VARCHAR(10),
    "documentIssuingAgency" VARCHAR(10),
    "income" VARCHAR(10),
    "maritalStatus" VARCHAR(10),
    "source" VARCHAR(100),

    CONSTRAINT "customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."document" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "originalName" VARCHAR(255) NOT NULL,
    "category" "public"."document_category" NOT NULL,
    "mimeType" VARCHAR(100) NOT NULL,
    "size" INTEGER NOT NULL,
    "filePath" VARCHAR(500) NOT NULL,
    "description" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "parentId" TEXT,
    "uploadedBy" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."endosso" (
    "id" TEXT NOT NULL,
    "apoliceId" TEXT NOT NULL,
    "sequencia" INTEGER NOT NULL,
    "endossoNr" VARCHAR(50) NOT NULL,
    "vigencia" VARCHAR(100) NOT NULL,
    "tipoMovimento" VARCHAR(100) NOT NULL,
    "nrVidas" VARCHAR(30) NOT NULL,
    "premio" DECIMAL(15,2) NOT NULL,
    "sitMov" VARCHAR(50) NOT NULL,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dataEmissao" TIMESTAMP(3),
    "numeroApolice" VARCHAR(50),

    CONSTRAINT "endosso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."insurancecompany" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'A',
    "phone" VARCHAR(15),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "susep" VARCHAR(5),
    "urlLogo" VARCHAR(255),
    "obsersvations" VARCHAR(255),

    CONSTRAINT "insurancecompany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."itemautomovel" (
    "id" TEXT NOT NULL,
    "plate" VARCHAR(10),
    "chassi" VARCHAR(17),
    "model" VARCHAR(100) NOT NULL,
    "manufacturerYear" INTEGER,
    "manufacturerYearModel" INTEGER,
    "zeroKm" VARCHAR(1),
    "bonus" DECIMAL(65,30),
    "identificationCode" VARCHAR(10),
    "fipe" VARCHAR(10),
    "fuel" VARCHAR(10),
    "policyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "item" INTEGER,
    "itemCia" VARCHAR(5),
    "itemStatus" VARCHAR(20),
    "manufacturer" VARCHAR(100) NOT NULL,
    "observation" VARCHAR(255),
    "owner" VARCHAR(100),
    "coverage" VARCHAR(10),

    CONSTRAINT "itemautomovel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."opportunity" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "customerId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "policyId" TEXT,
    "productId" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "opportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."phone" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "type" VARCHAR(10) NOT NULL,
    "number" TEXT NOT NULL,
    "contact" VARCHAR(50),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "phone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."policy" (
    "id" TEXT NOT NULL,
    "document" VARCHAR(10) NOT NULL,
    "proposalNumber" VARCHAR(30) NOT NULL,
    "situationDocument" TEXT NOT NULL DEFAULT '1',
    "policyNumber" TEXT,
    "issueDate" TIMESTAMP(3),
    "renewal" TEXT NOT NULL DEFAULT '1',
    "tipoRenewal" VARCHAR(2) NOT NULL,
    "previousPolicy" VARCHAR(30),
    "previousInsuranceCompany" VARCHAR(30),
    "source" VARCHAR(20),
    "liquidPrize" DECIMAL(15,2),
    "totalPrize" DECIMAL(15,2),
    "iof" DECIMAL(15,2),
    "commissionValue" DECIMAL(15,2),
    "customerId" TEXT NOT NULL,
    "insuranceCompanyId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT,
    "producerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bonus" VARCHAR(2),
    "endDate" TIMESTAMP(3) NOT NULL,
    "identificationCode" VARCHAR(30),
    "startDate" TIMESTAMP(3) NOT NULL,
    "detailsStatus" TEXT NOT NULL DEFAULT 'pending',
    "emissaoData" JSONB,
    "formaPagamento" TEXT,
    "percentualComissao" DECIMAL(5,2),
    "valoresData" JSONB,
    "valoresStatus" TEXT NOT NULL DEFAULT 'pending',
    "agencia" TEXT,
    "alteradoPor" TEXT,
    "apoliceColetiva" BOOLEAN DEFAULT false,
    "banco" TEXT,
    "contaCorrente" TEXT,
    "criadoPor" TEXT,
    "nrVidas" VARCHAR(30),
    "additional" DECIMAL(15,2),
    "cost" DECIMAL(15,2),
    "discountFee" BOOLEAN DEFAULT false,
    "firstDueDate" TIMESTAMP(3),
    "installmentValue" DECIMAL(15,2),
    "numberInstallments" INTEGER,
    "upcomingDueDate" TIMESTAMP(3),

    CONSTRAINT "policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."producer" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "status" TEXT NOT NULL DEFAULT '1',
    "role" TEXT NOT NULL DEFAULT 'Produtor',
    "email" TEXT,
    "phone" TEXT,
    "bank" VARCHAR(100),
    "bankAgency" VARCHAR(10),
    "bankAccount" VARCHAR(10),
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" TEXT,

    CONSTRAINT "producer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(10),
    "name" VARCHAR(100),
    "status" TEXT NOT NULL DEFAULT 'A',
    "branchId" TEXT NOT NULL,
    "insuranceCompanyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "additionalCommission" BOOLEAN NOT NULL DEFAULT false,
    "iof" DECIMAL(15,2),
    "showBudget" BOOLEAN NOT NULL DEFAULT true,
    "subscriptionInsurance" BOOLEAN DEFAULT false,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."role" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "status" TEXT NOT NULL DEFAULT '1',
    "password" VARCHAR(255) NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "avatarUrl" TEXT,
    "role" TEXT NOT NULL DEFAULT 'Atendente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "roleId" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."whatsappconfig" (
    "id" TEXT NOT NULL,
    "baseUrl" VARCHAR(255) NOT NULL,
    "apiKey" TEXT NOT NULL,
    "instanceName" VARCHAR(100) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "lastTested" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastWebhookTest" TIMESTAMP(3),
    "webhookActive" BOOLEAN NOT NULL DEFAULT false,
    "webhookToken" TEXT,
    "webhookUrl" VARCHAR(500),

    CONSTRAINT "whatsappconfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."whatsappconnectionanalytics" (
    "id" TEXT NOT NULL,
    "instanceName" VARCHAR(100) NOT NULL,
    "date" DATE NOT NULL,
    "qrCodesGenerated" INTEGER NOT NULL DEFAULT 0,
    "qrCodesExpired" INTEGER NOT NULL DEFAULT 0,
    "qrCodesUsed" INTEGER NOT NULL DEFAULT 0,
    "connectionsSuccessful" INTEGER NOT NULL DEFAULT 0,
    "connectionsFailed" INTEGER NOT NULL DEFAULT 0,
    "averageConnectionTime" INTEGER,
    "totalAccessCount" INTEGER NOT NULL DEFAULT 0,
    "uniqueAccessCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsappconnectionanalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."whatsappconnectionstatus" (
    "id" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "instanceName" VARCHAR(100) NOT NULL,
    "status" "public"."whatsappconnectionstatus_status" NOT NULL DEFAULT 'DISCONNECTED',
    "lastStatusCheck" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "connectionDetails" JSONB,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsappconnectionstatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."whatsappconversation" (
    "id" TEXT NOT NULL,
    "phoneNumber" VARCHAR(20) NOT NULL,
    "customerName" VARCHAR(100),
    "customerId" TEXT,
    "lastMessage" TIMESTAMP(3),
    "unreadCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsappconversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."whatsappmessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "messageId" VARCHAR(100) NOT NULL,
    "fromNumber" VARCHAR(20) NOT NULL,
    "toNumber" VARCHAR(20) NOT NULL,
    "content" TEXT NOT NULL,
    "messageType" "public"."whatsappmessage_messageType" NOT NULL DEFAULT 'TEXT',
    "direction" "public"."whatsappmessage_direction" NOT NULL,
    "status" "public"."whatsappmessage_status" NOT NULL DEFAULT 'SENT',
    "timestamp" TIMESTAMP(3) NOT NULL,
    "customerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsappmessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."whatsappqrcode" (
    "id" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "instanceName" VARCHAR(100) NOT NULL,
    "qrCode" TEXT NOT NULL,
    "qrCodeBase64" TEXT NOT NULL,
    "status" "public"."whatsappqrcode_status" NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "connectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsappqrcode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."whatsappqrcodeaccess" (
    "id" TEXT NOT NULL,
    "instanceName" VARCHAR(100) NOT NULL,
    "qrCodeId" TEXT,
    "accessType" VARCHAR(50) NOT NULL,
    "userAgent" VARCHAR(500),
    "ipAddress" VARCHAR(45),
    "sessionId" VARCHAR(100),
    "userId" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsappqrcodeaccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."whatsappqrcodecleanuplog" (
    "id" TEXT NOT NULL,
    "expiredCount" INTEGER NOT NULL DEFAULT 0,
    "cleanedCount" INTEGER NOT NULL DEFAULT 0,
    "cleanedWarnings" INTEGER NOT NULL DEFAULT 0,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsappqrcodecleanuplog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."whatsappqrcodeexpiration" (
    "id" TEXT NOT NULL,
    "instanceName" VARCHAR(100) NOT NULL,
    "expiredAt" TIMESTAMP(3) NOT NULL,
    "autoRegenerated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsappqrcodeexpiration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."whatsappqrcodehistory" (
    "id" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "instanceName" VARCHAR(100) NOT NULL,
    "qrCodeId" TEXT,
    "action" "public"."whatsappqrcodehistory_action" NOT NULL,
    "status" "public"."whatsappqrcodehistory_status",
    "details" JSONB,
    "userAgent" VARCHAR(500),
    "ipAddress" VARCHAR(45),
    "sessionId" VARCHAR(100),
    "userId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsappqrcodehistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."whatsappqrcoderetention" (
    "id" TEXT NOT NULL,
    "instanceName" VARCHAR(100) NOT NULL,
    "retentionDays" INTEGER NOT NULL DEFAULT 30,
    "lastCleanupAt" TIMESTAMP(3),
    "historyRecords" INTEGER NOT NULL DEFAULT 0,
    "accessRecords" INTEGER NOT NULL DEFAULT 0,
    "analyticsRecords" INTEGER NOT NULL DEFAULT 0,
    "autoCleanupActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsappqrcoderetention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."whatsappqrcodewarning" (
    "id" TEXT NOT NULL,
    "instanceName" VARCHAR(100) NOT NULL,
    "warningType" VARCHAR(50) NOT NULL,
    "timeRemaining" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsappqrcodewarning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."whatsappsystemerror" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "errorType" VARCHAR(50) NOT NULL,
    "errorCode" VARCHAR(20),
    "message" TEXT NOT NULL,
    "stackTrace" TEXT,
    "endpoint" VARCHAR(255),
    "instanceName" VARCHAR(100),
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "whatsappsystemerror_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."whatsappsystemmetrics" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "connectionStatus" VARCHAR(20) NOT NULL,
    "messagesProcessed" INTEGER NOT NULL DEFAULT 0,
    "messagesSent" INTEGER NOT NULL DEFAULT 0,
    "messagesReceived" INTEGER NOT NULL DEFAULT 0,
    "messagesFailed" INTEGER NOT NULL DEFAULT 0,
    "averageResponseTime" DOUBLE PRECISION,
    "apiResponseTime" DOUBLE PRECISION,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "activeConversations" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "whatsappsystemmetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."whatsappwebhooklog" (
    "id" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "event" VARCHAR(50) NOT NULL,
    "instanceName" VARCHAR(100) NOT NULL,
    "success" BOOLEAN NOT NULL,
    "error" TEXT,
    "requestData" JSONB,
    "responseData" JSONB,
    "clientIp" VARCHAR(45),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsappwebhooklog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VeiculoFipe_cod_fipe_key" ON "public"."veiculofipe"("cod_fipe");

-- CreateIndex
CREATE INDEX "VeiculoFipe_cod_marca_idx" ON "public"."veiculofipe"("cod_marca");

-- CreateIndex
CREATE INDEX "VeiculoFipe_cod_modelo_idx" ON "public"."veiculofipe"("cod_modelo");

-- CreateIndex
CREATE INDEX "idx_customer_date" ON "public"."activity"("customerId", "date" DESC);

-- CreateIndex
CREATE INDEX "idx_date_desc" ON "public"."activity"("date" DESC);

-- CreateIndex
CREATE INDEX "idx_type_date" ON "public"."activity"("type", "date" DESC);

-- CreateIndex
CREATE INDEX "idx_user_date" ON "public"."activity"("userId", "date" DESC);

-- CreateIndex
CREATE INDEX "Address_customerId_idx" ON "public"."address"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "Claim_claimNumber_key" ON "public"."claim"("claimNumber");

-- CreateIndex
CREATE INDEX "Claim_createdBy_idx" ON "public"."claim"("createdBy");

-- CreateIndex
CREATE INDEX "idx_assigned_to" ON "public"."claim"("assignedTo");

-- CreateIndex
CREATE INDEX "idx_claim_number" ON "public"."claim"("claimNumber");

-- CreateIndex
CREATE INDEX "idx_customer_status" ON "public"."claim"("customerId", "status");

-- CreateIndex
CREATE INDEX "idx_incident_date" ON "public"."claim"("incidentDate" DESC);

-- CreateIndex
CREATE INDEX "idx_policy" ON "public"."claim"("policyId");

-- CreateIndex
CREATE INDEX "idx_reported_date" ON "public"."claim"("reportedDate" DESC);

-- CreateIndex
CREATE INDEX "idx_status_priority" ON "public"."claim"("status", "priority");

-- CreateIndex
CREATE INDEX "ClaimCommunication_userId_idx" ON "public"."claimcommunication"("userId");

-- CreateIndex
CREATE INDEX "idx_comm_claim_timestamp" ON "public"."claimcommunication"("claimId", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "idx_comm_type_timestamp" ON "public"."claimcommunication"("type", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "ClaimDocument_uploadedBy_idx" ON "public"."claimdocument"("uploadedBy");

-- CreateIndex
CREATE INDEX "idx_claim" ON "public"."claimdocument"("claimId");

-- CreateIndex
CREATE INDEX "idx_claimdoc_created_desc" ON "public"."claimdocument"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "ClaimTimeline_userId_idx" ON "public"."claimtimeline"("userId");

-- CreateIndex
CREATE INDEX "idx_timeline_claim_timestamp" ON "public"."claimtimeline"("claimId", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "Commission_policyId_idx" ON "public"."commission"("policyId");

-- CreateIndex
CREATE INDEX "Commission_producerId_idx" ON "public"."commission"("producerId");

-- CreateIndex
CREATE INDEX "Condutor_itemAutomovelId_idx" ON "public"."condutor"("itemAutomovelId");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_email_key" ON "public"."contact"("email");

-- CreateIndex
CREATE INDEX "Contact_customerId_idx" ON "public"."contact"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_cnpjCpf_key" ON "public"."customer"("cnpjCpf");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "public"."customer"("email");

-- CreateIndex
CREATE INDEX "Document_uploadedBy_idx" ON "public"."document"("uploadedBy");

-- CreateIndex
CREATE INDEX "idx_doc_created_desc" ON "public"."document"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "idx_doc_customer_active" ON "public"."document"("customerId", "isActive");

-- CreateIndex
CREATE INDEX "idx_customer_category" ON "public"."document"("customerId", "category");

-- CreateIndex
CREATE INDEX "idx_parent" ON "public"."document"("parentId");

-- CreateIndex
CREATE INDEX "idx_apolice_sequencia" ON "public"."endosso"("apoliceId", "sequencia");

-- CreateIndex
CREATE INDEX "idx_endosso_apolice" ON "public"."endosso"("apoliceId");

-- CreateIndex
CREATE INDEX "idx_endosso_sequencia" ON "public"."endosso"("sequencia");

-- CreateIndex
CREATE INDEX "idx_numero_apolice" ON "public"."endosso"("numeroApolice");

-- CreateIndex
CREATE UNIQUE INDEX "Endosso_apoliceId_sequencia_key" ON "public"."endosso"("apoliceId", "sequencia");

-- CreateIndex
CREATE UNIQUE INDEX "ItemAutomovel_policyId_key" ON "public"."itemautomovel"("policyId");

-- CreateIndex
CREATE INDEX "Opportunity_customerId_idx" ON "public"."opportunity"("customerId");

-- CreateIndex
CREATE INDEX "Opportunity_policyId_idx" ON "public"."opportunity"("policyId");

-- CreateIndex
CREATE INDEX "Opportunity_productId_idx" ON "public"."opportunity"("productId");

-- CreateIndex
CREATE INDEX "Opportunity_userId_idx" ON "public"."opportunity"("userId");

-- CreateIndex
CREATE INDEX "Phone_customerId_idx" ON "public"."phone"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "Policy_policyNumber_key" ON "public"."policy"("policyNumber");

-- CreateIndex
CREATE INDEX "Policy_branchId_idx" ON "public"."policy"("branchId");

-- CreateIndex
CREATE INDEX "Policy_insuranceCompanyId_idx" ON "public"."policy"("insuranceCompanyId");

-- CreateIndex
CREATE INDEX "Policy_producerId_idx" ON "public"."policy"("producerId");

-- CreateIndex
CREATE INDEX "Policy_productId_idx" ON "public"."policy"("productId");

-- CreateIndex
CREATE INDEX "Policy_userId_idx" ON "public"."policy"("userId");

-- CreateIndex
CREATE INDEX "idx_customer_details_status" ON "public"."policy"("customerId", "detailsStatus");

-- CreateIndex
CREATE INDEX "idx_customer_situation_details" ON "public"."policy"("customerId", "situationDocument", "detailsStatus");

-- CreateIndex
CREATE INDEX "idx_details_situation_updated" ON "public"."policy"("detailsStatus", "situationDocument", "updatedAt" DESC);

-- CreateIndex
CREATE INDEX "idx_details_status_created" ON "public"."policy"("detailsStatus", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "idx_situation_created" ON "public"."policy"("situationDocument", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "idx_situation_details_status" ON "public"."policy"("situationDocument", "detailsStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Producer_email_key" ON "public"."producer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Producer_phone_key" ON "public"."producer"("phone");

-- CreateIndex
CREATE INDEX "Producer_customerId_idx" ON "public"."producer"("customerId");

-- CreateIndex
CREATE INDEX "Product_branchId_idx" ON "public"."product"("branchId");

-- CreateIndex
CREATE INDEX "Product_insuranceCompanyId_idx" ON "public"."product"("insuranceCompanyId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "public"."user"("phone");

-- CreateIndex
CREATE INDEX "User_roleId_idx" ON "public"."user"("roleId");

-- CreateIndex
CREATE INDEX "WhatsAppConfig_instanceName_idx" ON "public"."whatsappconfig"("instanceName");

-- CreateIndex
CREATE INDEX "WhatsAppConfig_webhookActive_idx" ON "public"."whatsappconfig"("webhookActive");

-- CreateIndex
CREATE INDEX "idx_analytics_date" ON "public"."whatsappconnectionanalytics"("date" DESC);

-- CreateIndex
CREATE INDEX "idx_analytics_instance" ON "public"."whatsappconnectionanalytics"("instanceName");

-- CreateIndex
CREATE INDEX "idx_instance_analytics_date" ON "public"."whatsappconnectionanalytics"("instanceName", "date" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppConnectionAnalytics_instanceName_date_key" ON "public"."whatsappconnectionanalytics"("instanceName", "date");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppConnectionStatus_instanceName_key" ON "public"."whatsappconnectionstatus"("instanceName");

-- CreateIndex
CREATE INDEX "WhatsAppConnectionStatus_configId_idx" ON "public"."whatsappconnectionstatus"("configId");

-- CreateIndex
CREATE INDEX "idx_instance_name" ON "public"."whatsappconnectionstatus"("instanceName");

-- CreateIndex
CREATE INDEX "idx_last_check" ON "public"."whatsappconnectionstatus"("lastStatusCheck");

-- CreateIndex
CREATE INDEX "idx_status" ON "public"."whatsappconnectionstatus"("status");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppConversation_phoneNumber_key" ON "public"."whatsappconversation"("phoneNumber");

-- CreateIndex
CREATE INDEX "WhatsAppConversation_customerId_idx" ON "public"."whatsappconversation"("customerId");

-- CreateIndex
CREATE INDEX "WhatsAppConversation_phoneNumber_idx" ON "public"."whatsappconversation"("phoneNumber");

-- CreateIndex
CREATE INDEX "idx_active_lastmessage" ON "public"."whatsappconversation"("isActive", "lastMessage" DESC);

-- CreateIndex
CREATE INDEX "idx_active_unread_lastmessage" ON "public"."whatsappconversation"("isActive", "unreadCount" DESC, "lastMessage" DESC);

-- CreateIndex
CREATE INDEX "idx_conv_customer_active" ON "public"."whatsappconversation"("customerId", "isActive");

-- CreateIndex
CREATE INDEX "idx_customer_name" ON "public"."whatsappconversation"("customerName");

-- CreateIndex
CREATE INDEX "idx_lastmessage_created" ON "public"."whatsappconversation"("lastMessage" DESC, "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppMessage_messageId_key" ON "public"."whatsappmessage"("messageId");

-- CreateIndex
CREATE INDEX "WhatsAppMessage_conversationId_idx" ON "public"."whatsappmessage"("conversationId");

-- CreateIndex
CREATE INDEX "WhatsAppMessage_messageId_idx" ON "public"."whatsappmessage"("messageId");

-- CreateIndex
CREATE INDEX "idx_conversation_direction_timestamp" ON "public"."whatsappmessage"("conversationId", "direction", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "idx_conversation_timestamp" ON "public"."whatsappmessage"("conversationId", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "idx_msg_created_desc" ON "public"."whatsappmessage"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "idx_customer_timestamp" ON "public"."whatsappmessage"("customerId", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "idx_from_timestamp" ON "public"."whatsappmessage"("fromNumber", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "idx_msg_status_created" ON "public"."whatsappmessage"("status", "createdAt");

-- CreateIndex
CREATE INDEX "idx_timestamp_id_cursor" ON "public"."whatsappmessage"("timestamp" DESC, "id");

-- CreateIndex
CREATE INDEX "idx_msg_type_timestamp" ON "public"."whatsappmessage"("messageType", "timestamp" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppQRCode_instanceName_key" ON "public"."whatsappqrcode"("instanceName");

-- CreateIndex
CREATE INDEX "WhatsAppQRCode_configId_idx" ON "public"."whatsappqrcode"("configId");

-- CreateIndex
CREATE INDEX "idx_expires_at" ON "public"."whatsappqrcode"("expiresAt");

-- CreateIndex
CREATE INDEX "idx_instance_status" ON "public"."whatsappqrcode"("instanceName", "status");

-- CreateIndex
CREATE INDEX "idx_qr_status_created" ON "public"."whatsappqrcode"("status", "createdAt");

-- CreateIndex
CREATE INDEX "idx_access_instance" ON "public"."whatsappqrcodeaccess"("instanceName");

-- CreateIndex
CREATE INDEX "idx_access_success" ON "public"."whatsappqrcodeaccess"("success");

-- CreateIndex
CREATE INDEX "idx_access_timestamp" ON "public"."whatsappqrcodeaccess"("timestamp" DESC);

-- CreateIndex
CREATE INDEX "idx_access_type" ON "public"."whatsappqrcodeaccess"("accessType");

-- CreateIndex
CREATE INDEX "idx_instance_access_timestamp" ON "public"."whatsappqrcodeaccess"("instanceName", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "idx_user_access_timestamp" ON "public"."whatsappqrcodeaccess"("userId", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "idx_cleanup_timestamp" ON "public"."whatsappqrcodecleanuplog"("timestamp");

-- CreateIndex
CREATE INDEX "idx_auto_regenerated" ON "public"."whatsappqrcodeexpiration"("autoRegenerated");

-- CreateIndex
CREATE INDEX "idx_expiration_date" ON "public"."whatsappqrcodeexpiration"("expiredAt");

-- CreateIndex
CREATE INDEX "idx_expiration_instance" ON "public"."whatsappqrcodeexpiration"("instanceName");

-- CreateIndex
CREATE INDEX "idx_action_timestamp" ON "public"."whatsappqrcodehistory"("action", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "idx_history_action" ON "public"."whatsappqrcodehistory"("action");

-- CreateIndex
CREATE INDEX "idx_history_config" ON "public"."whatsappqrcodehistory"("configId");

-- CreateIndex
CREATE INDEX "idx_history_instance" ON "public"."whatsappqrcodehistory"("instanceName");

-- CreateIndex
CREATE INDEX "idx_history_timestamp" ON "public"."whatsappqrcodehistory"("timestamp" DESC);

-- CreateIndex
CREATE INDEX "idx_instance_timestamp" ON "public"."whatsappqrcodehistory"("instanceName", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "idx_user_timestamp" ON "public"."whatsappqrcodehistory"("userId", "timestamp" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppQRCodeRetention_instanceName_key" ON "public"."whatsappqrcoderetention"("instanceName");

-- CreateIndex
CREATE INDEX "idx_retention_active" ON "public"."whatsappqrcoderetention"("autoCleanupActive");

-- CreateIndex
CREATE INDEX "idx_retention_cleanup" ON "public"."whatsappqrcoderetention"("lastCleanupAt");

-- CreateIndex
CREATE INDEX "idx_warning_instance" ON "public"."whatsappqrcodewarning"("instanceName");

-- CreateIndex
CREATE INDEX "idx_warning_timestamp" ON "public"."whatsappqrcodewarning"("timestamp");

-- CreateIndex
CREATE INDEX "idx_warning_type" ON "public"."whatsappqrcodewarning"("warningType");

-- CreateIndex
CREATE INDEX "WhatsAppSystemError_errorType_idx" ON "public"."whatsappsystemerror"("errorType");

-- CreateIndex
CREATE INDEX "WhatsAppSystemError_resolved_idx" ON "public"."whatsappsystemerror"("resolved");

-- CreateIndex
CREATE INDEX "WhatsAppSystemError_timestamp_idx" ON "public"."whatsappsystemerror"("timestamp");

-- CreateIndex
CREATE INDEX "WhatsAppSystemMetrics_timestamp_idx" ON "public"."whatsappsystemmetrics"("timestamp");

-- CreateIndex
CREATE INDEX "WhatsAppWebhookLog_configId_idx" ON "public"."whatsappwebhooklog"("configId");

-- CreateIndex
CREATE INDEX "WhatsAppWebhookLog_event_idx" ON "public"."whatsappwebhooklog"("event");

-- CreateIndex
CREATE INDEX "WhatsAppWebhookLog_instanceName_idx" ON "public"."whatsappwebhooklog"("instanceName");

-- CreateIndex
CREATE INDEX "WhatsAppWebhookLog_success_idx" ON "public"."whatsappwebhooklog"("success");

-- CreateIndex
CREATE INDEX "WhatsAppWebhookLog_timestamp_idx" ON "public"."whatsappwebhooklog"("timestamp");

-- AddForeignKey
ALTER TABLE "public"."activity" ADD CONSTRAINT "Activity_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."address" ADD CONSTRAINT "Address_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."claim" ADD CONSTRAINT "Claim_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."claim" ADD CONSTRAINT "Claim_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."claim" ADD CONSTRAINT "Claim_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."claim" ADD CONSTRAINT "Claim_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "public"."policy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."claimcommunication" ADD CONSTRAINT "ClaimCommunication_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "public"."claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."claimcommunication" ADD CONSTRAINT "ClaimCommunication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."claimdocument" ADD CONSTRAINT "ClaimDocument_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "public"."claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."claimdocument" ADD CONSTRAINT "ClaimDocument_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."claimtimeline" ADD CONSTRAINT "ClaimTimeline_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "public"."claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."claimtimeline" ADD CONSTRAINT "ClaimTimeline_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."commission" ADD CONSTRAINT "Commission_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "public"."policy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."commission" ADD CONSTRAINT "Commission_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "public"."producer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."condutor" ADD CONSTRAINT "Condutor_itemAutomovelId_fkey" FOREIGN KEY ("itemAutomovelId") REFERENCES "public"."itemautomovel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contact" ADD CONSTRAINT "Contact_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document" ADD CONSTRAINT "Document_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document" ADD CONSTRAINT "Document_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document" ADD CONSTRAINT "Document_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."endosso" ADD CONSTRAINT "Endosso_apoliceId_fkey" FOREIGN KEY ("apoliceId") REFERENCES "public"."policy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."itemautomovel" ADD CONSTRAINT "ItemAutomovel_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "public"."policy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."opportunity" ADD CONSTRAINT "Opportunity_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."opportunity" ADD CONSTRAINT "Opportunity_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "public"."policy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."opportunity" ADD CONSTRAINT "Opportunity_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."opportunity" ADD CONSTRAINT "Opportunity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."phone" ADD CONSTRAINT "Phone_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."policy" ADD CONSTRAINT "Policy_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "public"."branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."policy" ADD CONSTRAINT "Policy_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."policy" ADD CONSTRAINT "Policy_insuranceCompanyId_fkey" FOREIGN KEY ("insuranceCompanyId") REFERENCES "public"."insurancecompany"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."policy" ADD CONSTRAINT "Policy_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "public"."producer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."policy" ADD CONSTRAINT "Policy_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."policy" ADD CONSTRAINT "Policy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."producer" ADD CONSTRAINT "Producer_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product" ADD CONSTRAINT "Product_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "public"."branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product" ADD CONSTRAINT "Product_insuranceCompanyId_fkey" FOREIGN KEY ("insuranceCompanyId") REFERENCES "public"."insurancecompany"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."whatsappconnectionstatus" ADD CONSTRAINT "WhatsAppConnectionStatus_configId_fkey" FOREIGN KEY ("configId") REFERENCES "public"."whatsappconfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."whatsappconversation" ADD CONSTRAINT "WhatsAppConversation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."whatsappmessage" ADD CONSTRAINT "WhatsAppMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "public"."whatsappconversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."whatsappmessage" ADD CONSTRAINT "WhatsAppMessage_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."whatsappqrcode" ADD CONSTRAINT "WhatsAppQRCode_configId_fkey" FOREIGN KEY ("configId") REFERENCES "public"."whatsappconfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."whatsappqrcodehistory" ADD CONSTRAINT "WhatsAppQRCodeHistory_configId_fkey" FOREIGN KEY ("configId") REFERENCES "public"."whatsappconfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."whatsappwebhooklog" ADD CONSTRAINT "WhatsAppWebhookLog_configId_fkey" FOREIGN KEY ("configId") REFERENCES "public"."whatsappconfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;
