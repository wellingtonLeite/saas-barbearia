# SaaS de Barbearia ✂️

Bem-vindo ao **SaaS de Barbearia**, um sistema de gestão inteligente e multitenant criado especificamente para barbearias, permitindo que múltiplos donos gerenciem suas lojas, equipe de barbeiros, clientes e finanças, tudo a partir de um único software em nuvem.

## 🌟 Funcionalidades Principais

- **Multitenant Completo:** Uma instância de banco de dados suporta infinitas barbearias (`Tenants`).
- **Sistema de Assinaturas (Planos):**
  - *Plano Navalha:* Controle de agendamentos e agenda da equipe (até 2 barbeiros).
  - *Plano Máquina de Corte:* Tudo do anterior + Controle Financeiro de Contas a Pagar e Receber + Envio de Mensagens de WhatsApp (até 10 barbeiros).
  - *Plano Tesoura de Ouro:* Tudo do anterior + Dashboard BI Avançado com gráficos de faturamento, metas, top barbeiros e ranking de serviços (até 50 barbeiros).
- **Painel Super Admin:** O dono do sistema possui um painel exclusivo (`/super-admin`) para gerenciar as barbearias ativas, criar novos planos de assinatura e monitorar a saúde geral da infraestrutura.
- **Sistema Inteligente de Notificações:** Avisos em tempo real com alertas visuais e sonoros para o barbeiro e para o dono da barbearia sempre que houver um novo agendamento ou uma conta estiver perto de vencer.
- **Point of Sale (PDV):** Checkout de serviços integrado, cálculo automático de comissões por profissional, e controle simplificado de estoque de produtos físicos.

## 🛠 Integrações (Open Source Ready)

Para garantir que o código seja seguro e adequado para a comunidade Open Source, **não há chaves de API "chumbadas" (hardcoded) no código-fonte**. As integrações dependem do banco de dados ou de variáveis de ambiente.

- **Gateway de Pagamento (Mercado Pago):** A chave de API (Access Token) não deve ser colocada no `.env`. Ela é inserida diretamente pela interface do painel do *Super Admin* e é armazenada com segurança na tabela `GatewayConfig` do banco de dados.
- **WhatsApp API:** As automações de mensagens usam templates definidos pelo dono da barbearia diretamente pelo painel `/dashboard/config/whatsapp`, guardados como um JSON nativo no banco.

## 🚀 Como Rodar o Projeto (Local)

### Pré-requisitos
- Node.js v18+ 
- PostgreSQL (Recomendamos o Neon DB)

### Passos para Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/wellingtonLeite/saas-barbearia.git
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure o arquivo de ambiente:
   - Copie o arquivo `.env.example` e renomeie para `.env`.
   - Adicione a string de conexão do seu PostgreSQL em `DATABASE_URL`.
   - Gere um hash para a sua variável `AUTH_SECRET` (recomendado: `openssl rand -base64 32`).

4. Sincronize o Banco de Dados com o Prisma:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Inicialize o banco de dados (Seeding):
   Opcionalmente, você pode criar o primeiro *Super Admin* inserindo manualmente no banco ou rodando um script de inicialização customizado.

6. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## 💻 Stack Tecnológica
- **Framework:** Next.js 16 (App Router + Turbopack)
- **Estilização:** Tailwind CSS v4 + Lucide Icons
- **Banco de Dados:** PostgreSQL (via Prisma ORM e Neon serverless driver)
- **Autenticação:** NextAuth.js (Auth.js v5) com bcryptjs para hash de senhas
- **Estado de UI:** React 19 (Hooks, Server Components, Server Actions)

---
*Criado por Wellington Leite. Licença MIT.*
