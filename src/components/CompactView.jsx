import React from 'react';
import './CompactView.scss';

const CompactView = () => {
  return (
    <div className="compact-view">
      <div className="compact-intro">
        <h1>I'm Eric Ly</h1>
        <br />
        <p>Building in applied AI and product engineering.</p>
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
            SWE @{' '}
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
          <li>Also roles @ Mercor Intelligence, Dreams for Schools, Google CSSI</li>
        </ul>
        <br />

        <p>
          Reach me on{' '}
          <a href="https://x.com/lyyeric" target="_blank" rel="noopener noreferrer">Twitter</a>
          ,{' '}
          <a href="https://www.linkedin.com/in/lyyeric/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          , or{' '}
          <a href="mailto:ly.eric2022@gmail.com">lyeric2022@gmail.com</a>.
        </p> 
         <br />
         <p>
           This is my{' '}
           <a href="/Eric Ly Resume 102826.pdf" target="_blank" rel="noopener noreferrer">resume</a>.
         </p>
         <br />
         <p>
           Also see: {' '}
           <ul>
           <li><a href="https://tradeflows.us" target="_blank" rel="noopener noreferrer">tradeflows.us</a></li>
           <li><a href="https://linkra.dev" target="_blank" rel="noopener noreferrer">linkra.dev</a></li>
           <li><a href="https://forms.gle/78b7b3djWYi3ve7VA" target="_blank" rel="noopener noreferrer">girlfriend application</a></li>
           </ul>
         </p>
        <br />
      </div>

    </div>
  );
};

export default CompactView;

