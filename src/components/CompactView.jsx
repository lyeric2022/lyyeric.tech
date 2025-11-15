import React from 'react';
import './CompactView.scss';

const CompactView = () => {
  return (
    <div className="compact-view">
      <div className="compact-intro">
        <h1>I'm Eric Ly.</h1>
        <br />
        <p>Building in applied AI and product engineering. Exploring AI infra & robotics.</p>
        <br />
        <p>
          Currently an engineer @{' '}
          <a href="https://www.humandelta.ai/" target="_blank" rel="noopener noreferrer">Human Delta</a>.
        </p>        
        {/* <p>
          Currently in SF building at{' '}
          <a href="https://www.zams.com/" target="_blank" rel="noopener noreferrer">Zams</a>.{' '}
          </p> */}
        <br />
        <p>Previously...</p>
        <ul>
          <li>
            Engineering @{' '}
            <a href="https://www.zams.com/" target="_blank" rel="noopener noreferrer">Zams</a>,{' '}
            <a href="https://www.letta.com/" target="_blank" rel="noopener noreferrer">Letta</a>,{' '}
            <a href="https://www.att.com/" target="_blank" rel="noopener noreferrer">AT&T</a>
          </li>
          <li>
            <a href="https://asi.fullerton.edu/" target="_blank" rel="noopener noreferrer">ASI</a> ECS Board of Directors,{' '}
            <a href="https://fullyhacks.acmcsuf.com/" target="_blank" rel="noopener noreferrer">FullyHacks</a> director, &{' '}
            <a href="https://acmcsuf.com/" target="_blank" rel="noopener noreferrer">ACM</a> executive board
          </li>
          <li>6 hackathons wins @ MIT, UCSD, CSULB, AT&T, AI-LA, & CA district 47</li>
          <li>Also roles @ Mercor Intelligence, Dreams for Schools</li>
        </ul>
        <br />

        <p>
          Reach me on{' '}
          <a href="https://x.com/lyyeric" target="_blank" rel="noopener noreferrer">Twitter</a>
          ,{' '}
          <a href="https://www.linkedin.com/in/lyyeric/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          , or{' '}
          <a href="mailto:ly.eric2022@gmail.com">email</a>.
        </p> 
         <br />
         <p>
           This is my{' '}
           <a href="/Eric Ly Resume 102826.pdf" target="_blank" rel="noopener noreferrer">resume</a>.
         </p>
         <br />
        <p>
          Interests: breadth as a force-multiplier, American dynamism, political equilibrium markets, kelly-criterion investing, and more.
        </p>
        <br />
      </div>

    </div>
  );
};

export default CompactView;

