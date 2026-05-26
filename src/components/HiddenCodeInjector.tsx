import React, { useEffect } from 'react'
import { getTeamById } from '../supabase/database'
import { getProfileById } from '../supabase/database'

export default function HiddenCodeInjector({ userId }: { userId: string | null }) {
  useEffect(() => {
    if (!userId) return
    const uid = userId

    let mounted = true

    async function inject() {
      try {
        const profileRes = await getProfileById(uid)
        if (!mounted) return
        const profile = (profileRes.data as any) || null
        const teamId = profile?.team_id
        if (!teamId) return

        const teamRes = await getTeamById(teamId)
        if (!mounted) return
        const team = (teamRes.data as any) || null
        if (!team) return

        const hiddenCode = team.hidden_code
        const location = team.hidden_location || 'footer_comment'

        // Remove previous injections
        const prev = document.getElementById('injected-debug-code')
        if (prev) prev.remove()

        if (location === 'footer_comment') {
          // inject as HTML comment in footer
          const footer = document.querySelector('footer') || document.body
          const comment = document.createComment(` ${hiddenCode} `)
          ;(footer as Element).appendChild(document.createElement('span'))
          // append comment node directly to DOM via range
          const span = document.createElement('span')
          span.id = 'injected-debug-code'
          span.style.display = 'none'
          span.appendChild(document.createTextNode(''))
          footer.appendChild(span)
          // place comment before span
          span.parentNode?.insertBefore(comment, span)
        } else if (location === 'hidden_div') {
          const div = document.createElement('div')
          div.id = 'injected-debug-code'
          div.hidden = true
          div.textContent = hiddenCode
          document.body.appendChild(div)
        } else if (location === 'meta_tag') {
          const meta = document.createElement('meta')
          meta.name = 'debug-code'
          meta.content = hiddenCode
          meta.id = 'injected-debug-code'
          document.head.appendChild(meta)
        } else if (location === 'data_attribute') {
          const el = document.createElement('div')
          el.id = 'injected-debug-code'
          el.setAttribute('data-debug', hiddenCode)
          el.style.display = 'none'
          document.body.appendChild(el)
        } else if (location === 'hidden_profile_section') {
          // Find profile area and append a hidden span
          const profileArea = document.querySelector('.profile-area') || document.body
          const span = document.createElement('span')
          span.id = 'injected-debug-code'
          span.style.display = 'none'
          span.textContent = hiddenCode
          profileArea.appendChild(span)
        }
      } catch (e) {
        // fail silently
      }
    }

    void inject()
    return () => { mounted = false }
  }, [userId])

  return null
}
