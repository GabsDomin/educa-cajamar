# Educa Cajamar

Projeto desenvolvido por **Gabriel Domingues Fernandes**.

O Educa Cajamar é uma aplicação web para mapear instituições, escolas e atividades educacionais no município de Cajamar/SP. A plataforma permite consultar unidades no mapa, visualizar detalhes das instituições, encontrar atividades, acompanhar indicadores por bairro e administrar cadastros.

## Objetivo

Centralizar informações educacionais de Cajamar em uma interface simples de consulta, ajudando moradores, estudantes, famílias e gestores a encontrar escolas, centros culturais, atividades gratuitas e oportunidades próximas.

## Tecnologias

- React
- TypeScript
- Vite
- Tailwind CSS
- Leaflet
- Recharts
- Express
- PostgreSQL
- Supabase
- Railway

## Estrutura Do Projeto

```txt
backend/
  db.json              Dados iniciais usados somente quando o banco está vazio
  server.js            API Express, conexão PostgreSQL e servidor de produção

public/
  cajamar-logo.gif     Favicon do projeto

src/
  app/
    components/        Componentes reutilizáveis da interface
    data/              Helpers e dados auxiliares
    pages/             Telas principais do sistema
    services/          Cliente HTTP da API
    utils/             Funções utilitárias
    types.ts           Tipagens principais
    App.tsx            Controle simples de navegação interna
  main.tsx             Entrada do React
  styles/              Arquivos de estilo global

railway.json           Configuração de build/deploy na Railway
package.json           Scripts, dependências e metadados do projeto
```

## Funcionalidades

### Mapa

A tela principal exibe um mapa de Cajamar com marcadores para instituições cadastradas.

Recursos:

- busca por escola, bairro, rua ou atividade;
- filtros por categoria;
- marcador colorido conforme o tipo da instituição;
- seleção de instituição no mapa;
- painel lateral com detalhes da unidade;
- botão de detalhes nos cards;
- foco automático no mapa ao selecionar uma unidade.

### Instituições

Lista instituições educacionais, culturais, esportivas e sociais.

Recursos:

- busca por nome, tipo ou bairro;
- filtro por tipo de instituição;
- filtro por bairro;
- botão **Ver detalhes**, que abre a unidade no mapa com o detalhamento;
- botão de localização, que abre o mapa focado na instituição.

### Atividades

Lista atividades educacionais e culturais cadastradas.

Recursos:

- busca por atividade, categoria ou bairro;
- filtros por categoria;
- filtro por bairro;
- botão **Ver instituição**, que abre a instituição relacionada no mapa.

### Analítico

Exibe indicadores e gráficos com base nos dados cadastrados.

Indicadores tratados:

- total de instituições;
- atividades;
- bairros atendidos;
- avaliação média;
- distribuição por bairro;
- distribuição por tipo.

### Administração

Área para gerenciar instituições e atividades.

Recursos:

- cadastro de instituições;
- edição de instituições;
- alteração de status;
- cadastro de atividades;
- edição de atividades;
- alteração de status das atividades.

## Detalhamento Da Instituição

O painel de detalhes da instituição fica na tela de mapa.

Ele exibe:

- imagem da instituição, quando existir `image_url`;
- nome;
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
- atividades disponíveis;
- desempenho escolar, apenas para escolas.

## Imagem Da Instituição

Cada instituição pode ter uma imagem exibida no topo do detalhamento.

Campo no banco:

```sql
image_url TEXT
```

Exemplo para preencher:

```sql
UPDATE institutions
SET image_url = 'https://url-da-imagem-aqui'
WHERE id = 'id-da-instituicao';
```

Para consultar:

```sql
SELECT id, name, image_url
FROM institutions
ORDER BY name;
```

## Score Educa Cajamar

O **Score Educa Cajamar** aparece somente no detalhamento de instituições do tipo `Escola`.

Se a instituição não for escola, a seção não é exibida.

### Campos Usados

Campos esperados no registro da instituição:

```txt
nota_portugues_saresp
nota_matematica_saresp
ano_base
taxa_aprovacao
taxa_evolucao
```

O score não é preenchido manualmente. Ele é calculado automaticamente no frontend pela função:

```txt
src/app/utils/scoreEducaCajamar.ts
```

### Regra De Cálculo

O score vai de 0 a 1000 pontos:

- Português: até 300 pontos;
- Matemática: até 300 pontos;
- Taxa de aprovação: até 200 pontos;
- Taxa de evolução: até 200 pontos.

Cálculo:

```txt
pontos_portugues = nota_portugues_saresp * 30
pontos_matematica = nota_matematica_saresp * 30
pontos_aprovacao = taxa_aprovacao * 2
```

Pontuação da evolução:

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

Se faltar algum dado obrigatório, o sistema não calcula score falso e exibe a mensagem:

```txt
Esta escola ainda não possui dados suficientes para cálculo do Score Educa Cajamar.
```

## Banco De Dados

O projeto usa PostgreSQL via Supabase.

A conexão é feita pela variável de ambiente:

```txt
DATABASE_URL
```

O backend também aceita:

```txt
DATABASE_SSL=false
```

Somente use `DATABASE_SSL=false` em ambiente local se necessário. Em produção, o padrão é usar SSL.

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

### Criação Automática De Colunas

Ao iniciar, o backend executa `CREATE TABLE IF NOT EXISTS` e `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` para manter compatibilidade com bancos já existentes.

Isso evita quebrar dados antigos quando novos campos são adicionados.

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

## Como Rodar Localmente

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env` local ou configure as variáveis no terminal:

```txt
DATABASE_URL=postgresql://...
```

### 3. Rodar em desenvolvimento

```bash
npm run dev
```

Esse comando inicia:

- backend Express;
- frontend Vite.

### 4. Gerar build de produção

```bash
npm run build
```

### 5. Rodar produção local

```bash
npm start
```

## Deploy

O projeto está preparado para deploy na Railway.

Arquivo de configuração:

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

Variável obrigatória na Railway:

```txt
DATABASE_URL
```

## Supabase

O Supabase é usado como banco PostgreSQL.

Para alimentar dados manualmente, use o **SQL Editor** do Supabase.

Exemplo de atualização dos dados escolares:

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

Exemplo para listar escolas:

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

## Scripts

```txt
npm run dev       Inicia frontend e backend em desenvolvimento
npm run build     Gera build de produção
npm run preview   Visualiza build do Vite
npm run server    Inicia somente o backend
npm start         Inicia o servidor em produção
```

## Observações De Manutenção

- Não versionar senhas reais.
- Não colocar `DATABASE_URL` no código.
- Usar variáveis de ambiente na Railway.
- Manter alterações de layout sempre pequenas e compatíveis com o padrão visual atual.
- Antes de mexer em banco, conferir os nomes das colunas no Supabase.
- O arquivo `backend/db.json` é usado apenas para seed inicial quando a tabela de instituições está vazia.

## Autor

**Gabriel Domingues Fernandes**
