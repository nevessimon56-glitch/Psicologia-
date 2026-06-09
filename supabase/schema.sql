-- Schema para sistema de psicóloga
-- Execute no SQL Editor do Supabase

-- Perfil da psicóloga (vinculado ao auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  crp TEXT DEFAULT '',
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  whatsapp TEXT DEFAULT '',
  photo_url TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  specialties TEXT[] DEFAULT '{}',
  service_types TEXT[] DEFAULT ARRAY['presencial', 'online'],
  session_price DECIMAL(10,2) DEFAULT 200.00,
  session_duration_minutes INTEGER DEFAULT 50,
  cancellation_notice_hours INTEGER DEFAULT 24,
  working_hours JSONB DEFAULT '{
    "monday": {"start": "08:00", "end": "18:00", "enabled": true},
    "tuesday": {"start": "08:00", "end": "18:00", "enabled": true},
    "wednesday": {"start": "08:00", "end": "18:00", "enabled": true},
    "thursday": {"start": "08:00", "end": "18:00", "enabled": true},
    "friday": {"start": "08:00", "end": "18:00", "enabled": true},
    "saturday": {"start": "08:00", "end": "12:00", "enabled": false},
    "sunday": {"start": "08:00", "end": "12:00", "enabled": false}
  }'::jsonb,
  address TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pacientes
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  psychologist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  birth_date DATE,
  cpf TEXT DEFAULT '',
  address TEXT DEFAULT '',
  emergency_contact TEXT DEFAULT '',
  emergency_phone TEXT DEFAULT '',
  therapeutic_goals TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agendamentos
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  psychologist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  guest_name TEXT,
  guest_email TEXT,
  guest_phone TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  modality TEXT NOT NULL DEFAULT 'online' CHECK (modality IN ('presencial', 'online')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  confirmed_at TIMESTAMPTZ,
  confirmation_sent_at TIMESTAMPTZ,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bloqueio de horários
CREATE TABLE IF NOT EXISTS blocked_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  psychologist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  reason TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Anotações de sessão (prontuário - somente psicóloga)
CREATE TABLE IF NOT EXISTS session_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  psychologist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pagamentos
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  psychologist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  payment_method TEXT DEFAULT '',
  paid_at TIMESTAMPTZ,
  receipt_number TEXT,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_appointments_psychologist ON appointments(psychologist_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_patients_psychologist ON patients(psychologist_id);
CREATE INDEX IF NOT EXISTS idx_payments_psychologist ON payments(psychologist_id);
CREATE INDEX IF NOT EXISTS idx_payments_patient ON payments(patient_id);
CREATE INDEX IF NOT EXISTS idx_blocked_slots_psychologist ON blocked_slots(psychologist_id);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Profiles: psicóloga gerencia o próprio perfil; público lê perfil
CREATE POLICY "Public can read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Psychologist can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Psychologist can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Patients: somente psicóloga
CREATE POLICY "Psychologist manages patients" ON patients FOR ALL USING (auth.uid() = psychologist_id);

-- Appointments: psicóloga gerencia; público pode criar e ler próprios via service role em API
CREATE POLICY "Psychologist manages appointments" ON appointments FOR ALL USING (auth.uid() = psychologist_id);
CREATE POLICY "Public can create appointments" ON appointments FOR INSERT WITH CHECK (true);

-- Blocked slots: somente psicóloga
CREATE POLICY "Psychologist manages blocked slots" ON blocked_slots FOR ALL USING (auth.uid() = psychologist_id);

-- Session notes: somente psicóloga
CREATE POLICY "Psychologist manages session notes" ON session_notes FOR ALL USING (auth.uid() = psychologist_id);

-- Payments: somente psicóloga
CREATE POLICY "Psychologist manages payments" ON payments FOR ALL USING (auth.uid() = psychologist_id);

-- Trigger para criar perfil ao registrar
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Função para gerar número de recibo
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'REC-' || TO_CHAR(NOW(), 'YYYYMM') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;
