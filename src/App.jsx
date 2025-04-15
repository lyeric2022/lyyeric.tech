import React, { useState, useEffect } from 'react';
import './App.scss';
import './components/DownArrow.scss';

import Projects from './Projects';
import VideoMedia from './VideoMedia';
import DownArrow from './components/DownArrow';

// import { UserCounter } from './firebase'; // Import the UserCounter component
// import UniqueVisitors from './UniqueVisitors';

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleOpenFile = () => {
    const fileUrl = './Eric Ly Resume 102024.pdf';
    window.open(fileUrl, '_blank');
  };

  const handleOpenLinkedIn = () => {
    const linkedInUrl = 'https://www.linkedin.com/in/lyyeric/';
    window.open(linkedInUrl, '_blank');
  };

  const handleOpenGitHub = () => {
    const gitHubUrl = 'https://github.com/lyeric2022';
    window.open(gitHubUrl, '_blank');
  };

  const handleSendEmail = () => {
    const email = 'ly.eric2022@csu.fullerton.com';
    const subject = 'Hello from your website!';
    const body = 'Hi Eric, I found your website and wanted to get in touch with you.';

    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
  };

  return (
    <>

      {/* <UniqueVisitors />     */}
      <div className="home-screen">
        <div className="introduction">
          <h4>Hi, my name is</h4>
          <div className='content'>
            <h1>Eric Ly.</h1>
            <h1>Eric Ly.</h1>


          </div>
          <h2>I'm a Software Engineer. </h2>
          <div className="introduction-paragraph">
            <p>Currently, I'm studying Computer Science & Economics, at California State University, Fullerton. </p>
            <p>This is my personal website, where I highlight my projects and interests. </p>
            <p>Thanks for reading!  👻 </p>
          </div>

        </div>


        <div className="card linkers">
          <button onClick={handleOpenFile}>Resume</button>
          <button onClick={handleOpenLinkedIn}>LinkedIn</button>
          <button onClick={handleOpenGitHub}>GitHub</button>
          <button onClick={handleSendEmail}>Email</button>
        </div>

        {/* <DownArrow /> */}
        {console.log(isMobile)}
        {!isMobile && <DownArrow />}
      </div>

      <Projects />
      <VideoMedia />

    </>
  );
}

export default App;
