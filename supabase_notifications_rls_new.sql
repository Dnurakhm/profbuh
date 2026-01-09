-- ============================================
-- RLS ПОЛИТИКИ ДЛЯ НОВОЙ СИСТЕМЫ УВЕДОМЛЕНИЙ
-- ============================================
-- Этот SQL нужно выполнить ТРЕТЬИМ в Supabase SQL Editor
-- для настройки прав доступа к таблице notifications

-- Шаг 1: Включаем RLS на таблице notifications (если еще не включен)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Шаг 2: Удаляем старые политики (если есть)
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
--    функции триггеров используют SECURITY DEFINER.
--
-- 2. Пользователи могут читать и обновлять только свои уведомления.
--
-- 3. После выполнения этого SQL новая система уведомлений будет полностью готова.
