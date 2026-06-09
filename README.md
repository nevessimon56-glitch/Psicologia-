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

## Deploy

Recomendado: [Vercel](https://vercel.com) + Supabase.

1. Faça push para GitHub
2. Importe no Vercel
3. Configure as variáveis de ambiente
4. Deploy automático

## E-mail (opcional)

Para confirmações automáticas por e-mail, configure SMTP no `.env.local` ou integre Resend/SendGrid em `src/lib/notifications.ts`.

## Licença

Projeto personalizado para uso profissional.
