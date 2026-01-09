# Исправление ошибки AbortError при логине

## Проблема
После логина возникает ошибка:
```
Uncaught AbortError: signal is aborted without reason
```

## Причина
RLS (Row Level Security) блокирует доступ к таблице `profiles` после логина. Приложение пытается получить данные профиля, но политики RLS не разрешают это.

## Решение

### Шаг 1: Исправить политики RLS для profiles

1. Откройте Supabase Dashboard → SQL Editor
2. Откройте файл `supabase_fix_rls_profiles.sql`
3. Скопируйте весь SQL код и выполните его
4. Это создаст правильные политики для таблицы `profiles`

### Шаг 2: Проверьте работу

1. Перезагрузите страницу
2. Попробуйте залогиниться
3. Ошибка должна исчезнуть

## Что делает SQL для profiles

Создает политики RLS, которые разрешают:
- ✅ Пользователям читать свой собственный профиль
- ✅ Пользователям читать профили других пользователей (для публичных страниц)
- ✅ Пользователям обновлять только свой собственный профиль
- ✅ Пользователям создавать свой профиль при регистрации

## Важно

Если проблема осталась, проверьте:

1. **Выполнены ли все SQL файлы?**
   - `supabase_fix_rls_profiles.sql` - для profiles
   - `supabase_notifications_rls.sql` - для notifications
   - `supabase_messages_rls.sql` - для messages
   - `supabase_group_notifications.sql` - для группировки уведомлений

2. **Проверьте консоль браузера** на другие ошибки

3. **Проверьте Network tab** в DevTools - какие запросы блокируются?

4. **Проверьте Supabase Dashboard** → Authentication → Policies
   - Убедитесь, что политики созданы правильно

## Порядок выполнения SQL (если еще не выполнены)

1. `supabase_fix_rls_profiles.sql` - **ВАЖНО: выполните первым!**
2. `supabase_messages_rls.sql`
3. `supabase_notifications_rls.sql`
4. `supabase_group_notifications.sql`

## Если ничего не помогает

1. Откройте Supabase Dashboard → Table Editor → profiles
2. Проверьте, что RLS включен
3. Проверьте, что политики созданы
4. Попробуйте временно отключить RLS для тестирования:
   ```sql
   ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
   ```
   (НЕ оставляйте так в продакшене!)
