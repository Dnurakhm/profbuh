-- ============================================
-- УДАЛЕНИЕ СТАРЫХ ТРИГГЕРОВ ДЛЯ УВЕДОМЛЕНИЙ
-- ============================================
-- Этот SQL нужно выполнить в Supabase SQL Editor
-- для удаления старых триггеров, которые создают одиночные уведомления
--
-- Проблема: Работают одновременно и старый способ (одиночные), и новый (группированные)
-- Решение: Удалить все старые триггеры на messages, кроме нового

-- Шаг 1: Показываем все триггеры на таблице messages (для информации)
-- Этот запрос покажет все триггеры - выполните его отдельно, чтобы увидеть список:
-- SELECT 
--   trigger_name,
--   event_manipulation,
--   action_statement,
--   action_timing
-- FROM information_schema.triggers
-- WHERE event_object_table = 'messages'
-- ORDER BY trigger_name;

-- Шаг 2: Удаляем ВСЕ триггеры на messages, которые создают уведомления
-- Затем создадим только один правильный триггер

-- Сначала удаляем наш новый триггер (мы создадим его заново)
DROP TRIGGER IF EXISTS on_message_insert_notification ON messages;

-- Удаляем все возможные старые триггеры с разными именами
DROP TRIGGER IF EXISTS notify_new_message ON messages;
DROP TRIGGER IF EXISTS create_message_notification ON messages;
DROP TRIGGER IF EXISTS on_new_message_notification ON messages;
DROP TRIGGER IF EXISTS message_notification_trigger ON messages;
DROP TRIGGER IF EXISTS notify_message_insert ON messages;
DROP TRIGGER IF EXISTS trigger_notify_message ON messages;
DROP TRIGGER IF EXISTS messages_notify_trigger ON messages;
DROP TRIGGER IF EXISTS chat_message_notification ON messages;

-- Шаг 3: Удаляем старые функции уведомлений (если они есть)
-- ВАЖНО: Не удаляйте handle_chat_message_notification() - это наша новая функция!
-- Удаляем только старые функции, если они существуют

-- Если у вас была функция с другим именем, добавьте её сюда:
-- DROP FUNCTION IF EXISTS old_notification_function() CASCADE;

-- Шаг 4: Создаем наш новый триггер (если его еще нет)
-- Это гарантирует, что работает только группированный способ
CREATE TRIGGER on_message_insert_notification
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION handle_chat_message_notification();

-- ============================================
-- ПРИМЕЧАНИЯ:
-- ============================================
-- 1. После выполнения этого SQL будет работать ТОЛЬКО группированный способ
--
-- 2. Если у вас есть триггер с другим именем, который не указан выше:
--    - Выполните запрос из Шага 1, чтобы увидеть все триггеры
--    - Добавьте DROP TRIGGER для вашего триггера
--    - Или напишите мне имя триггера, и я добавлю его в SQL
--
-- 3. Если после выполнения все еще приходят одиночные уведомления:
--    - Проверьте, нет ли других триггеров на других таблицах
--    - Проверьте, нет ли функций, которые вызываются из других мест
--
-- 4. Старые одиночные уведомления можно удалить вручную через Supabase Dashboard:
--    DELETE FROM notifications WHERE type = 'chat_message' AND job_id IS NULL;
