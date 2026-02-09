import React from 'react';
import { Link } from 'react-router-dom';
import './CompactView.scss';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CompactView = () => {
  return (
    <div className="compact-view">
      <div className="compact-intro">
        <h1>I'm Eric Ly</h1>
        <br />
        <p>Building in products & applied AI at{' '}
          <a href="https://www.humandelta.ai/" target="_blank" rel="noopener noreferrer">Human Delta</a>.
        </p>
        {/* <p>
          Currently in SF building at{' '}
          <a href="https://www.zams.com/" target="_blank" rel="noopener noreferrer">Zams</a>.{' '}
          </p> */}
        <br />
        <p>Previously, I worked on {' '} the Agents Developer Platform at {' '}
            <a href="https://www.letta.com/" target="_blank" rel="noopener noreferrer">Letta</a>, {' '} 
            AI agents at {' '}
            <a href="https://www.zams.com/" target="_blank" rel="noopener noreferrer">Zams</a>, {' '}
            researched voice models at {' '}
            <a href="https://www.att.com/" target="_blank" rel="noopener noreferrer">AT&T</a>, {' '}
            and code evals for RL at <a href="https://www.mercor.com/" target="_blank" rel="noopener noreferrer">Mercor</a>. {' '}
        </p>
        <br />

        <p>
        {/* In high school, my {' '} 
        <a href="https://www.congressionalappchallenge.us/21-ca46/" target="_blank" rel="noopener noreferrer">team</a>
        {' '} won the Congressional App Challenge. */}
        At CSUF, I studied CS & Econ, served as board of directors on <a href="https://asi.fullerton.edu/" target="_blank" rel="noopener noreferrer">ASI</a>, 
          directed <a href="https://fullyhacks.acmcsuf.com/" target="_blank" rel="noopener noreferrer">FullyHacks</a> twice,
          led <a href="https://acmcsuf.com/" target="_blank" rel="noopener noreferrer">ACM</a> Node Buds,
          and won 7 hackathons. 

        

        </p>
        {/* <p>
          <li>7 hackathons wins @ MIT, UCSD, CSULB, AT&T, AI-LA, & CA district 47, and more.</li>
          <li>Also roles @ Mercor Intelligence, Dreams for Schools, Google CSSI</li>
        </ul> */}
        <br />

        <p>
        In hs, my {' '} 
        <a href="https://www.congressionalappchallenge.us/21-ca46/" target="_blank" rel="noopener noreferrer">team</a>
        {' '} won the Congressional App Challenge, and I modded 700+ students during Google Code Next & CSSI.
        </p>
        <br />

        <p>
            On views, I support American dynamism, yimbys, abundance economics, and mechanism design.
            Find my thoughts <Link to="/drafts">here</Link>.        </p>
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

        <p>
          Reach me via {' '}
          <a href="https://x.com/lyyeric" target="_blank" rel="noopener noreferrer">X</a>
          ,{' '}
          <a href="https://www.linkedin.com/in/lyyeric/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          , or{' '}
          <a href="mailto:ly.eric2022@gmail.com">email</a>.
        </p> 
         <br />
         <p>
           This is my{' '}
           <a href="/Eric Ly Resume 120626.pdf" target="_blank" rel="noopener noreferrer">resume</a>.
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

