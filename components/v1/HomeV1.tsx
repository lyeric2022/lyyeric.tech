'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { projects, type V1Project } from '@/data/projectsData'

const VIDEO_MEDIA = [
  {
    title: 'Invincible',
    image:
      'https://resizing.flixster.com/mLF-oQ_b4LrZqVW-60HiUa3rUBI=/206x305/v2/https://resizing.flixster.com/PPNMIucFZ1MRuYFJj9PTt2Kb6-E=/ems.cHJkLWVtcy1hc3NldHMvdHZzZXJpZXMvODI1ZmZiYmUtZmEwZS00ZTUxLTljMDYtNWYxZDZkODAyMGI4LmpwZw==',
  },
  {
    title: 'Jujutsu Kaisen',
    image: 'https://cdn.myanimelist.net/images/anime/1171/109222.jpg',
  },
  {
    title: 'Noragami',
    image: 'https://cdn.myanimelist.net/images/anime/1009/98400l.jpg',
  },
  {
    title: 'Big Hero 6',
    image: 'https://bubbawheat.files.wordpress.com/2014/11/big-hero-6.jpg',
  },
  {
    title: 'Code Geass',
    image: 'https://cdn.myanimelist.net/images/anime/6/87709.jpg',
  },
]

function shuffleArray<T>(items: T[]): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

export function HomeV1() {
  const [searchTerm, setSearchTerm] = useState('')
  const [orderedProjects, setOrderedProjects] = useState<V1Project[]>(() => [...projects])
  const [isShuffled, setIsShuffled] = useState(false)

  const filteredProjects = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return orderedProjects
    return orderedProjects.filter(
      (project) =>
        project.title.toLowerCase().includes(q) ||
        project.description.toLowerCase().includes(q) ||
        project.tags.some((tag) => tag.toLowerCase().includes(q))
    )
  }, [orderedProjects, searchTerm])

  const handleShuffle = () => {
    setOrderedProjects(shuffleArray(projects))
    setIsShuffled(true)
  }

  const handleReset = () => {
    setOrderedProjects([...projects])
    setIsShuffled(false)
  }

  const handleScrollToProjects = () => {
    const el = document.getElementById('projects-section')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="v1-root">
      <Link href="/writing" className="theme-toggle-btn">
        Writing
      </Link>

      <div className="home-screen">
        <div className="introduction">
          <h4>Hi, my name is</h4>
          <div className="content">
            <h1>Eric Ly.</h1>
            <h1 aria-hidden="true">Eric Ly.</h1>
          </div>
          <h2>I&apos;m a Software Engineer.</h2>
          <div className="introduction-paragraph">
            <p>
              Currently, I&apos;m studying Computer Science &amp; Economics, at California State
              University, Fullerton.
            </p>
            <p>This is my personal website, where I highlight my projects and interests.</p>
            <p>Thanks for reading! 👻</p>
          </div>
        </div>

        <div className="card linkers">
          <button type="button" onClick={() => window.open('/eric-ly-resume.pdf', '_blank')}>
            Resume
          </button>
          <button
            type="button"
            onClick={() => window.open('https://www.linkedin.com/in/lyyeric/', '_blank')}
          >
            LinkedIn
          </button>
          <button
            type="button"
            onClick={() => window.open('https://github.com/lyeric2022', '_blank')}
          >
            GitHub
          </button>
          <button
            type="button"
            onClick={() => {
              const subject = 'Hello from your website!'
              const body = 'Hi Eric, I found your website and wanted to get in touch with you.'
              window.open(
                `mailto:ly.eric2022@csu.fullerton.edu?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
              )
            }}
          >
            Email
          </button>
        </div>

        <button
          type="button"
          className="arrow-container"
          onClick={handleScrollToProjects}
          aria-label="Scroll to projects section"
        >
          <div className="arrow">
            <p>Explore More</p>
            <div className="arrow-right" />
            <div className="arrow-left" />
          </div>
        </button>
      </div>

      <div id="projects-section" className="section-container">
        <h1 id="projects-subtitle">Projects</h1>

        <div className="projects-toolbar">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button
                type="button"
                className="clear-search"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <div className="toolbar-actions">
            <button
              type="button"
              className={`toolbar-btn shuffle-btn ${isShuffled ? 'active' : ''}`}
              onClick={handleShuffle}
              aria-label="Randomize projects"
            >
              <span className="btn-icon">⟳</span>
              <span className="btn-text">Shuffle</span>
            </button>

            {isShuffled && (
              <button
                type="button"
                className="toolbar-btn reset-btn"
                onClick={handleReset}
                aria-label="Reset to original order"
              >
                <span className="btn-icon">↺</span>
                <span className="btn-text">Reset</span>
              </button>
            )}
          </div>
        </div>

        <div className="projects-container">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <div key={project.id} className="card project-card">
                <a
                  href={
                    project.customHandler === 'handleOpenSymbolicRegressor'
                      ? '/symbolic_regressor_pringles.html'
                      : (project.url ?? '#')
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={`/v1/${project.image}`}
                    alt={project.title}
                    className="project-image"
                  />
                </a>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <div className="project-tags">
                  {project.tags.map((tag) => (
                    <span key={tag} className="project-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <p>No projects found matching &ldquo;{searchTerm}&rdquo;</p>
            </div>
          )}
        </div>
      </div>

      <div className="section-container">
        <h1 id="video-media-subtitle">Video Media</h1>
        <div className="projects-container">
          {VIDEO_MEDIA.map((item) => (
            <div key={item.title} className="card video-media-card">
              <img src={item.image} alt={item.title} className="project-image" />
              <h3>{item.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
