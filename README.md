# Educa Cajamar

Projeto desenvolvido por **Gabriel Domingues Fernandes**.

O **Educa Cajamar** é uma aplicação web para mapear escolas, instituições públicas, espaços culturais, atividades educacionais e oportunidades gratuitas no município de Cajamar/SP.

A proposta do sistema é reunir, em um único lugar, informações úteis para a população: onde ficam as instituições, quais atividades existem, quais bairros possuem maior cobertura educacional, quais escolas já possuem dados de desempenho e como encontrar oportunidades próximas.

## Sumário

- [Objetivo](#objetivo)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Funcionalidades](#funcionalidades)
- [Mapa e Detalhamento](#mapa-e-detalhamento)
- [Imagens e Google 360](#imagens-e-google-360)
- [Score Educa Cajamar](#score-educa-cajamar)
- [Aba Analítico](#aba-analítico)
- [Assistente Educa com IA](#assistente-educa-com-ia)
- [Banco de Dados](#banco-de-dados)
- [API](#api)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Como Rodar Localmente](#como-rodar-localmente)
- [Deploy na Railway](#deploy-na-railway)
- [Como Alimentar Dados no Supabase](#como-alimentar-dados-no-supabase)
- [Manutenção](#manutenção)
- [Autor](#autor)

## Objetivo

O objetivo do Educa Cajamar é facilitar o acesso público a informações educacionais e culturais do município.

O sistema ajuda a responder perguntas como:

- Quais escolas existem em determinado bairro?
- Quais atividades gratuitas estão disponíveis?
- Onde fica uma instituição?
- Qual bairro possui maior ou menor cobertura educacional?
- Quais escolas possuem dados de desempenho?
- Qual escola tem melhor Score Educa Cajamar?
- Quais atividades ainda possuem vagas?

## Tecnologias

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Leaflet
- Recharts
- Lucide React

### Backend

- Node.js
- Express
- PostgreSQL
- `pg`
- Nanoid

### Banco e Deploy

- Supabase Postgres
- Railway
- GitHub

### IA

- Google Gemini API
- Rota backend própria para proteger a chave

## Arquitetura

O projeto funciona como uma aplicação full-stack simples:

```txt
Usuário
  ↓
React/Vite
  ↓
API Express
  ↓
Supabase PostgreSQL
```

Para IA:

```txt
Usuário pergunta no site
  ↓
Frontend chama POST /api/ai/ask
  ↓
Backend consulta Supabase
  ↓
Backend monta contexto público
  ↓
Backend chama Gemini
  ↓
Resposta volta para o site
```

Importante: a chave da Gemini e a conexão com o banco ficam somente no backend/Railway. Elas não são expostas no navegador.

## Estrutura do Projeto

```txt
backend/
  db.json
  server.js

public/
  cajamar-logo.gif

src/
  app/
    components/
      ActivityCard.tsx
      ActivityForm.tsx
      AIAssistant.tsx
      FilterChips.tsx
      Header.tsx
      InstitutionCard.tsx
      InstitutionForm.tsx
      KPICard.tsx
      MapView.tsx
      SearchBar.tsx
    data/
      mockData.ts
    pages/
      ActivitiesPage.tsx
      AdminPage.tsx
      AnalyticsPage.tsx
      HomePage.tsx
      InstitutionsPage.tsx
    services/
      api.ts
    utils/
      scoreEducaCajamar.ts
    App.tsx
    types.ts
  main.tsx
  styles/

railway.json
package.json
README.md
```

## Funcionalidades

### Mapa

A tela principal apresenta o mapa de Cajamar com marcadores das instituições cadastradas.

Recursos:

- busca por escola, bairro, rua ou atividade;
- filtros por categoria;
- marcadores coloridos por tipo de instituição;
- destaque visual do marcador selecionado;
- zoom automático em nível de rua ao selecionar uma instituição;
- centralização da localização selecionada no mapa;
- retorno ao enquadramento geral ao fechar o detalhamento;
- painel lateral com resultados e detalhes.

### Instituições

Tela para listar instituições cadastradas.

Recursos:

- busca por nome, tipo ou bairro;
- filtro por tipo;
- filtro por bairro;
- botão **Ver detalhes**;
- botão de localização;
- integração com mapa para abrir a instituição selecionada.

### Atividades

Tela para listar atividades educacionais, culturais e esportivas.

Recursos:

- busca por atividade, categoria ou bairro;
- filtros por categoria;
- filtro por bairro;
- indicação de vagas;
- indicação de atividade gratuita;
- botão **Ver instituição**.

### Administração

Tela para gerenciar cadastros.

Recursos:

- visão geral;
- cadastro e edição de instituições;
- cadastro e edição de atividades;
- alteração de status;
- busca administrativa;
- tabelas com rolagem horizontal em telas menores.

## Responsividade

O sistema foi adaptado para desktop, tablet e celular.

Adaptações principais:

- header mais compacto em telas menores;
- navegação inferior no celular;
- chips de filtro com rolagem horizontal no mobile;
- mapa e painel lateral empilhados no celular;
- tabelas administrativas com rolagem lateral;
- títulos e espaçamentos ajustados por breakpoint;
- preservação do visual original do projeto.

## Mapa e Detalhamento

O detalhamento da instituição fica na tela do mapa.

Ele pode exibir:

- mídia no topo;
- nome da instituição;
- tipo;
- avaliação;
- endereço;
- telefone;
- e-mail;
- horário de funcionamento;
- descrição;
- público-alvo;
- gratuidade;
- acessibilidade;
- responsável;
- desempenho escolar, somente para escolas;
- atividades disponíveis.

### Seleção no mapa

Quando uma instituição é selecionada:

- o marcador muda para destaque laranja/amarelo;
- o marcador fica maior;
- o mapa centraliza a coordenada;
- o mapa aproxima em nível de rua.

Quando o detalhamento é fechado:

- o marcador volta à cor original;
- a seleção é removida;
- o mapa volta ao enquadramento geral das unidades filtradas.

## Imagens e Google 360

O sistema suporta duas formas de mídia no topo do detalhamento:

1. imagem estática;
2. Google Street View/Maps 360 incorporado.

### Prioridade de exibição

O sistema usa a seguinte ordem:

```txt
1. google_360_url
2. image_url
3. sem mídia
```

Ou seja:

- se `google_360_url` estiver preenchido, o sistema mostra o 360;
- se não houver `google_360_url`, mas houver `image_url`, mostra a imagem;
- se nenhum campo estiver preenchido, não mostra mídia.

### Campos

```txt
image_url
google_360_url
```

### Exemplo de imagem

```sql
UPDATE institutions
SET image_url = 'https://url-da-imagem-aqui'
WHERE id = 'id-da-instituicao';
```

### Exemplo de Google 360

No Google Maps:

1. abra a instituição;
2. entre no Street View;
3. clique em compartilhar;
4. escolha incorporar mapa;
5. copie somente o valor do `src`;
6. salve esse valor em `google_360_url`.

```sql
UPDATE institutions
SET google_360_url = 'https://www.google.com/maps/embed?...'
WHERE id = 'id-da-instituicao';
```

Observação: os controles internos do Google, como bússola, zoom, nome da rua e logo, pertencem ao iframe do Google e não podem ser removidos por CSS do projeto.

## Score Educa Cajamar

O **Score Educa Cajamar** é um indicador calculado automaticamente para instituições do tipo `Escola`.

Ele aparece somente no detalhamento de escolas.

Se a instituição não for escola:

- a seção não aparece;
- nenhum score é calculado;
- nenhum dado escolar é exibido.

### Campos usados

```txt
nota_portugues_saresp
nota_matematica_saresp
ano_base
taxa_aprovacao
taxa_evolucao
```

### Arquivo da regra

```txt
src/app/utils/scoreEducaCajamar.ts
```

### Cálculo

O score vai de 0 a 1000 pontos:

```txt
Português: até 300 pontos
Matemática: até 300 pontos
Aprovação: até 200 pontos
Evolução: até 200 pontos
```

Fórmula:

```txt
pontos_portugues = nota_portugues_saresp * 30
pontos_matematica = nota_matematica_saresp * 30
pontos_aprovacao = taxa_aprovacao * 2
```

Evolução:

```txt
taxa_evolucao >= 10       => 200 pontos
taxa_evolucao >= 5        => 160 pontos
taxa_evolucao >= 1        => 120 pontos
taxa_evolucao == 0        => 100 pontos
taxa_evolucao >= -4.9     => 60 pontos
taxa_evolucao <= -5       => 20 pontos
```

Classificação:

```txt
850 a 1000 => Excelente
700 a 849  => Boa
500 a 699  => Regular
0 a 499    => Em atenção
```

Se algum dado obrigatório estiver ausente, o sistema mostra:

```txt
Esta escola ainda não possui dados suficientes para cálculo do Score Educa Cajamar.
```

## Aba Analítico

A aba **Analítico** é dinâmica e usa dados do Supabase por meio da API.

Endpoints usados:

```txt
GET /api/institutions
GET /api/activities
GET /api/neighborhoods
```

### Recursos atuais

- filtros por bairro;
- busca por bairro, instituição, tipo ou atividade;
- total de escolas encontradas;
- atividades abertas;
- vagas disponíveis;
- percentual de atividades gratuitas;
- score médio escolar;
- bairro com maior cobertura educacional;
- melhor Score Educa Cajamar;
- instituição mais avaliada;
- gráfico de oferta por tipo de instituição;
- gráfico de atividades por categoria;
- gráfico de vagas abertas por categoria;
- gráfico de cobertura educacional por bairro;
- bairros que merecem atenção;
- ranking do Score Educa Cajamar;
- atividades gratuitas com vagas;
- escolas com dados escolares completos;
- escolas sem score.

### Dados dinâmicos

A aba muda conforme o banco muda.

Ela depende principalmente de:

- instituições cadastradas;
- atividades cadastradas;
- bairros;
- vagas;
- status das atividades;
- gratuidade;
- notas SARESP;
- aprovação;
- evolução;
- ano-base.

## Assistente Educa com IA

O botão **Perguntar à IA** usa a Gemini API por meio do backend.

### Fluxo

```txt
Usuário pergunta
  ↓
Frontend chama POST /api/ai/ask
  ↓
Backend consulta Supabase
  ↓
Backend monta contexto público
  ↓
Backend chama Gemini
  ↓
Resposta volta para o frontend
```

### Segurança

A chave da Gemini fica somente na Railway:

```txt
GEMINI_API_KEY
```

Ela não fica no React e não aparece no navegador.

### Modelo

O backend usa por padrão:

```txt
gemini-2.5-flash-lite
```

Também é possível configurar outro modelo com:

```txt
GEMINI_MODEL
```

### Rota

```txt
POST /api/ai/ask
```

Body:

```json
{
  "question": "Quais atividades gratuitas estão abertas?"
}
```

Resposta:

```json
{
  "answer": "Resposta gerada com base nos dados públicos do Educa Cajamar."
}
```

### Limites e fallback

O backend:

- exige pergunta preenchida;
- limita a pergunta a 500 caracteres;
- envia apenas um resumo público do banco;
- instrui a IA a não inventar dados;
- retorna mensagem amigável se a IA falhar.

Exemplos de perguntas:

```txt
Quais escolas existem no Jordanésia?
Quais atividades gratuitas estão abertas?
Qual escola tem melhor Score Educa Cajamar?
Quais bairros têm menos cobertura educacional?
```

## Banco de Dados

O banco usado é PostgreSQL via Supabase.

### Tabela institutions

Campos principais:

```txt
id
name
type
rating
address
street
number
neighborhood
city
state
phone
email
image_url
google_360_url
description
opening_hours
target_audience
is_free
accessibility
responsible
status
last_update
lat
lng
school_network
school_levels
school_shifts
infrastructure
nota_portugues_saresp
nota_matematica_saresp
ano_base
taxa_aprovacao
taxa_evolucao
```

### Tabela activities

Campos principais:

```txt
id
name
institution_id
institution_name
category
description
week_days
start_time
end_time
target_audience
age_range
is_free
available_slots
total_slots
status
enrollment_info
instructor
neighborhood
```

### Migração automática

O backend executa comandos `CREATE TABLE IF NOT EXISTS` e `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`.

Isso permite adicionar novos campos sem quebrar bancos já existentes.

## API

A API é servida pelo Express no mesmo domínio da aplicação.

### Instituições

```txt
GET    /api/institutions
POST   /api/institutions
PUT    /api/institutions/:id
PATCH  /api/institutions/:id/status
```

### Atividades

```txt
GET    /api/activities
POST   /api/activities
PUT    /api/activities/:id
PATCH  /api/activities/:id/status
```

### Bairros

```txt
GET /api/neighborhoods
```

### IA

```txt
POST /api/ai/ask
```

## Variáveis de Ambiente

### Obrigatórias

```txt
DATABASE_URL
```

### Recomendadas

```txt
GEMINI_API_KEY
```

### Opcionais

```txt
DATABASE_SSL=false
GEMINI_MODEL=gemini-2.5-flash-lite
PORT=3001
```

Observação: em produção, normalmente não é necessário definir `DATABASE_SSL=false`.

## Como Rodar Localmente

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis

Crie um `.env` local ou defina no terminal:

```txt
DATABASE_URL=postgresql://...
GEMINI_API_KEY=...
```

### 3. Rodar em desenvolvimento

```bash
npm run dev
```

Esse comando inicia:

- backend Express;
- frontend Vite.

### 4. Gerar build

```bash
npm run build
```

### 5. Rodar em produção local

```bash
npm start
```

## Deploy na Railway

O projeto está configurado para Railway pelo arquivo:

```txt
railway.json
```

Build:

```bash
npm run build
```

Start:

```bash
npm start
```

Variáveis necessárias na Railway:

```txt
DATABASE_URL
GEMINI_API_KEY
```

Depois de alterar variáveis, faça redeploy se a Railway não reiniciar automaticamente.

## Como Alimentar Dados no Supabase

### Listar instituições

```sql
SELECT id, name, type, neighborhood
FROM institutions
ORDER BY name;
```

### Inserir imagem

```sql
UPDATE institutions
SET image_url = 'https://url-da-imagem-aqui'
WHERE id = 'id-da-instituicao';
```

### Inserir Google 360

```sql
UPDATE institutions
SET google_360_url = 'https://www.google.com/maps/embed?...'
WHERE id = 'id-da-instituicao';
```

### Inserir dados escolares

```sql
UPDATE institutions
SET
  nota_portugues_saresp = 7.8,
  nota_matematica_saresp = 6.9,
  ano_base = 2025,
  taxa_aprovacao = 92,
  taxa_evolucao = 10.7
WHERE id = 'id-da-escola';
```

### Consultar escolas com dados de score

```sql
SELECT
  id,
  name,
  nota_portugues_saresp,
  nota_matematica_saresp,
  ano_base,
  taxa_aprovacao,
  taxa_evolucao
FROM institutions
WHERE type = 'Escola'
ORDER BY name;
```

### Atualizar vagas de atividade

```sql
UPDATE activities
SET available_slots = 20,
    total_slots = 30,
    status = 'Aberta'
WHERE id = 'id-da-atividade';
```

## Scripts

```txt
npm run dev       Inicia frontend e backend em desenvolvimento
npm run build     Gera build de produção
npm run preview   Visualiza build do Vite
npm run server    Inicia somente o backend
npm start         Inicia o servidor em produção
```

## Manutenção

Boas práticas:

- não versionar senhas;
- não colocar `DATABASE_URL` no código;
- não colocar `GEMINI_API_KEY` no frontend;
- manter chaves apenas em variáveis de ambiente;
- revisar logs da Railway quando IA ou banco falharem;
- alimentar o Supabase com dados completos para melhorar a aba Analítico;
- manter mudanças visuais compatíveis com o estilo atual;
- usar `image_url` como fallback quando não houver Google 360;
- usar `google_360_url` somente com URL de embed do Google;
- preencher dados SARESP para ativar o Score Educa Cajamar.

## Histórico de Recursos Implementados

- restauração do visual original do Educa Cajamar;
- deploy via Railway;
- migração para Supabase PostgreSQL;
- suporte a imagem por instituição;
- suporte a Google 360 no detalhamento;
- Score Educa Cajamar;
- destaque visual do marcador selecionado;
- zoom e centralização em nível de rua;
- reset do mapa ao fechar detalhe;
- responsividade para celular e tablet;
- aba Analítico dinâmica;
- Assistente Educa com Gemini;
- documentação do projeto.

## Autor

**Gabriel Domingues Fernandes**
