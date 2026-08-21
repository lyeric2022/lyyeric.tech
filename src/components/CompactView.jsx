import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import './CompactView.scss';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const RESUME_URL = '/Eric Ly Resume 060826.pdf';

const CompactView = () => {
  const [resumeOpen, setResumeOpen] = useState(false);

  useEffect(() => {
    if (!resumeOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setResumeOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [resumeOpen]);

  return (
    <div className="compact-view">
      <div className="compact-intro">
        <h1 className="reveal-0">I'm Eric Ly</h1>
        <p className="reveal-1">
          I'm a current engineer at{' '}
          <a href="https://afterquery.com/" target="_blank" rel="noopener noreferrer">AfterQuery</a>, working on AI research, human data, LLM evals, and platform infra.
        </p>
        <p className="reveal-2">
          Before that, I was an early engineer at{' '}
          <a href="https://www.humandelta.ai/" target="_blank" rel="noopener noreferrer">Human Delta</a>, working on knowledge infrastructure for enterprise AI agents: an audit platform{' '}
          [<a href="https://www.humandelta.ai/case-studies/espn" target="_blank" rel="noopener noreferrer">blog</a>], a developer platform, and corpus search.
        </p>
        <p className="reveal-3">
          Earlier, I worked on the Agents Developer Platform at{' '}
          <a href="https://www.letta.com/" target="_blank" rel="noopener noreferrer">Letta</a>, workflow agents at{' '}
          <a href="https://www.zams.com/" target="_blank" rel="noopener noreferrer">Zams</a>, and researched voice synthesis at{' '}
          <a href="https://www.att.com/" target="_blank" rel="noopener noreferrer">AT&T</a>.
        </p>
        <p className="reveal-4">
        I studied cs & econ at csuf, served as board of directors on <a href="https://asi.fullerton.edu/" target="_blank" rel="noopener noreferrer">ASI</a>, 
          directed <a href="https://fullyhacks.acmcsuf.com/" target="_blank" rel="noopener noreferrer">FullyHacks</a> twice,
          led ACM{' '}
          <a href="https://acmcsuf.com/teams?term=F24#nodebuds" target="_blank" rel="noopener noreferrer">NodeBuds</a>,
          and won 7 hackathons.
        </p>
        <p className="reveal-5">
            On views, I support American dynamism, yimbys, abundance economics, and mechanism design.
            Find my thoughts <Link to="/writing">here</Link>. </p>

        {/* <p>
          When 
        </p>
        <br /> */}

        {/* <p>
          I spawned on a leap year, am ¾ Viet ¼ Chinese, and am incredibly proud of my heritage.
          I'm also addicted to sc2, poker, and I 
        </p>
        <br /> */}

        <p className="reveal-6">
          Reach me via{' '}
          <a href="https://www.linkedin.com/in/lyyeric/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          {' '}or{' '}
          <a href="mailto:ly.eric2022@gmail.com">email</a>.
           This is my{' '}
           <a
             href={RESUME_URL}
             className="resume-link"
             onClick={(event) => {
               event.preventDefault();
               setResumeOpen(true);
             }}
           >
             resume
           </a>.
         </p>
         {/* <br />
         <p>
           Also see: {' '}
           <ul>
           <li><a href="https://tradeflows.us" target="_blank" rel="noopener noreferrer">tradeflows.us</a></li>
           <li><a href="https://linkra.dev" target="_blank" rel="noopener noreferrer">linkra.dev</a></li>
           <li><a href="https://forms.gle/78b7b3djWYi3ve7VA" target="_blank" rel="noopener noreferrer">girlfriend application</a></li>
           </ul>
         </p>
        <br /> */}
      </div>

      {resumeOpen &&
        createPortal(
          <div
            className="resume-modal-backdrop"
            onClick={() => setResumeOpen(false)}
            role="presentation"
          >
            <button
              type="button"
              className="resume-modal__close"
              onClick={() => setResumeOpen(false)}
              aria-label="Close resume"
            >
              <X size={20} strokeWidth={1.5} />
            </button>
            <div
              className="resume-modal"
              role="dialog"
              aria-modal="true"
              aria-label="Resume"
              onClick={(event) => event.stopPropagation()}
            >
              <iframe
                className="resume-modal__frame"
                title="Eric Ly resume"
                src={`${RESUME_URL}#toolbar=0&navpanes=0&scrollbar=0`}
              />
            </div>
          </div>,
          document.body
        )}

      <footer className="webring-footer">
        <a href="https://webring-1.vercel.app/?from=lyyeric&dir=prev" rel="noopener noreferrer" className="webring-link" title="Previous site">
          <ChevronLeft size={18} />
        </a>
        <span className="copyright">© 2026 Eric Ly</span>
        <a href="https://webring-1.vercel.app/?from=lyyeric&dir=next" rel="noopener noreferrer" className="webring-link" title="Next site">
          <ChevronRight size={18} />
        </a>
      </footer>
    </div>
  );
};

export default CompactView;

