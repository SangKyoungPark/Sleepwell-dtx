-- ============================================
-- SleepWell DTx - Supabase Database Schema
-- ============================================
-- Supabase 대시보드 → SQL Editor에서 실행하세요

-- 1. 프로필 테이블
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  start_date DATE DEFAULT CURRENT_DATE,
  current_week INT DEFAULT 1 CHECK (current_week BETWEEN 1 AND 6),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 수면 일지 테이블
CREATE TABLE sleep_diary (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  -- 아침 기록
  bedtime TEXT,
  wake_time TEXT,
  sleep_onset_latency INT,   -- 분
  awakenings INT,
  waso INT,                   -- 분
  sleep_quality INT CHECK (sleep_quality BETWEEN 1 AND 5),
  morning_mood TEXT,
  total_sleep_time INT,       -- 분 (자동계산)
  sleep_efficiency INT,       -- % (자동계산)
  -- 저녁 기록
  stress_level INT CHECK (stress_level BETWEEN 1 AND 10),
  caffeine BOOLEAN DEFAULT FALSE,
  caffeine_last_time TEXT,
  exercise BOOLEAN DEFAULT FALSE,
  exercise_type TEXT,
  nap BOOLEAN DEFAULT FALSE,
  nap_duration INT,           -- 분
  worry_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)       -- 한 유저당 하루 1개
);

-- 3. 미션 체크 로그
CREATE TABLE mission_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mission_key TEXT NOT NULL,  -- "w1d1", "w3d5" 등
  completed BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, mission_key)
);

-- 4. CBT-I 세션 진행 상황
CREATE TABLE session_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  completed_sections JSONB DEFAULT '{}',
  practice_checks JSONB DEFAULT '{}',
  reflection_text JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ISI 자가진단 기록
CREATE TABLE assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scores INT[] NOT NULL,       -- 7개 점수
  total_score INT NOT NULL,
  severity TEXT NOT NULL,      -- none/mild/moderate/severe
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Row Level Security (RLS) — 개인 데이터 보호
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_diary ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- 본인 데이터만 접근 가능
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own diary"
  ON sleep_diary FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own diary"
  ON sleep_diary FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own diary"
  ON sleep_diary FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own diary"
  ON sleep_diary FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own missions"
  ON mission_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own missions"
  ON mission_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own missions"
  ON mission_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own missions"
  ON mission_logs FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own session progress"
  ON session_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own session progress"
  ON session_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own session progress"
  ON session_progress FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own assessments"
  ON assessments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own assessments"
  ON assessments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 트리거: 회원가입 시 프로필 자동 생성
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 인덱스
-- ============================================

CREATE INDEX idx_sleep_diary_user_date ON sleep_diary(user_id, date DESC);
CREATE INDEX idx_mission_logs_user ON mission_logs(user_id);
CREATE INDEX idx_assessments_user ON assessments(user_id, created_at DESC);

-- ============================================
-- 6. AI 코치 채팅 메시지
-- ============================================

CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id TEXT NOT NULL,           -- 대화 세션 구분
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat messages"
  ON chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chat messages"
  ON chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own chat messages"
  ON chat_messages FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_chat_messages_user_session ON chat_messages(user_id, session_id, created_at ASC);
