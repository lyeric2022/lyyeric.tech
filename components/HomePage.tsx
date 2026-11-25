'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { FluidFieldBg } from './FluidFieldBg'
import { ResumeDialog } from './ResumeDialog'
import { HomeV1 } from './v1/HomeV1'

export function HomePage() {
  const [viewMode, setViewMode] = useState<'v2' | 'v1'>('v2')

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth < 768) {
        setViewMode((prev) => (prev === 'v1' ? 'v2' : prev))
      }
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (viewMode === 'v1') {
      document.documentElement.setAttribute('data-theme', 'dark')
      document.body.setAttribute('data-view', 'v1')
    } else {
      document.documentElement.removeAttribute('data-theme')
      document.body.setAttribute('data-view', 'v2')
    }

    return () => {
      document.documentElement.removeAttribute('data-theme')
      document.body.removeAttribute('data-view')
    }
  }, [viewMode])

  const toggleButton = (
    <div className="view-toggle-container">
      <span className="toggle-label">v2</span>
      <button
        type="button"
        className={`toggle-switch ${viewMode === 'v1' ? 'active' : ''}`}
        onClick={() => setViewMode((prev) => (prev === 'v1' ? 'v2' : 'v1'))}
        aria-label="Toggle between v1 and v2"
        aria-pressed={viewMode === 'v1'}
      >
        <span className="toggle-slider" />
      </button>
      <span className="toggle-label">v1</span>
    </div>
  )

  if (viewMode === 'v1') {
    return (
      <>
        {toggleButton}
        <HomeV1 />
      </>
    )
  }

  return (
    <div className="compact-view">
      {toggleButton}
      <FluidFieldBg />
      <div className="compact-intro">
        <h1>I&apos;m Eric Ly</h1>
        <p>
          Previously at{' '}
          <a href="https://afterquery.com/" target="_blank" rel="noopener noreferrer">
            AfterQuery
          </a>{' '}
          working on RL environments and post-training infrastructure for frontier labs, and an early engineer at{' '}
          <a href="https://www.humandelta.ai/" target="_blank" rel="noopener noreferrer">
            Human Delta
          </a>{' '}
          building knowledge infrastructure for enterprise agents.
        </p>
        <p>
          Earlier, I worked on{' '}
          <a href="https://www.letta.com/" target="_blank" rel="noopener noreferrer">Letta</a>&apos;s Agents
          Developer Platform and{' '}
          <a href="https://www.zams.com/" target="_blank" rel="noopener noreferrer">Zams</a>&apos;s workflow
          agents, and researched voice synthesis at{' '}
          <a href="https://www.att.com/" target="_blank" rel="noopener noreferrer">AT&amp;T</a>.
        </p>
        <p>
          I studied CS and econ at CSUF, directed{' '}
          <a href="https://fullyhacks.acmcsuf.com/" target="_blank" rel="noopener noreferrer">
            FullyHacks
          </a>{' '}
          twice, and won 7 hackathons.
        </p>
        <p>
          I&apos;m into American dynamism, YIMBYism, abundance economics, and mechanism design.
        </p>
        <p>
          See my <Link href="/writing">writing</Link>,{' '}
          <a href="https://www.linkedin.com/in/lyyeric/" target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          , or <ResumeDialog />.
        </p>
      </div>

      <footer className="webring-footer">
        <a
          href="https://webring-1.vercel.app/?from=lyyeric&dir=prev"
          rel="noopener noreferrer"
          className="webring-link"
          title="Previous site"
        >
          <ChevronLeft size={18} />
        </a>
        <span className="copyright">© 2026 Eric Ly</span>
        <a
          href="https://webring-1.vercel.app/?from=lyyeric&dir=next"
          rel="noopener noreferrer"
          className="webring-link"
          title="Next site"
        >
          <ChevronRight size={18} />
        </a>
      </footer>
    </div>
  )
}
