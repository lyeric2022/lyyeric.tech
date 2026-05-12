import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import './App.scss';
import './components/DownArrow.scss';
import posthog from './posthogClient';

import Projects from './Projects';
import VideoMedia from './VideoMedia';
import DownArrow from './components/DownArrow';
import { logAnalyticsEvent } from './firebase'; // Import the analytics helper
import UniqueVisitors from './components/UniqueVisitors';
import PrivacyInfo from './components/PrivacyInfo';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate, useParams } from 'react-router-dom';
import GhostGame from './components/GhostGame';
import CompactView from './components/CompactView';
import Writing from './components/writing/Writing';
import Article from './components/writing/Article';
import TierList from './components/TierList';
import WritingRouteLayout from './components/writing/WritingRouteLayout';
import { NavChromeMotionContext } from './context/NavChromeMotionContext';

function RedirectDraftsArticleToWriting() {
  const { slug } = useParams();
  return <Navigate to={`/writing/${slug}`} replace />;
}

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
    const fileUrl = './Eric Ly Resume 30926.pdf';
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
      <AppRoutesShell
        isMobile={isMobile}
        viewMode={viewMode}
        setViewMode={setViewMode}
        handleOpenFile={handleOpenFile}
        handleOpenLinkedIn={handleOpenLinkedIn}
        handleOpenGitHub={handleOpenGitHub}
        handleSendEmail={handleSendEmail}
      />
    </Router>
  );
}

function AppRoutesShell({
  isMobile,
  viewMode,
  setViewMode,
  handleOpenFile,
  handleOpenLinkedIn,
  handleOpenGitHub,
  handleSendEmail,
}) {
  const pathname = useLocation().pathname;
  const prevPathRef = useRef(null);
  const skipIntroFade = prevPathRef.current !== null && prevPathRef.current !== pathname;

  useLayoutEffect(() => {
    prevPathRef.current = pathname;
  }, [pathname]);

  return (
    <NavChromeMotionContext.Provider value={{ skipIntroFade, viewMode }}>
      <Routes>
        <Route path="/privacy" element={<PrivacyInfo />} />
        <Route path="/ghost" element={<GhostGame />} />
        <Route path="/drafts" element={<Navigate to="/writing" replace />} />
        <Route path="/drafts/:slug" element={<RedirectDraftsArticleToWriting />} />
        <Route element={<WritingRouteLayout />}>
          <Route
            path="/"
            element={
              <>
                {!isMobile && (
                  <div className="view-toggle-container">
                    <span className="toggle-label">v2</span>
                    <button
                      type="button"
                      className={`toggle-switch ${viewMode === 'v1' ? 'active' : ''}`}
                      onClick={() => setViewMode(viewMode === 'v1' ? 'v2' : 'v1')}
                      aria-label="Toggle between v1 and v2"
                    >
                      <span className="toggle-slider" />
                    </button>
                    <span className="toggle-label">v1</span>
                  </div>
                )}

                {viewMode !== 'v2' && (
                  <Link
                    to="/writing"
                    className="theme-toggle-btn"
                    style={{ textDecoration: 'none', display: 'inline-block' }}
                  >
                    Writing
                  </Link>
                )}

                {viewMode === 'v1' ? (
                  <>
                    <div className="home-screen">
                      <UniqueVisitors />
                      <div className="introduction">
                        <h4>Hi, my name is</h4>
                        <div className="content">
                          <h1>Eric Ly.</h1>
                          <h1>Eric Ly.</h1>
                        </div>
                        <h2>I&apos;m a Software Engineer. </h2>
                        <div className="introduction-paragraph">
                          <p>
                            Currently, I&apos;m studying Computer Science & Economics, at California State University,
                            Fullerton.{' '}
                          </p>
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
                        <button type="button" onClick={handleOpenFile}>
                          Resume
                        </button>
                        <button type="button" onClick={handleOpenLinkedIn}>
                          LinkedIn
                        </button>
                        <button type="button" onClick={handleOpenGitHub}>
                          GitHub
                        </button>
                        <button type="button" onClick={handleSendEmail}>
                          Email
                        </button>
                      </div>

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
          <Route path="/writing" element={<Writing />} />
          <Route path="/writing/:slug" element={<Article />} />
          <Route path="/rankings" element={<TierList />} />
          <Route path="/tier-list" element={<Navigate to="/rankings" replace />} />
        </Route>
      </Routes>
    </NavChromeMotionContext.Provider>
  );
}

export default App;
