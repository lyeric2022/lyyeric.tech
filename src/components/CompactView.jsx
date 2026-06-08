import React from 'react';
import { Link } from 'react-router-dom';
import './CompactView.scss';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CompactView = () => {
  return (
    <div className="compact-view">
      <div className="compact-intro">
        <h1 className="reveal-0">I'm Eric Ly</h1>
        <br />
        <p className="reveal-1">
          I was an early engineer at{' '}
          <a href="https://www.humandelta.ai/" target="_blank" rel="noopener noreferrer">Human Delta</a>, building knowledge infrastructure for enterprise AI agents. I contributed to and led several efforts:
        </p>
        <ul>
          <li className="reveal-2">
            Enterprise audit platform — crawl, analyze & remediate knowledge bases before AI deploy{' '}
            [<a href="https://www.humandelta.ai/case-studies/espn" target="_blank" rel="noopener noreferrer">blog</a>]
          </li>
          <li className="reveal-3">
            Developer platform — indexing API, multimodal document ingest, and virtual filesystem
          </li>
          <li className="reveal-4">
            Giving agents the ability to search and traverse large organizational knowledge corpora in the cloud{' '}
            [<a href="https://www.humandelta.ai/blog/vector-database-vs-knowledge-infrastructure-production" target="_blank" rel="noopener noreferrer">blog</a>]
          </li>
        </ul>
        <br />
        <p className="reveal-5">
          Before that, I worked on the Agents Developer Platform at{' '}
          <a href="https://www.letta.com/" target="_blank" rel="noopener noreferrer">Letta</a>, AI Sales agents at{' '}
          <a href="https://www.zams.com/" target="_blank" rel="noopener noreferrer">Zams</a>, and researched voice synthesis at{' '}
          <a href="https://www.att.com/" target="_blank" rel="noopener noreferrer">AT&T</a>. I also worked as a reviewer on various post-training lab data via{' '}
          <a href="https://www.mercor.com/" target="_blank" rel="noopener noreferrer">Mercor</a>.
        </p>
        <br />

        <p className="reveal-6">
        {/* In high school, my {' '} 
        <a href="https://www.congressionalappchallenge.us/21-ca46/" target="_blank" rel="noopener noreferrer">team</a>
        {' '} won the Congressional App Challenge. */}
        At CSUF, I studied CS & Econ, served as board of directors on <a href="https://asi.fullerton.edu/" target="_blank" rel="noopener noreferrer">ASI</a>, 
          directed <a href="https://fullyhacks.acmcsuf.com/" target="_blank" rel="noopener noreferrer">FullyHacks</a> twice,
          led ACM{' '}
          <a href="https://acmcsuf.com/teams?term=F24#nodebuds" target="_blank" rel="noopener noreferrer">Node Buds</a>,
          and won 7 hackathons. In hs, my team {' '}
        <a href="https://www.congressionalappchallenge.us/21-ca46/" target="_blank" rel="noopener noreferrer">won</a>
        {' '}the Congressional App Challenge, and I participated in Google CSSI.
        </p>
        <br />

        <p className="reveal-7">
            On views, I support American dynamism, yimbys, abundance economics, and mechanism design.
            Find my thoughts <Link to="/writing">here</Link>. </p>
        <br />

        {/* <p>
          When 
        </p>
        <br /> */}

        {/* <p>
          I spawned on a leap year, am ¾ Viet ¼ Chinese, and am incredibly proud of my heritage.
          I'm also addicted to sc2, poker, and I 
        </p>
        <br /> */}

        <p className="reveal-8">
          Reach me via {' '}
          <a href="https://x.com/lyyeric" target="_blank" rel="noopener noreferrer">X</a>
          ,{' '}
          <a href="https://www.linkedin.com/in/lyyeric/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          , or{' '}
          <a href="mailto:ly.eric2022@gmail.com">email</a>.
           This is my{' '}
           <a href="/Eric Ly Resume 060826.pdf" target="_blank" rel="noopener noreferrer">resume</a>.
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

