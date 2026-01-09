-- ============================================
-- ГРУППИРОВКА УВЕДОМЛЕНИЙ О СООБЩЕНИЯХ ПО ПРОЕКТУ
-- ============================================
-- Этот SQL нужно выполнить в Supabase SQL Editor
-- для группировки уведомлений о новых сообщениях в чате по одному проекту
-- 
-- ВАЖНО: Этот SQL интегрируется с существующими функциями:
-- 1. Триггер на jobs для уведомления о назначении исполнителя (job_assigned)
-- 2. Триггер на notifications для realtime.broadcast_changes
-- 3. Обновляет существующую функцию для уведомлений о сообщениях

-- Шаг 1: Добавляем поле job_id в таблицу notifications (если его еще нет)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' AND column_name = 'job_id'
  ) THEN
    ALTER TABLE notifications ADD COLUMN job_id UUID REFERENCES jobs(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Шаг 2: Добавляем поле message_count для подсчета количества сообщений (если его еще нет)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' AND column_name = 'message_count'
  ) THEN
    ALTER TABLE notifications ADD COLUMN message_count INTEGER DEFAULT 1;
  END IF;
END $$;

-- Шаг 3: Создаем/обновляем функцию для обработки уведомлений о сообщениях
-- Эта функция заменяет существующую логику и добавляет группировку
-- SECURITY DEFINER позволяет функции обходить RLS при создании уведомлений
CREATE OR REPLACE FUNCTION handle_chat_message_notification()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recipient_id UUID;
  job_data RECORD;
  existing_notification_id UUID;
BEGIN
  -- Получаем информацию о проекте
  SELECT client_id, accountant_id INTO job_data
  FROM jobs
  WHERE id = NEW.job_id;

  -- Определяем получателя уведомления (тот, кто НЕ отправил сообщение)
  IF NEW.sender_id = job_data.client_id THEN
    recipient_id := job_data.accountant_id;
  ELSE
    recipient_id := job_data.client_id;
  END IF;

  -- Если получатель не определен, выходим
  IF recipient_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Ищем существующее непрочитанное уведомление о сообщениях для этого проекта
  SELECT id INTO existing_notification_id
  FROM notifications
  WHERE user_id = recipient_id
    AND type = 'chat_message'
    AND job_id = NEW.job_id
    AND is_read = false
  ORDER BY created_at DESC
  LIMIT 1;

  IF existing_notification_id IS NOT NULL THEN
    -- Обновляем существующее уведомление: увеличиваем счетчик и обновляем время
    UPDATE notifications
    SET 
      message_count = message_count + 1,
      title = CASE 
        WHEN message_count + 1 = 1 THEN 'Новое сообщение по проекту'
        WHEN message_count + 1 = 2 THEN '2 новых сообщения по проекту'
        ELSE (message_count + 1)::text || ' новых сообщений по проекту'
      END,
      content = 'У вас ' || (message_count + 1)::text || ' непрочитанных сообщений в чате проекта',
      created_at = NOW() -- Обновляем время для сортировки (чтобы обновленное уведомление было сверху)
    WHERE id = existing_notification_id;
  ELSE
    -- Создаем новое уведомление
    INSERT INTO notifications (
      user_id,
      type,
      title,
      content,
      link,
      job_id,
      message_count,
      is_read
    )
    VALUES (
      recipient_id,
      'chat_message',
      'Новое сообщение по проекту',
      'У вас новое сообщение в чате проекта',
      '/jobs/' || NEW.job_id,
      NEW.job_id,
      1,
      false
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Шаг 4: Удаляем старый триггер (если существует) и создаем новый
-- ВАЖНО: Если у вас уже есть триггер на messages для уведомлений, 
-- этот SQL заменит его на версию с группировкой
DROP TRIGGER IF EXISTS on_message_insert_notification ON messages;

CREATE TRIGGER on_message_insert_notification
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION handle_chat_message_notification();

-- ============================================
-- ПРИМЕЧАНИЯ:
-- ============================================
-- 1. Этот SQL НЕ затрагивает существующие триггеры:
--    - Триггер на jobs для job_assigned остается без изменений
--    - Триггер на notifications для realtime.broadcast_changes остается без изменений
--
-- 2. После выполнения этого SQL все новые сообщения будут группироваться
--
-- 3. Старые уведомления останутся как есть (можно удалить вручную)
--
-- 4. Если нужно изменить текст уведомлений, отредактируйте функцию handle_chat_message_notification()
--
-- 5. Функция realtime.broadcast_changes будет автоматически отправлять обновления
--    как при INSERT, так и при UPDATE уведомлений
