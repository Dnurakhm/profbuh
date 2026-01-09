-- ============================================
-- ИСПРАВЛЕНИЕ RLS ДЛЯ ТАБЛИЦЫ PROFILES
-- ============================================
-- Этот SQL нужно выполнить в Supabase SQL Editor
-- для исправления проблем с доступом к профилям после логина
--
-- Проблема: AbortError при попытке получить данные профиля
-- Решение: Проверить и создать правильные политики RLS

-- Шаг 1: Включаем RLS на таблице profiles (если еще не включен)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Шаг 2: Удаляем старые политики (если есть) для чистоты
DROP POLICY IF EXISTS "Users can read their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

-- Шаг 3: Политика для чтения своего профиля
-- Пользователь может читать свой собственный профиль
CREATE POLICY "Users can read their own profile"
ON profiles
FOR SELECT
USING (auth.uid() = id);

-- Шаг 4: Политика для чтения всех профилей (для публичных страниц)
-- Все пользователи могут читать профили других пользователей
-- Это нужно для отображения публичных профилей бухгалтеров
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles
FOR SELECT
USING (true);

-- Шаг 5: Политика для обновления своего профиля
-- Пользователь может обновлять только свой собственный профиль
CREATE POLICY "Users can update their own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Шаг 6: Политика для вставки профиля
-- Пользователь может создать свой профиль при регистрации
CREATE POLICY "Users can insert their own profile"
ON profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- ============================================
-- ПРИМЕЧАНИЯ:
-- ============================================
-- 1. После выполнения этого SQL пользователи смогут:
--    - Читать свой собственный профиль
--    - Читать профили других пользователей (для публичных страниц)
--    - Обновлять только свой собственный профиль
--    - Создавать свой профиль при регистрации
--
-- 2. Если нужно ограничить доступ к профилям (например, только для бухгалтеров),
--    измените политику "Public profiles are viewable by everyone"
--
-- 3. Если у вас есть другие политики на таблице profiles,
--    они будут удалены. Проверьте перед выполнением!
