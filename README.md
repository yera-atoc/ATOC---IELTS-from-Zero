# AtoC IELTS Platform

Платформа для курса IELTS from Zero: кабинет студента + кабинет учителя.

## Стек
- Next.js 14 (App Router)
- Supabase (база данных + авторизация)
- Vercel (хостинг)

---

## ШАГ 1 — Supabase: создай таблицы

1. Зайди на supabase.com → твой проект → **SQL Editor**
2. Нажми **New query**
3. Скопируй весь код из файла `supabase_schema.sql`
4. Нажми **Run**
5. Убедись что в таблице `lessons` появились 59 строк

---

## ШАГ 2 — Настрой учителя

После запуска SQL, зарегистрируйся на сайте через форму,
затем зайди в Supabase → **Table Editor → profiles**
и вручную измени `role` с `student` на `teacher` для своего аккаунта.

---

## ШАГ 3 — Загрузка PDF в Supabase Storage

1. Supabase → **Storage** → **New bucket** → название `lessons` → Public bucket ✓
2. Загрузи свои docx/pdf файлы (сначала конвертируй docx в pdf)
3. Нажми на файл → **Get URL** → скопируй публичную ссылку
4. В кабинете учителя → вкладка "Уроки и PDF" → вставь ссылку к каждому уроку

---

## ШАГ 4 — Деплой на Vercel

1. Запушь проект на GitHub
2. Зайди на vercel.com → **New Project** → выбери репозиторий
3. В настройках **Environment Variables** добавь:
   - `NEXT_PUBLIC_SUPABASE_URL` = https://cxksmzyxdpqqtmkaosvt.supabase.co
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (твой anon key)
4. Нажми **Deploy**

---

## Структура проекта

```
src/
  app/
    page.tsx          ← главная, редирект по роли
    auth/page.tsx     ← логин / регистрация
    dashboard/page.tsx ← кабинет студента
    lesson/[id]/page.tsx ← отдельный урок
    teacher/page.tsx  ← кабинет учителя
  lib/
    supabase.ts       ← клиент Supabase
```

---

## Что умеет платформа

**Студент:**
- Видит все 59 уроков по уровням A/B/C
- Открывает PDF материал урока
- Отмечает прогресс (не начат / в процессе / пройден)
- Сдаёт Task 1, Task 2, упражнения
- Видит фидбэк учителя с оценкой Band

**Учитель:**
- Видит все работы студентов, отфильтрованные по статусу
- Оставляет комментарий + оценку Band (1-9)
- Видит список всех студентов
- Управляет PDF ссылками для каждого урока
