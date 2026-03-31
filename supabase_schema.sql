-- ============================================
-- AtoC IELTS Platform - Supabase Schema
-- Вставь весь этот код в SQL Editor в Supabase
-- ============================================

-- 1. Профили пользователей (студенты + учитель)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'student', -- 'student' или 'teacher'
  current_level TEXT DEFAULT 'A',       -- 'A', 'B', 'C'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Уроки (60 штук: A1-A20, B1-B20, C1-C20)
CREATE TABLE lessons (
  id SERIAL PRIMARY KEY,
  level TEXT NOT NULL,        -- 'A', 'B', 'C'
  lesson_number INTEGER NOT NULL, -- 1-20
  title TEXT NOT NULL,
  grammar_topic TEXT,
  pdf_url TEXT,               -- ссылка на PDF в Supabase Storage
  order_index INTEGER NOT NULL, -- глобальный порядок: A1=1, A2=2... C20=60
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(level, lesson_number)
);

-- 3. Прогресс студента по урокам
CREATE TABLE progress (
  id SERIAL PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed'
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, lesson_id)
);

-- 4. Задания (эссе и другие)
CREATE TABLE submissions (
  id SERIAL PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL,    -- 'essay', 'task1', 'task2', 'exercise'
  content TEXT NOT NULL,      -- текст эссе/ответа студента
  status TEXT DEFAULT 'pending', -- 'pending', 'reviewed'
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- 5. Фидбэк учителя
CREATE TABLE feedback (
  id SERIAL PRIMARY KEY,
  submission_id INTEGER REFERENCES submissions(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  score INTEGER,              -- оценка 1-9 (IELTS band)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ДАННЫЕ: 59 уроков
-- ============================================

INSERT INTO lessons (level, lesson_number, title, grammar_topic, order_index) VALUES
-- УРОВЕНЬ A
('A', 1,  'A1 · Absolute Beginner', 'To Be (am/is/are) · Артикли a/an/the', 1),
('A', 2,  'A2 · Absolute Beginner', 'Существительные ед./мн. число · This/That/These/Those', 2),
('A', 3,  'A3 · Absolute Beginner', 'Present Simple (I/You/We/They) · Do/Don''t', 3),
('A', 4,  'A4 · Absolute Beginner', 'Present Simple (He/She/It) · Does/Doesn''t', 4),
('A', 5,  'A5 · Absolute Beginner', 'Have/Has Got · Can/Can''t · Предлоги места', 5),
('A', 6,  'A6 · Absolute Beginner', 'Present Continuous · am/is/are + -ing', 6),
('A', 7,  'A7 · Уровень A', 'Past Simple (правильные глаголы)', 7),
('A', 8,  'A8 · Уровень A', 'Past Simple (неправильные глаголы)', 8),
('A', 9,  'A9 · Уровень A', 'Going to · планы и намерения', 9),
('A', 10, 'A10 · Уровень A', 'Comparatives · короткие прилагательные', 10),
('A', 11, 'A11 · Уровень A', 'Present Perfect', 11),
('A', 12, 'A12 · Уровень A', 'Present Perfect · for и since', 12),
('A', 13, 'A13 · Уровень A', 'must и have to · обязательство', 13),
('A', 14, 'A14 · Уровень A', 'First Conditional', 14),
('A', 15, 'A15 · Уровень A', 'Second Conditional', 15),
('A', 16, 'A16 · Уровень A', 'Passive Voice · Present Simple', 16),
('A', 17, 'A17 · Уровень A', 'Past Perfect', 17),
('A', 18, 'A18 · Уровень A', 'Reported Speech · Косвенная речь', 18),
('A', 19, 'A19 · Уровень A', 'Cause & Effect · Причина и следствие', 19),
('A', 20, 'A20 · Финал уровня A 🏆', 'Повторение A1–A19 · Все грамматические темы', 20),
-- УРОВЕНЬ B
('B', 1,  'B1 · Intermediate', 'Present Perfect Continuous', 21),
('B', 2,  'B2 · Intermediate', 'Past Continuous', 22),
('B', 3,  'B3 · Intermediate', 'Future Continuous', 23),
('B', 4,  'B4 · Intermediate', 'Passive Voice · Present/Past Simple', 24),
('B', 5,  'B5 · Intermediate', 'Third Conditional', 25),
('B', 6,  'B6 · Intermediate', 'Mixed Conditionals', 26),
('B', 7,  'B7 · Intermediate', 'Reported Speech · продвинутый', 27),
('B', 8,  'B8 · Intermediate', 'Relative Clauses · defining/non-defining', 28),
('B', 9,  'B9 · Intermediate', 'Gerunds & Infinitives', 29),
('B', 10, 'B10 · Intermediate', 'Modal Verbs · дедукция в настоящем', 30),
('B', 11, 'B11 · Intermediate', 'Cause & Effect · базовые связки', 31),
('B', 12, 'B12 · Intermediate', 'Comparatives продвинутый', 32),
('B', 13, 'B13 · Intermediate', 'Advanced Passive Voice', 33),
('B', 14, 'B14 · Intermediate', 'Noun Clauses с that', 34),
('B', 15, 'B15 · Intermediate', 'What-Cleft Sentences', 35),
('B', 16, 'B16 · Intermediate', 'Active Participle Clauses · -ing', 36),
('B', 17, 'B17 · Intermediate', 'Hedging · академическая осторожность', 37),
('B', 18, 'B18 · Intermediate', 'B18 · продвинутая грамматика', 38),
('B', 19, 'B19 · Intermediate', 'B19 · продвинутая грамматика', 39),
('B', 20, 'B20 · Финал уровня B 🏆', 'Повторение B1–B19 · Task 1 + Task 2', 40),
-- УРОВЕНЬ C
('C', 1,  'C1 · Advanced', 'C1 · продвинутые структуры', 41),
('C', 2,  'C2 · Advanced', 'C2 · продвинутые структуры', 42),
('C', 3,  'C3 · Advanced', 'C3 · продвинутые структуры', 43),
('C', 4,  'C4 · Advanced', 'C4 · продвинутые структуры', 44),
('C', 5,  'C5 · Advanced', 'C5 · продвинутые структуры', 45),
('C', 6,  'C6 · Advanced', 'C6 · продвинутые структуры', 46),
('C', 7,  'C7 · Advanced', 'C7 · продвинутые структуры', 47),
('C', 8,  'C8 · Advanced', 'C8 · продвинутые структуры', 48),
('C', 9,  'C9 · Advanced', 'C9 · продвинутые структуры', 49),
('C', 10, 'C10 · Advanced', 'C10 · продвинутые структуры', 50),
('C', 11, 'C11 · Advanced', 'C11 · продвинутые структуры', 51),
('C', 12, 'C12 · Advanced', 'C12 · продвинутые структуры', 52),
('C', 13, 'C13 · Advanced', 'C13 · продвинутые структуры', 53),
('C', 14, 'C14 · Advanced', 'C14 · продвинутые структуры', 54),
('C', 15, 'C15 · Advanced', 'C15 · продвинутые структуры', 55),
('C', 16, 'C16 · Advanced', 'C16 · продвинутые структуры', 56),
('C', 17, 'C17 · Advanced', 'C17 · продвинутые структуры', 57),
('C', 18, 'C18 · Advanced', 'C18 · продвинутые структуры', 58),
('C', 19, 'C19 · Advanced', 'C19 · продвинутые структуры', 59);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Профили: каждый видит только себя, учитель видит всех
CREATE POLICY "profiles_self" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_teacher" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher')
);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_self" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Уроки: все авторизованные видят
CREATE POLICY "lessons_read" ON lessons FOR SELECT TO authenticated USING (true);
CREATE POLICY "lessons_teacher_write" ON lessons FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher')
);

-- Прогресс: студент видит свой, учитель видит всех
CREATE POLICY "progress_own" ON progress FOR ALL USING (
  student_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher')
);

-- Задания: студент видит свои, учитель видит все
CREATE POLICY "submissions_own" ON submissions FOR SELECT USING (
  student_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher')
);
CREATE POLICY "submissions_insert" ON submissions FOR INSERT WITH CHECK (student_id = auth.uid());

-- Фидбэк: все авторизованные видят, только учитель пишет
CREATE POLICY "feedback_read" ON feedback FOR SELECT TO authenticated USING (true);
CREATE POLICY "feedback_teacher_write" ON feedback FOR INSERT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher')
);

-- ============================================
-- ФУНКЦИЯ: автосоздание профиля при регистрации
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
