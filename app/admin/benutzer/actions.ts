'use server'

import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'

export async function sendErinnerungsmails(userIds: string[]): Promise<{ sent: number; errors: string[] }> {
  if (!userIds.length) return { sent: 0, errors: [] }
  if (!process.env.RESEND_API_KEY) return { sent: 0, errors: ['RESEND_API_KEY nicht konfiguriert'] }

  const resend = new Resend(process.env.RESEND_API_KEY)

  const admin = createAdminClient()

  // Fetch emails and names for selected users
  const { data: emailRows } = await admin.rpc('get_user_emails_by_ids', { user_ids: userIds })
  const { data: profiles } = await admin
    .from('profiles')
    .select('id, display_name')
    .in('id', userIds)

  const nameMap = new Map(profiles?.map((p) => [p.id, p.display_name]) ?? [])
  const emailMap = new Map(
    ((emailRows ?? []) as { id: string; email: string }[]).map((r) => [r.id, r.email])
  )

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://wildmelder.de'

  let sent = 0
  const errors: string[] = []

  for (const userId of userIds) {
    const email = emailMap.get(userId)
    const name = nameMap.get(userId) ?? 'Jäger'

    if (!email) {
      errors.push(`Keine E-Mail für ${name}`)
      continue
    }

    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM ?? 'Wildunfall-Helfer <onboarding@resend.dev>',
      to: email,
      subject: 'Erinnerung: Revier noch nicht eingezeichnet',
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#071E27">
          <div style="background:#154212;padding:24px 32px;border-radius:12px 12px 0 0">
            <h1 style="margin:0;color:#fff;font-size:22px">Wildunfall-Helfer</h1>
          </div>
          <div style="background:#fff;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e2eaf0;border-top:none">
            <p style="margin:0 0 16px">Hallo ${name},</p>
            <p style="margin:0 0 16px">
              wir möchten Sie daran erinnern, dass Sie in <strong>Wildunfall-Helfer</strong> noch kein Revier eingezeichnet haben.
            </p>
            <p style="margin:0 0 16px">
              Ohne eingezeichnetes Revier können Wildunfälle in Ihrem Gebiet nicht korrekt zugeordnet und an Sie weitergeleitet werden.
            </p>
            <div style="background:#fff3cd;border:1px solid #fd8b00;border-radius:8px;padding:16px;margin:0 0 24px">
              <strong style="color:#904d00">Wichtiger Hinweis:</strong>
              <p style="margin:8px 0 0;color:#904d00">
                Jäger, die kein Revier eingezeichnet haben, werden aus dem System entfernt.
                Bitte zeichnen Sie Ihr Revier zeitnah ein, um Ihren Zugang zu erhalten.
              </p>
            </div>
            <a href="${appUrl}/reviere/neu"
               style="display:inline-block;background:#154212;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;font-size:15px">
              Jetzt Revier einzeichnen →
            </a>
            <p style="margin:32px 0 0;font-size:13px;color:#6b8a99">
              Mit freundlichen Grüßen<br>Das Wildunfall-Helfer-Team
            </p>
          </div>
        </div>
      `,
    })

    if (error) {
      errors.push(`${email}: ${error.message}`)
    } else {
      sent++
    }
  }

  return { sent, errors }
}
