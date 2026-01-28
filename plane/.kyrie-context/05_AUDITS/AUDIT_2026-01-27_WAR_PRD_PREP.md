# ⚔️ PRD de Guerra: Preparação Tática

**Data:** 27/01/2026 **Objetivo:** Consolidar a verdade técnica e preparar o
terreno para a "Ofensiva de Implementação" do PM.

---

## 1. Auditoria de Documentação: "As Mentiras Táticas"

Analisamos a pasta `docs/` e cruzamos com a realidade do código (`src/` e
`intelligence-engine/`).

### 🚨 Discrepância #1: A Camada de IA (The Phantom Crew)

- **O que `intelligence-integration.md.md` diz:**
  - Descreve uma orquestração completa com **FastAPI + CrewAI**.
  - Cita agentes específicos: "CFO (Gestão Estratégica)", "Scrum Master
    (Priorização)", "Operário (Executor)".
  - Lista ferramentas (Tools): `read_contracts`, `update_issue_priority`,
    `write_supabase_db`.
- **A Realidade do Código:**
  - **NÃO existe CrewAI orquestrado.** O arquivo `requirements.txt` tem a lib,
    mas `cfo_agent.py` é um **script Python estático** (imperativo) que roda
    queries SQL sequenciais.
  - Não existem os agentes "Scrum Master" ou "Operário".
  - As "Tools" não são ferramentas reutilizáveis do CrewAI, são apenas chamadas
    de função hardcoded dentro do script.

### 🚨 Discrepância #2: Portal do Cliente e Integrações (Vaporware)

- **O que `docs/02-features/status.md` diz (por omissão):**
  - Não lista "Portal do Cliente" ou "Integrações" sequer como "Pendentes".
- **A Realidade dos Requisitos (PRDs originais):**
  - PRD-002 e PRD-003 exigem essas features.
  - O código atual não tem **nada** (0%) sobre isso. A documentação de status
    ignora completamente essas exigências de negócio.

---

## 2. Viabilidade Técnica: Componente TimeTracker (HeroUI v3)

Validamos que a stack atual suporta plenamente a construção imediata deste
componente Crítico.

**Stack Confirmada:**

- **Lib UI:** `@heroui/react` (v3.0.0-beta.3) ✅
- **Ícones:** `lucide-react` ✅
- **Backend:** Tabela `worklogs` (Supabase) pronta para receber dados ✅

### 🛠️ Especificação Técnica (Para o PM Agent)

**Nome do Componente:** `TimeTracker.tsx` **Localização:**
`src/components/dashboard/TimeTracker.tsx`

**Arquitetura de UI (HeroUI v3):**

1. **Card Flutuante ou Fixo:** Usar `<Card>` como container principal.
2. **Display de Tempo:** Tipografia mono (`font-mono`) para o cronômetro
   `00:00:00`.
3. **Controles:**
   - `<Button isIconOnly color="success">` com ícone `Play` (Start).
   - `<Button isIconOnly color="danger">` com ícone `Square` (Stop).
   - `<Input>` ou `<Textarea>` para descrição da tarefa ("O que você está
     fazendo?").
4. **Integração:**
   - **Contexto:** Deve saber qual `taskId` está ativa (se houver).
   - **Server Action:** `saveWorklog(issueId, duration, description)`.

**Estado de Viabilidade:** 🟢 **ALTA**. Pode ser implementado em < 2 horas.

---

## 3. Próximos Passos: Acionamento do Agente PM

O terreno está preparado. Não há bloqueios técnicos para o TimeTracker, e as
"mentiras" da IA foram desmascaradas (precisamos refatorar para CrewAI real se
quisermos a inteligência prometida).

**Recomendação de Comando para o PM:**

> "Agente PM, escreva as User Stories para:
>
> 1. Implementação do `TimeTracker` usando HeroUI v3 (Prioridade Imediata).
> 2. Refatoração do `intelligence-engine` para usar arquitetura CrewAI real
>    (conforme descrito em `intelligence-integration.md`)."
