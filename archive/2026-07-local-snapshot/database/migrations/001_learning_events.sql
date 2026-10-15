-- study-portal 云端学习记录基础表
-- 公开仓库只保存结构；Neon 连接串和真实记录不得写入 Git。

CREATE TABLE IF NOT EXISTS public.learning_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  client_event_id text UNIQUE,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  received_at timestamptz NOT NULL DEFAULT now(),
  kid text NOT NULL CHECK (kid IN ('kenton', 'eddey', 'system')),
  subject text NOT NULL DEFAULT '',
  activity text NOT NULL DEFAULT 'practice',
  topic text NOT NULL DEFAULT '',
  item text NOT NULL DEFAULT '',
  is_correct boolean,
  hint text NOT NULL DEFAULT '',
  source text NOT NULL DEFAULT 'study-portal',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS learning_events_kid_time_idx
  ON public.learning_events (kid, occurred_at DESC);

CREATE INDEX IF NOT EXISTS learning_events_subject_topic_idx
  ON public.learning_events (subject, topic);
