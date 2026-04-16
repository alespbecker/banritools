# Project Memory

## Core
BanriTools: internal bank employee productivity SaaS. Dark/light theme toggle, blue primary, Inter font.
Portuguese (pt-BR) UI language. Database: profiles, user_roles, agencies, daily_reports, contacts, tools.
Roles in separate user_roles table (app_role enum: admin, user). RLS with has_role() security definer.
Auth: email/password only (no Google OAuth — bank policy). No auto-confirm emails.
Layout: shared _authenticated layout with sidebar overlay on mobile, desktop sidebar static.
Realtime enabled on daily_reports table. Gamification: points, levels, badges, ranking.
