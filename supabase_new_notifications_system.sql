-- ============================================
-- НОВАЯ СИСТЕМА УВЕДОМЛЕНИЙ
-- ============================================
-- Этот SQL нужно выполнить ВТОРЫМ в Supabase SQL Editor
-- для создания новой системы уведомлений с группировкой

-- Шаг 1: Добавляем необходимые поля в таблицу notifications (если их еще нет)
DO $$ 
BEGIN
  -- Поле для связи с проектом
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' AND column_name = 'job_id'
  ) THEN
    ALTER TABLE notifications ADD COLUMN job_id UUID REFERENCES jobs(id) ON DELETE CASCADE;
  END IF;

  -- Поле для подсчета количества (для группировки)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' AND column_name = 'notification_count'
  ) THEN
    ALTER TABLE notifications ADD COLUMN notification_count INTEGER DEFAULT 1;
  END IF;
END $$;

-- Шаг 2: Функция для уведомлений о новых сообщениях в чате
CREATE OR REPLACE FUNCTION notify_chat_message()
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

  -- Определяем получателя (тот, кто НЕ отправил сообщение)
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
    -- Обновляем существующее уведомление: увеличиваем счетчик
    UPDATE notifications
    SET 
      notification_count = notification_count + 1,
      title = CASE 
        WHEN notification_count + 1 = 1 THEN 'Новое сообщение по проекту'
        WHEN notification_count + 1 = 2 THEN '2 новых сообщения по проекту'
        ELSE (notification_count + 1)::text || ' новых сообщений по проекту'
      END,
      content = 'У вас ' || (notification_count + 1)::text || ' непрочитанных сообщений в чате проекта',
      created_at = NOW()
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
      notification_count,
      is_read
    )
    VALUES (
      recipient_id,
      'chat_message',
      'Новое сообщение по проекту',
      'У вас новое сообщение в чате проекта',
      '/dashboard/chat?jobId=' || NEW.job_id,
      NEW.job_id,
      1,
      false
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Шаг 3: Функция для уведомлений об откликах на проект (для заказчика)
CREATE OR REPLACE FUNCTION notify_new_bid()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  job_data RECORD;
  existing_notification_id UUID;
BEGIN
  -- Получаем информацию о проекте
  SELECT client_id INTO job_data
  FROM jobs
  WHERE id = NEW.job_id;

  -- Если заказчик не определен, выходим
  IF job_data.client_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Ищем существующее непрочитанное уведомление об откликах для этого проекта
  SELECT id INTO existing_notification_id
  FROM notifications
  WHERE user_id = job_data.client_id
    AND type = 'new_bid'
    AND job_id = NEW.job_id
    AND is_read = false
  ORDER BY created_at DESC
  LIMIT 1;

  IF existing_notification_id IS NOT NULL THEN
    -- Обновляем существующее уведомление: увеличиваем счетчик
    UPDATE notifications
    SET 
      notification_count = notification_count + 1,
      title = CASE 
        WHEN notification_count + 1 = 1 THEN 'Новый отклик на проект'
        WHEN notification_count + 1 = 2 THEN '2 новых отклика на проект'
        ELSE (notification_count + 1)::text || ' новых откликов на проект'
      END,
      content = 'У вас ' || (notification_count + 1)::text || ' новых откликов на проект',
      created_at = NOW()
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
      notification_count,
      is_read
    )
    VALUES (
      job_data.client_id,
      'new_bid',
      'Новый отклик на проект',
      'У вас новый отклик на проект',
      '/dashboard/my-jobs/' || NEW.job_id,
      NEW.job_id,
      1,
      false
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Шаг 4: Функция для уведомления о выборе исполнителя (для бухгалтера)
CREATE OR REPLACE FUNCTION notify_job_assigned()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Проверяем, что accountant_id был изменен (назначен исполнитель)
  IF NEW.accountant_id IS NOT NULL 
     AND (OLD.accountant_id IS NULL OR OLD.accountant_id <> NEW.accountant_id) THEN
    
    -- Создаем уведомление для бухгалтера
    INSERT INTO notifications (
      user_id,
      type,
      title,
      content,
      link,
      job_id,
      notification_count,
      is_read
    )
    VALUES (
      NEW.accountant_id,
      'job_assigned',
      'Вас выбрали исполнителем! 🎉',
      'Заказчик выбрал ваш отклик для проекта: "' || NEW.title || '"',
      '/jobs/' || NEW.id,
      NEW.id,
      1,
      false
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Шаг 5: Создаем триггеры
-- Триггер для сообщений в чате
CREATE TRIGGER on_message_insert_notification
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_chat_message();

-- Триггер для новых откликов
CREATE TRIGGER on_bid_insert_notification
  AFTER INSERT ON bids
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_bid();

-- Триггер для назначения исполнителя
CREATE TRIGGER on_job_accountant_assigned
  AFTER UPDATE OF accountant_id ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION notify_job_assigned();

-- ============================================
-- ПРИМЕЧАНИЯ:
-- ============================================
-- 1. Все функции используют SECURITY DEFINER для обхода RLS
-- 2. Уведомления группируются по проекту (job_id) и типу (type)
-- 3. Счетчик увеличивается для непрочитанных уведомлений
-- 4. После прочтения уведомления новые сообщения/отклики создадут новое уведомление
