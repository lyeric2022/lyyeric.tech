'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import posthog from 'posthog-js'

const RESUME_URL = '/eric-ly-resume.pdf'
const RESUME_PREVIEW_URL = '/eric-ly-resume.png'

export function ResumeDialog() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return undefined

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <>
      <a
        href={RESUME_URL}
        className="resume-link"
        onClick={(event) => {
          event.preventDefault()
          setOpen(true)
          if (posthog.__loaded) posthog.capture('resume_click')
        }}
      >
        resume
      </a>
      {open &&
        createPortal(
        <div
          className="resume-modal-backdrop"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            className="resume-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Resume"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="resume-modal__page">
              <img className="resume-modal__image" src={RESUME_PREVIEW_URL} alt="Eric Ly resume" />
            </div>
          </div>
        </div>,
        document.body
        )}
    </>
  )
}
