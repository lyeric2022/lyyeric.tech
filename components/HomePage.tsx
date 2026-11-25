import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { FluidFieldBg } from './FluidFieldBg'
import { ResumeDialog } from './ResumeDialog'

export function HomePage() {
  return (
    <div className="compact-view">
      <FluidFieldBg />
      <div className="compact-intro">
        <h1 className="reveal-0">I&apos;m Eric Ly</h1>
        <p className="reveal-1">
          Previously an engineer at{' '}
          <a href="https://afterquery.com/" target="_blank" rel="noopener noreferrer">
            AfterQuery
          </a>{' '}
          and an early engineer at{' '}
          <a href="https://www.humandelta.ai/" target="_blank" rel="noopener noreferrer">
            Human Delta
          </a>
          , building AI evals and knowledge infrastructure for enterprise agents.
        </p>
        <p className="reveal-2">
          Earlier, I worked on{' '}
          <a href="https://www.letta.com/" target="_blank" rel="noopener noreferrer">Letta</a>&apos;s Agents
          Developer Platform and{' '}
          <a href="https://www.zams.com/" target="_blank" rel="noopener noreferrer">Zams</a>&apos;s workflow
          agents, and researched voice synthesis at{' '}
          <a href="https://www.att.com/" target="_blank" rel="noopener noreferrer">AT&amp;T</a>.
        </p>
        <p className="reveal-3">
          I studied CS and econ at CSUF, directed{' '}
          <a href="https://fullyhacks.acmcsuf.com/" target="_blank" rel="noopener noreferrer">
            FullyHacks
          </a>{' '}
          twice, and won 7 hackathons.
        </p>
        <p className="reveal-4">
          I&apos;m into American dynamism, YIMBYism, abundance economics, and mechanism design.
        </p>
        <p className="reveal-5">
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
