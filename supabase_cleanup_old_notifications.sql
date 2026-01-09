-- ============================================
-- ОЧИСТКА СТАРОЙ СИСТЕМЫ УВЕДОМЛЕНИЙ
-- ============================================
-- Этот SQL нужно выполнить ПЕРВЫМ в Supabase SQL Editor
-- для полной очистки старой системы уведомлений

-- Шаг 1: Удаляем ВСЕ триггеры на таблице messages
DROP TRIGGER IF EXISTS on_message_insert_notification ON messages;
DROP TRIGGER IF EXISTS notify_new_message ON messages;
DROP TRIGGER IF EXISTS create_message_notification ON messages;
DROP TRIGGER IF EXISTS on_new_message_notification ON messages;
DROP TRIGGER IF EXISTS message_notification_trigger ON messages;
DROP TRIGGER IF EXISTS notify_message_insert ON messages;
DROP TRIGGER IF EXISTS trigger_notify_message ON messages;
DROP TRIGGER IF EXISTS messages_notify_trigger ON messages;
DROP TRIGGER IF EXISTS chat_message_notification ON messages;

-- Шаг 2: Удаляем ВСЕ триггеры на таблице jobs
DROP TRIGGER IF EXISTS notify_job_assigned ON jobs;
DROP TRIGGER IF EXISTS on_job_accountant_assigned ON jobs;
DROP TRIGGER IF EXISTS job_assigned_notification ON jobs;

-- Шаг 3: Удаляем ВСЕ триггеры на таблице bids (если есть)
DROP TRIGGER IF EXISTS notify_new_bid ON bids;
DROP TRIGGER IF EXISTS on_bid_insert_notification ON bids;
DROP TRIGGER IF EXISTS bid_notification_trigger ON bids;

-- Шаг 4: Удаляем старые функции уведомлений
DROP FUNCTION IF EXISTS handle_chat_message_notification() CASCADE;
DROP FUNCTION IF EXISTS notify_message() CASCADE;
DROP FUNCTION IF EXISTS create_message_notification() CASCADE;

-- Шаг 5: Удаляем поля, которые мы добавляли для старой системы (если нужно)
-- Оставляем job_id и message_count, так как они нам понадобятся
-- Если нужно удалить их, раскомментируйте:
-- ALTER TABLE notifications DROP COLUMN IF EXISTS job_id;
-- ALTER TABLE notifications DROP COLUMN IF EXISTS message_count;

-- ============================================
-- ПРИМЕЧАНИЯ:
-- ============================================
-- 1. После выполнения этого SQL все старые триггеры будут удалены
-- 2. Старые уведомления в таблице notifications останутся (можно удалить вручную)
-- 3. Выполните следующий SQL файл для создания новой системы
