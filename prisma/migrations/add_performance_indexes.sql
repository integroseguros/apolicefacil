-- Migration para adicionar índices de performance
-- Execute este arquivo após criar a migration com: npx prisma migrate dev --name add_performance_indexes

-- Índices para a tabela Policy (propostas)
CREATE INDEX IF NOT EXISTS idx_policy_situation_created ON Policy(situationDocument, createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_policy_customer_created ON Policy(customerId, createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_policy_insurance_company ON Policy(insuranceCompanyId);
CREATE INDEX IF NOT EXISTS idx_policy_start_date ON Policy(startDate);
CREATE INDEX IF NOT EXISTS idx_policy_proposal_number ON Policy(proposalNumber);
CREATE INDEX IF NOT EXISTS idx_policy_details_status ON Policy(detailsStatus);
CREATE INDEX IF NOT EXISTS idx_policy_end_date ON Policy(endDate);

-- Índices para a tabela Customer (clientes)
CREATE INDEX IF NOT EXISTS idx_customer_name ON Customer(name);
CREATE INDEX IF NOT EXISTS idx_customer_email ON Customer(email);
CREATE INDEX IF NOT EXISTS idx_customer_document ON Customer(document);
CREATE INDEX IF NOT EXISTS idx_customer_created ON Customer(createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_customer_phone ON Customer(phone);

-- Índices para a tabela InsuranceCompany (seguradoras)
CREATE INDEX IF NOT EXISTS idx_insurance_company_active ON InsuranceCompany(active, name);
CREATE INDEX IF NOT EXISTS idx_insurance_company_code ON InsuranceCompany(code);

-- Índices para a tabela Product (produtos)
CREATE INDEX IF NOT EXISTS idx_product_company_active ON Product(insuranceCompanyId, active, name);
CREATE INDEX IF NOT EXISTS idx_product_type ON Product(type);
CREATE INDEX IF NOT EXISTS idx_product_active ON Product(active);

-- Índices para a tabela Branch (filiais)
CREATE INDEX IF NOT EXISTS idx_branch_active ON Branch(active);
CREATE INDEX IF NOT EXISTS idx_branch_name ON Branch(name);

-- Índices para a tabela ItemAutomovel (itens de automóvel)
CREATE INDEX IF NOT EXISTS idx_item_automovel_policy ON ItemAutomovel(policyId);
CREATE INDEX IF NOT EXISTS idx_item_automovel_plate ON ItemAutomovel(plate);
CREATE INDEX IF NOT EXISTS idx_item_automovel_chassi ON ItemAutomovel(chassi);
CREATE INDEX IF NOT EXISTS idx_item_automovel_model ON ItemAutomovel(model);
CREATE INDEX IF NOT EXISTS idx_item_automovel_year ON ItemAutomovel(manufacturerYear);

-- Índices compostos para queries complexas
CREATE INDEX IF NOT EXISTS idx_policy_search ON Policy(situationDocument, createdAt DESC, customerId);
CREATE INDEX IF NOT EXISTS idx_policy_date_range ON Policy(startDate, endDate, situationDocument);
CREATE INDEX IF NOT EXISTS idx_policy_company_status ON Policy(insuranceCompanyId, situationDocument, createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_policy_customer_status ON Policy(customerId, situationDocument);

-- Índices para busca textual (se suportado pelo banco)
-- Para MySQL 5.7+ com suporte a full-text search
-- CREATE FULLTEXT INDEX idx_customer_fulltext ON Customer(name, email);
-- CREATE FULLTEXT INDEX idx_policy_fulltext ON Policy(proposalNumber);

-- Índices para otimizar JOINs frequentes
CREATE INDEX IF NOT EXISTS idx_policy_all_relations ON Policy(customerId, insuranceCompanyId, productId, branchId);

-- Índices para tabelas de auditoria (se existirem)
-- CREATE INDEX IF NOT EXISTS idx_audit_created ON AuditLog(createdAt DESC);
-- CREATE INDEX IF NOT EXISTS idx_audit_entity ON AuditLog(entityType, entityId);

-- Estatísticas para o otimizador de query (MySQL)
-- ANALYZE TABLE Policy;
-- ANALYZE TABLE Customer;
-- ANALYZE TABLE InsuranceCompany;
-- ANALYZE TABLE Product;
-- ANALYZE TABLE ItemAutomovel;

-- Comentários sobre os índices criados
COMMENT ON INDEX idx_policy_situation_created IS 'Otimiza queries por status e data de criação';
COMMENT ON INDEX idx_policy_customer_created IS 'Otimiza busca de propostas por cliente';
COMMENT ON INDEX idx_customer_name IS 'Otimiza busca de clientes por nome';
COMMENT ON INDEX idx_policy_search IS 'Índice composto para queries de busca complexas';
COMMENT ON INDEX idx_policy_date_range IS 'Otimiza queries por período de vigência';