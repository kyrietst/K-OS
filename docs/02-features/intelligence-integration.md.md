⚠️ DEPRECATED - Refer to `AUDIT_2026-01-27_WAR_PRD_PREP.md` for current truth

📄 PRD: Integração KyrieBrain Intelligence (FastAPI + CrewAI)

1. Visão Geral Este módulo é o "Lobo Frontal" do KyrieOS. Ele consiste em um
   microserviço Python (FastAPI) que orquestra agentes de IA (CrewAI) para
   realizar operações táticas no ecossistema da agência, garantindo eficiência
   operacional e financeira.

2. Personas de IA (The Brains) A. Agente CFO (Gestão Estratégica) Missão:
   Garantir que a energia do time (horas) esteja alinhada com o faturamento
   (contratos).

Lógica: Se o cliente Adega Anita's representa 30% do faturamento, o CFO deve
alertar se as horas alocadas ultrapassarem essa margem.

Tools: read_contracts, read_worklogs, send_slack_alert.

B. Agente Scrum Master (Priorização) Missão: Manter a "Esteira de Valor"
fluindo.

Lógica: Calcula o ICE Score (Impacto, Confiança, Facilidade) para cada tarefa e
reorganiza o Kanban.

Tools: update_issue_priority, calculate_ice_score.

C. Agente Operário (Executor) Missão: Refletir as decisões da IA no banco de
dados.

Lógica: Mover cards, criar sprints e atualizar status de issues.

Tools: write_supabase_db, read_supabase_db.

3. Arquitetura Técnica (The Blueprint) Fluxo de Comunicação Trigger: Next.js
   (Route Handler) envia um POST para o FastAPI.

Orquestração: FastAPI aciona o Crew correspondente.

Ação: O Crew utiliza Tools (Supabase Service Role) para ler/escrever dados.

Resposta: O resultado é devolvido ao Next.js e atualizado na UI via Supabase
Realtime.

Requisitos de Segurança Uso de SUPABASE_SERVICE_ROLE_KEY exclusivamente no
backend Python.

Comunicação via API Key entre os serviços.

4. Instruções para o Agente Operacional (VibeCoder) Contexto de Execução: Ao
   implementar este módulo, utilize:

Skill: python-patterns (para estrutura da FastAPI).

Skill: api-patterns (para definição dos endpoints).

Workflow: orchestrate.md (para garantir a conexão Next.js ↔ FastAPI).

Regra: rules/GEMINI.md (manter a Stack de Ouro).

Tarefa Inicial:

Criar pasta intelligence-engine/ na raiz.

Configurar .venv e requirements.txt.

Implementar main.py com a ponte inicial para leitura da tabela de issues.
