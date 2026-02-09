import React, { useState, useEffect } from 'react';
import './App.scss';
import './components/DownArrow.scss';
import posthog from './posthogClient';

import Projects from './Projects';
import VideoMedia from './VideoMedia';
import DownArrow from './components/DownArrow';
import { logAnalyticsEvent } from './firebase'; // Import the analytics helper
import UniqueVisitors from './components/UniqueVisitors';
import PrivacyInfo from './components/PrivacyInfo';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import GhostGame from './components/GhostGame';
import CompactView from './components/CompactView';
import Writing from './components/writing/Writing';
import Article from './components/writing/Article';
import TierList from './components/TierList';
import { SHOW_TIER_LIST } from './constants/siteFlags';

// Menu component that needs access to location
const MenuButton = () => {
  const location = useLocation();
  const isDraftsActive = location.pathname.startsWith('/drafts');

  return (
    <div className="menu-options">
      <Link 
        to="/drafts" 
        className={`menu-option ${isDraftsActive ? 'active' : ''}`}
      >
        Drafts
      </Link>
      {SHOW_TIER_LIST && (
        <Link 
          to="/tier-list" 
          className={`menu-option ${location.pathname === '/tier-list' ? 'active' : ''}`}
        >
          Tier List
        </Link>
      )}
    </div>
  );
};

function App() {
  const detectIsMobile = () => {
    if (typeof window === 'undefined') return false;
    const widthCheck = window.innerWidth < 768;
    const uaCheck = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    return widthCheck || uaCheck;
  };

  const [isMobile, setIsMobile] = useState(detectIsMobile());
  const [viewMode, setViewMode] = useState('v2'); // 'v1' or 'v2'
  const [theme, setTheme] = useState(() => {
    // Get theme from localStorage or default to 'light'
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    // Force dark mode when viewing v1
    if (viewMode === 'v1') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.setAttribute('data-view', 'v1');
      document.body.setAttribute('data-theme', 'dark');
    } else {
      // Apply theme normally for v2
      document.documentElement.setAttribute('data-theme', theme);
      document.body.setAttribute('data-view', 'v2');
      document.body.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    }
  }, [theme, viewMode]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };


  useEffect(() => {
    const handleResize = () => {
      setIsMobile(detectIsMobile());
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
    // console.log("Firebase Analytics initialized");
    // You can test events in development
    logAnalyticsEvent('test_event', { test_param: 'test_value' });
  }, []);

  useEffect(() => {
    if (posthog?.capture) {
      posthog.capture('app_loaded', {
        view_mode: viewMode,
        is_mobile: isMobile,
      });
    }
  }, [isMobile, viewMode]);

  useEffect(() => {
    if (isMobile && viewMode !== 'v2') {
      setViewMode('v2');
    }
  }, [isMobile, viewMode]);

  const handleOpenFile = () => {
    const fileUrl = './Eric Ly Resume 120626.pdf';
    logAnalyticsEvent('resume_click');
    if (posthog?.capture) posthog.capture('resume_click');
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
              {!isMobile && (
                <div className="view-toggle-container">
                  <span className="toggle-label">v2</span>
                  <button 
                    className={`toggle-switch ${viewMode === 'v1' ? 'active' : ''}`}
                    onClick={() => setViewMode(viewMode === 'v1' ? 'v2' : 'v1')}
                    aria-label="Toggle between v1 and v2"
                  >
                    <span className="toggle-slider" />
                  </button>
                  <span className="toggle-label">v1</span>
                </div>
              )}

              {/* {viewMode === 'v2' && (
                <button className="theme-toggle-btn" onClick={toggleTheme}>
                  {theme === 'dark' ? 'Light' : 'Dark'}
                </button>
              )} */}

              {viewMode === 'v2' ? (
                <div className="menu-container">
                  <MenuButton />
                </div>
              ) : (
                <Link to="/drafts" className="theme-toggle-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>Drafts</Link>
              )}

              {viewMode === 'v1' ? (
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

                    {/* {console.log(isMobile)} */}
                    {!isMobile && <DownArrow />}
                  </div>

                  <Projects />
                  <VideoMedia />
                </>
              ) : (
                <CompactView />
              )}
            </>
          }
        />
        <Route path="/privacy" element={<PrivacyInfo />} />
        <Route path="/ghost" element={<GhostGame />} />
        <Route path="/drafts" element={<Writing />} />
        <Route path="/drafts/:slug" element={<Article />} />
        <Route path="/tier-list" element={<TierList />} />
      </Routes>
    </Router>
  );
}

export default App;
