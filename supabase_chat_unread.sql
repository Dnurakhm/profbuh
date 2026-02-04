-- Add is_read column to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;

-- Create index for faster unread count queries
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages (job_id, is_read, sender_id);
