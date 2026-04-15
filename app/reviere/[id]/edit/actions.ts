'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { Resend } from 'resend'

export async function searchJaeger(query: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht eingeloggt')

  const raw = query.trim()
  if (!raw) return []

  const admin = createAdminClient()

  // * → SQL %, no wildcard → substring match
  const sqlPattern = raw.includes('*')
    ? raw.replace(/\*/g, '%')
    : `%${raw}%`

  // 1. Search profiles by display_name (only jaeger/admin can receive a Revier)
  const { data: byName } = await admin
    .from('profiles')
    .select('id, display_name, role')
    .ilike('display_name', sqlPattern)
    .in('role', ['jaeger', 'admin'])
    .neq('id', user.id)
    .limit(10)

  // 2. Search auth.users by email via SECURITY DEFINER function
  const { data: emailMatches } = await admin
    .rpc('search_users_by_email', { search_pattern: sqlPattern, exclude_id: user.id })

  type EmailRow = { id: string; email: string }
  const emailMatchedIds = ((emailMatches ?? []) as EmailRow[]).map((r) => r.id)
  const emailMap = new Map(
    ((emailMatches ?? []) as EmailRow[]).map((r) => [r.id, r.email])
  )

  let byEmail: Array<{ id: string; display_name: string | null; role: string | null }> = []
  if (emailMatchedIds.length > 0) {
    const { data } = await admin
      .from('profiles')
      .select('id, display_name, role')
      .in('id', emailMatchedIds)
      .in('role', ['jaeger', 'admin'])
    byEmail = data ?? []
  }

  // 3. Fetch emails for name-matched profiles
  const nameIds = (byName ?? []).map((p) => p.id)
  let nameEmailMap = new Map<string, string>()
  if (nameIds.length > 0) {
    const { data: nameEmailData } = await admin.rpc('get_user_emails_by_ids', { user_ids: nameIds })
    nameEmailMap = new Map(
      ((nameEmailData ?? []) as EmailRow[]).map((r) => [r.id, r.email])
    )
  }

  // 4. Merge and deduplicate
  const seen = new Set<string>()
  const results: Array<{ id: string; display_name: string | null; role: string | null; email?: string }> = []

  for (const p of (byName ?? [])) {
    if (!seen.has(p.id)) {
      seen.add(p.id)
      results.push({ ...p, email: nameEmailMap.get(p.id) })
    }
  }

  for (const p of byEmail) {
    if (!seen.has(p.id)) {
      seen.add(p.id)
      results.push({ ...p, email: emailMap.get(p.id) })
    }
  }

  return results.slice(0, 10)
}

export async function inviteJaeger(revierId: string, jaegerId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht eingeloggt')

  const admin = createAdminClient()

  // Only the owner may invite
  const { data: revier } = await supabase
    .from('reviere')
    .select('jaeger_id, name')
    .eq('id', revierId)
    .single()

  if (revier?.jaeger_id !== user.id) throw new Error('Keine Berechtigung')
  if (jaegerId === user.id) throw new Error('Sie können sich nicht selbst einladen')

  const { error } = await supabase
    .from('revier_mitglieder')
    .insert({ revier_id: revierId, jaeger_id: jaegerId })

  if (error) {
    if (error.code === '23505') throw new Error('Dieser Jäger ist bereits Mitglied')
    throw error
  }

  // Send invitation email
  const [{ data: inviterProfile }, { data: emailRows }] = await Promise.all([
    admin.from('profiles').select('display_name').eq('id', user.id).single(),
    admin.rpc('get_user_emails_by_ids', { user_ids: [jaegerId] }),
  ])

  const inviteeEmail = (emailRows as { id: string; email: string }[] | null)?.[0]?.email
  if (inviteeEmail && process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://wildmelder.de'
    const inviterName = inviterProfile?.display_name ?? 'Ein Jäger'

    await resend.emails.send({
      from: process.env.RESEND_FROM ?? 'Wildmelder <onboarding@resend.dev>',
      to: inviteeEmail,
      subject: `Einladung zum Revier „${revier.name}"`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#071E27">
          <div style="background:#154212;padding:24px 32px;border-radius:12px 12px 0 0">
            <h1 style="margin:0;color:#fff;font-size:22px">Wildmelder</h1>
          </div>
          <div style="background:#fff;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e2eaf0;border-top:none">
            <p style="margin:0 0 16px">Hallo,</p>
            <p style="margin:0 0 16px">
              <strong>${inviterName}</strong> hat Sie als Mitglied zum Revier
              <strong>„${revier.name}"</strong> eingeladen.
            </p>
            <p style="margin:0 0 24px">
              Sie können ab sofort die Wildmeldungen dieses Reviers in Ihrem Dashboard einsehen.
            </p>
            <a href="${appUrl}/reviere"
               style="display:inline-block;background:#154212;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;font-size:15px">
              Meine Reviere ansehen →
            </a>
            <p style="margin:32px 0 0;font-size:13px;color:#6b8a99">
              Mit freundlichen Grüßen<br>Das Wildmelder-Team
            </p>
          </div>
        </div>
      `,
    })
  }
}

export async function removeJaeger(revierId: string, jaegerId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht eingeloggt')

  const { data: revier } = await supabase
    .from('reviere')
    .select('jaeger_id')
    .eq('id', revierId)
    .single()

  if (revier?.jaeger_id !== user.id) throw new Error('Keine Berechtigung')

  const { error } = await supabase
    .from('revier_mitglieder')
    .delete()
    .eq('revier_id', revierId)
    .eq('jaeger_id', jaegerId)

  if (error) throw error
}

export async function transferRevier(revierId: string, targetJaegerId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht eingeloggt')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'
  const admin = createAdminClient()

  // Non-admins can only transfer their own reviere
  if (!isAdmin) {
    const { data: revier } = await admin
      .from('reviere')
      .select('jaeger_id')
      .eq('id', revierId)
      .single()

    if (revier?.jaeger_id !== user.id) throw new Error('Keine Berechtigung')
  }

  const { error } = await admin
    .from('reviere')
    .update({ jaeger_id: targetJaegerId })
    .eq('id', revierId)

  if (error) throw error

  if (isAdmin) {
    redirect('/admin/reviere')
  } else {
    redirect('/reviere')
  }
}
