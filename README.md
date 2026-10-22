# Consultório — Sistema para Psicólogas

Sistema web completo para psicólogas que atendem presencial e online. Inclui agenda, agendamento pelo paciente, financeiro, prontuário e site profissional.

## Funcionalidades

### Agenda e Agendamentos
- Calendário semanal e mensal
- Agendamento online pelo paciente (`/agendar`)
- Confirmação automática por e-mail (e link WhatsApp)
- Bloqueio de horários
- Controle de faltas, cancelamentos e antecedência mínima configurável

### Financeiro
- Controle de sessões pagas e pendentes
- Geração de recibo simples (impressão/PDF)
- Histórico financeiro por paciente
- Relatório mensal de faturamento

### Prontuário
- Ficha cadastral completa
- Anotações por sessão (acesso restrito à psicóloga)
- Histórico de atendimentos
- Campo para objetivos terapêuticos

### Site Profissional
- Página pública com foto, bio e especialidades
- Formas de atendimento (presencial/online)
- Botão de agendamento e link WhatsApp

## Stack

- **Next.js 16** (App Router)
- **Supabase** (autenticação + banco PostgreSQL)
- **Tailwind CSS 4**
- **TypeScript**

## Configuração

### 1. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um projeto
2. No SQL Editor, execute o arquivo `supabase/schema.sql`
3. Em Authentication → Settings, habilite e-mail/senha

### 2. Variáveis de ambiente

Copie `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Preencha com as credenciais do Supabase (Settings → API):

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
NEXT_PUBLIC_PSYCHOLOGIST_ID=uuid-da-psicologa
```

> O `NEXT_PUBLIC_PSYCHOLOGIST_ID` é o UUID do usuário após o primeiro cadastro. Encontre em Authentication → Users.

### 3. Instalar e executar

```bash
npm install
npm run dev
```

Acesse:
- **Site público:** http://localhost:3000
- **Agendamento:** http://localhost:3000/agendar
- **Login psicóloga:** http://localhost:3000/login

### 4. Primeiro acesso

1. Acesse `/login` e clique em **Criar conta**
2. Confirme o e-mail (se configurado no Supabase)
3. Faça login e configure seu perfil em **Configurações**
4. Copie seu UUID para `NEXT_PUBLIC_PSYCHOLOGIST_ID` no `.env.local`

## Estrutura

```
src/
├── app/
│   ├── page.tsx              # Site profissional
│   ├── agendar/              # Agendamento do paciente
│   ├── login/                # Autenticação
│   ├── dashboard/            # Área da psicóloga
│   │   ├── agenda/
│   │   ├── pacientes/
│   │   ├── financeiro/
│   │   └── configuracoes/
│   └── api/                  # Endpoints REST
├── components/
│   ├── calendar/
│   ├── dashboard/
│   ├── public/
│   └── ui/
└── lib/
    ├── supabase/
    ├── data.ts
    ├── types.ts
    └── utils.ts
```

## Deploy no Render

O projeto já vem pronto para o [Render](https://render.com). Não é preciso alterar o código.

### Passo a passo

1. **Supabase** — crie o projeto e execute `supabase/schema.sql` (se ainda não fez)

2. **Render** — acesse [dashboard.render.com](https://dashboard.render.com) → **New** → **Blueprint**
   - Conecte o repositório GitHub
   - O Render detecta o `render.yaml` automaticamente

3. **Variáveis de ambiente** — no painel do serviço, preencha:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_PSYCHOLOGIST_ID` (UUID da psicóloga, após criar a conta)

4. **Supabase Auth** — em Authentication → URL Configuration, adicione a URL do Render:
   - **Site URL:** `https://seu-app.onrender.com`
   - **Redirect URLs:** `https://seu-app.onrender.com/**`

5. Aguarde o deploy. A URL ficará algo como `https://psicologa-consultorio.onrender.com`

### Deploy manual (sem Blueprint)

Se preferir criar o Web Service manualmente:

| Campo | Valor |
|-------|-------|
| Runtime | Node |
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |

### Observação (plano gratuito)

No plano free, o serviço “dorme” após inatividade e a primeira visita pode demorar ~30s para responder. Para uso profissional contínuo, considere o plano pago.

## Deploy na Vercel (alternativa)

1. Faça push para GitHub
2. Importe no [Vercel](https://vercel.com)
3. Configure as mesmas variáveis de ambiente
4. Deploy automático

## E-mail (opcional)

Para confirmações automáticas por e-mail, configure SMTP no `.env.local` ou integre Resend/SendGrid em `src/lib/notifications.ts`.

## Licença

Projeto personalizado para uso profissional.
