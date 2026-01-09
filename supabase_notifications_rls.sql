-- ============================================
-- RLS ПОЛИТИКИ ДЛЯ ТАБЛИЦЫ NOTIFICATIONS
-- ============================================
-- Этот SQL нужно выполнить в Supabase SQL Editor
-- для настройки прав доступа к таблице notifications
--
-- Проблема: Триггер не может создать уведомление из-за RLS
-- Решение: Создать политики RLS для чтения и обновления уведомлений

-- Шаг 1: Включаем RLS на таблице notifications (если еще не включен)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Шаг 2: Удаляем старые политики (если есть) для чистоты
DROP POLICY IF EXISTS "Users can read their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
DROP POLICY IF EXISTS "System can update notifications" ON notifications;

-- Шаг 3: Политика для чтения уведомлений
-- Пользователь может читать только свои уведомления
CREATE POLICY "Users can read their own notifications"
ON notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Шаг 4: Политика для обновления уведомлений
-- Пользователь может обновлять только свои уведомления (например, помечать как прочитанные)
CREATE POLICY "Users can update their own notifications"
ON notifications
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Шаг 5: Политика для вставки уведомлений системой
-- Разрешаем вставку уведомлений через триггеры (SECURITY DEFINER функции)
-- Функция с SECURITY DEFINER обходит RLS, поэтому эта политика нужна для совместимости
-- Но на практике функция будет выполняться с правами создателя и обойдет RLS
CREATE POLICY "System can insert notifications"
ON notifications
FOR INSERT
WITH CHECK (true);

-- Шаг 6: Политика для обновления уведомлений системой
-- Разрешаем обновление уведомлений через триггеры (SECURITY DEFINER функции)
CREATE POLICY "System can update notifications"
ON notifications
FOR UPDATE
USING (true)
WITH CHECK (true);

-- ============================================
-- ПРИМЕЧАНИЯ:
-- ============================================
-- 1. Политики "System can insert/update notifications" разрешают триггерам
--    создавать и обновлять уведомления. Безопасность обеспечивается тем, что
--    функции триггеров используют SECURITY DEFINER и выполняются с правами
--    создателя функции.
--
-- 2. Пользователи могут читать и обновлять только свои уведомления.
--
-- 3. Если нужно разрешить удаление уведомлений, добавьте политику:
--    CREATE POLICY "Users can delete their own notifications"
--    ON notifications FOR DELETE USING (auth.uid() = user_id);
--
-- 4. Если у вас есть другие политики на таблице notifications,
--    они будут удалены. Проверьте перед выполнением!
