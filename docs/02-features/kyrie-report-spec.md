# 📊 Feature Spec: Kyrie Report (Value Reporting)

**Status:** Ready for Dev | **Priority:** High

## 1. Contexto Estratégico

O **Kyrie Report** resolve a "Invisibilidade do Trabalho". O cliente muitas
vezes só vê a entrega final, desconhecendo a complexidade técnica (o "Iceberg")
envolvida.

Esta feature visa:

1. **Tangibilizar Valor:** Transformar micro-tarefas técnicas em métricas de
   esforço e impacto.
2. **Profissionalizar a Entrega:** Relatórios visuais e "imprimíveis".

---

## 2. O "Efeito Iceberg"

Para combater a percepção de simplicidade ("é só um botão"), diferenciamos o
esforço:

- **Visível (Ponta do Iceberg):** Entregáveis que o cliente entende (ex:
  "Campanha Black Friday").
  - _Campo:_ `client_visible = true`
- **Técnico (Base do Iceberg):** Execução técnica complexa e necessária (ex:
  "Configuração de Pixel", "Otimização de Banco").
  - _Campo:_ `client_visible = false`, `technical_effort_score` (1-5)

---

## 3. Especificação da Página (UI)

**Rota:** `/dashboard/[workspaceSlug]/report`

### Componentes

1. **Header Executivo:**
   - Resumo do período/Workspace.
   - Status Geral.

2. **Value Metrics (Cards):**
   - **Entregas Visíveis:** Quantidade de issues `client_visible` concluídas.
   - **Pontos de Esforço Técnico:** Soma do `technical_effort_score` de issues
     invisíveis.

3. **Iceberg Visualization:**
   - Visualização gráfica comparando o trabalho visível vs invisível.

4. **Lista de Entregas:**
   - Tabela limpa de features entregues.
