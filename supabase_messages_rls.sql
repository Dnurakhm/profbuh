-- ============================================
-- RLS ПОЛИТИКИ ДЛЯ ТАБЛИЦЫ MESSAGES
-- ============================================
-- Этот SQL нужно выполнить в Supabase SQL Editor
-- для настройки прав доступа к таблице messages
--
-- Проблема: 403 Forbidden при отправке сообщений
-- Решение: Создать политики RLS для INSERT и SELECT

-- Шаг 1: Включаем RLS на таблице messages (если еще не включен)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Шаг 2: Удаляем старые политики (если есть) для чистоты
DROP POLICY IF EXISTS "Users can read messages for their jobs" ON messages;
DROP POLICY IF EXISTS "Users can insert messages for their jobs" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON messages;

-- Шаг 3: Политика для чтения сообщений
-- Пользователь может читать сообщения, если он является участником проекта
-- (либо client_id, либо accountant_id в таблице jobs)
CREATE POLICY "Users can read messages for their jobs"
ON messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM jobs
    WHERE jobs.id = messages.job_id
    AND (
      jobs.client_id = auth.uid()
      OR jobs.accountant_id = auth.uid()
    )
  )
);

-- Шаг 4: Политика для вставки сообщений
-- Пользователь может отправлять сообщения, если он является участником проекта
-- И sender_id должен совпадать с текущим пользователем
CREATE POLICY "Users can insert messages for their jobs"
ON messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM jobs
    WHERE jobs.id = messages.job_id
    AND (
      jobs.client_id = auth.uid()
      OR jobs.accountant_id = auth.uid()
    )
  )
);

-- Шаг 5: Политика для обновления сообщений (опционально)
-- Пользователь может обновлять только свои сообщения
CREATE POLICY "Users can update their own messages"
ON messages
FOR UPDATE
USING (auth.uid() = sender_id)
WITH CHECK (auth.uid() = sender_id);

-- Шаг 6: Политика для удаления сообщений (опционально)
-- Пользователь может удалять только свои сообщения
CREATE POLICY "Users can delete their own messages"
ON messages
FOR DELETE
USING (auth.uid() = sender_id);

-- ============================================
-- ПРИМЕЧАНИЯ:
-- ============================================
-- 1. После выполнения этого SQL пользователи смогут:
--    - Читать сообщения в проектах, где они участники
--    - Отправлять сообщения в проектах, где они участники
--    - Обновлять и удалять только свои сообщения
--
-- 2. Если у вас есть другие политики на таблице messages,
--    они будут удалены. Проверьте перед выполнением!
--
-- 3. Если нужно разрешить доступ администраторам или другим ролям,
--    добавьте дополнительные политики
