import React, { useState, useEffect } from 'react';
import './App.scss';
import './components/DownArrow.scss';

import Projects from './Projects';
import VideoMedia from './VideoMedia';
import DownArrow from './components/DownArrow';
import { logAnalyticsEvent } from './firebase'; // Import the analytics helper
import UniqueVisitors from './components/UniqueVisitors';
import PrivacyInfo from './components/PrivacyInfo';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import GhostGame from './components/GhostGame';

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    
    // Log page view when component mounts
    logAnalyticsEvent('page_view', {
      page_title: 'Home Page',
      page_location: window.location.href,
      page_path: window.location.pathname
    });
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    console.log("Firebase Analytics initialized");
    // You can test events in development
    logAnalyticsEvent('test_event', { test_param: 'test_value' });
  }, []);

  const handleOpenFile = () => {
    const fileUrl = './Eric Ly Resume 040226.pdf';
    logAnalyticsEvent('resume_click');
    window.open(fileUrl, '_blank');
  };

  const handleOpenLinkedIn = () => {
    const linkedInUrl = 'https://www.linkedin.com/in/lyyeric/';
    logAnalyticsEvent('linkedin_click');
    window.open(linkedInUrl, '_blank');
  };

  const handleOpenGitHub = () => {
    const gitHubUrl = 'https://github.com/lyeric2022';
    logAnalyticsEvent('github_click');
    window.open(gitHubUrl, '_blank');
  };

  const handleSendEmail = () => {
    const email = 'ly.eric2022@csu.fullerton.com';
    const subject = 'Hello from your website!';
    const body = 'Hi Eric, I found your website and wanted to get in touch with you.';
    
    logAnalyticsEvent('email_click');
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <div className="home-screen">
                <UniqueVisitors />
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
                    <p>
                      Thanks for reading!{' '}
                      <Link to="/ghost" style={{ textDecoration: 'none' }} title="Woah. What does this do?">
                        👻
                      </Link>
                    </p>
                  </div>
                </div>

                <div className="card linkers">
                  <button onClick={handleOpenFile}>Resume</button>
                  <button onClick={handleOpenLinkedIn}>LinkedIn</button>
                  <button onClick={handleOpenGitHub}>GitHub</button>
                  <button onClick={handleSendEmail}>Email</button>
                </div>

                {console.log(isMobile)}
                {!isMobile && <DownArrow />}
              </div>

              <Projects />
              <VideoMedia />
            </>
          }
        />
        <Route path="/privacy" element={<PrivacyInfo />} />
        <Route path="/ghost" element={<GhostGame />} />
      </Routes>
    </Router>
  );
}

export default App;
