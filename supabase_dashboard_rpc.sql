-- ============================================
-- DASHBOARD STATISTICS RPC
-- ============================================

CREATE OR REPLACE FUNCTION get_dashboard_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
    active_jobs_count INT;
    in_progress_jobs_count INT;
    completed_jobs_count INT;
    my_proposals_count INT;
    my_active_contracts_count INT;
    bids_count INT;
    my_job_ids UUID[];
    my_applied_job_ids UUID[];
    recent_activity JSON;
    recommended_jobs JSON;
    profile_data JSON;
BEGIN
    -- 1. Получаем профиль
    SELECT row_to_json(p) INTO profile_data FROM profiles p WHERE id = user_uuid;

    -- 2. Статистика ЗАКАЗЧИКА
    SELECT count(*) INTO active_jobs_count FROM jobs WHERE client_id = user_uuid AND status = 'open';
    SELECT count(*) INTO in_progress_jobs_count FROM jobs WHERE client_id = user_uuid AND status = 'in_progress';
    SELECT count(*) INTO completed_jobs_count FROM jobs WHERE client_id = user_uuid AND status = 'completed';
    
    -- ID моих открытых заказов для подсчета откликов
    SELECT array_agg(id) INTO my_job_ids FROM jobs WHERE client_id = user_uuid AND status = 'open';
    
    IF my_job_ids IS NOT NULL THEN
        SELECT count(*) INTO bids_count FROM bids WHERE job_id = ANY(my_job_ids);
    ELSE
        bids_count := 0;
    END IF;

    -- Последние действия заказчика
    SELECT json_agg(t) INTO recent_activity FROM (
        SELECT id, title, created_at, status 
        FROM jobs 
        WHERE client_id = user_uuid 
        ORDER BY created_at DESC 
        LIMIT 5
    ) t;

    -- 3. Статистика СПЕЦИАЛИСТА
    -- Активные отклики
    SELECT count(*) INTO my_proposals_count 
    FROM bids b
    JOIN jobs j ON b.job_id = j.id
    WHERE b.accountant_id = user_uuid AND j.status = 'open';

    -- Текущие проекты (в работе)
    SELECT count(*) INTO my_active_contracts_count FROM jobs WHERE accountant_id = user_uuid AND status = 'in_progress';

    -- Заказы, на которые я УЖЕ откликнулся
    SELECT array_agg(job_id) INTO my_applied_job_ids FROM bids WHERE accountant_id = user_uuid;

    -- Рекомендуемые заказы
    SELECT json_agg(t) INTO recommended_jobs FROM (
        SELECT id, title, budget, created_at, category 
        FROM jobs 
        WHERE status = 'open' 
        AND client_id != user_uuid
        AND (my_applied_job_ids IS NULL OR NOT (id = ANY(my_applied_job_ids)))
        ORDER BY created_at DESC 
        LIMIT 5
    ) t;

    -- 4. Собираем финальный JSON
    result := json_build_object(
        'profile', profile_data,
        'stats', json_build_object(
            'client', json_build_object(
                'activeJobs', COALESCE(active_jobs_count, 0),
                'inProgressJobs', COALESCE(in_progress_jobs_count, 0),
                'completedJobs', COALESCE(completed_jobs_count, 0),
                'bids', COALESCE(bids_count, 0),
                'spent', 0,
                'recentActivity', COALESCE(recent_activity, '[]'::json)
            ),
            'specialist', json_build_object(
                'proposals', COALESCE(my_proposals_count, 0),
                'contracts', COALESCE(my_active_contracts_count, 0),
                'earnings', 0,
                'recommendedJobs', COALESCE(recommended_jobs, '[]'::json)
            )
        )
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
