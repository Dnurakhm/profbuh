-- ============================================
-- PERFORMANCE OPTIMIZATION SCRIPT
-- ============================================

-- 1. Добавление индексов для ускорения поиска и фильтрации

-- Уведомления: ускоряет получение списка уведомлений пользователя
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created_at ON notifications(user_id, created_at DESC);

-- Сообщения: ускоряет загрузку чата
CREATE INDEX IF NOT EXISTS idx_messages_job_id_created_at ON messages(job_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);

-- Заказы: ускоряет фильтрацию по ролям и статусам на Dashboard
CREATE INDEX IF NOT EXISTS idx_jobs_client_id ON jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_jobs_accountant_id ON jobs(accountant_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);

-- Отклики: ускоряет подсчет откликов и фильтрацию
CREATE INDEX IF NOT EXISTS idx_bids_job_id ON bids(job_id);
CREATE INDEX IF NOT EXISTS idx_bids_accountant_id ON bids(accountant_id);

-- 2. Оптимизация RLS политик для сообщений
-- Используем JOIN или более эффективный поиск вместо вложенного EXISTS, если возможно,
-- но для Supabase RLS EXISTS обычно является стандартным подходом. 
-- Главное - наличие индексов по job_id, client_id и accountant_id.

-- Пересоздадим политику для чтения сообщений, чтобы убедиться в её чистоте
DROP POLICY IF EXISTS "Users can read messages for their jobs" ON messages;
CREATE POLICY "Users can read messages for their jobs"
ON messages
FOR SELECT
USING (
  job_id IN (
    SELECT id FROM jobs
    WHERE client_id = auth.uid()
    OR accountant_id = auth.uid()
  )
);

-- Аналогично для вставки
DROP POLICY IF EXISTS "Users can insert messages for their jobs" ON messages;
CREATE POLICY "Users can insert messages for their jobs"
ON messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND job_id IN (
    SELECT id FROM jobs
    WHERE client_id = auth.uid()
    OR accountant_id = auth.uid()
  )
);
