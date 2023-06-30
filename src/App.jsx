import React from 'react';
import './App.scss';

import hoaVietMarketImage from "./assets/hoa_viet_market.png"
import symbolicRegressorImage from "./assets/symbolic_regressor.png";
import paydayPurgatoryImage from "./assets/payday_purgatory.png";
import projectilePoopersImage from "./assets/projectile_poopers.png";

function App() {
  const handleOpenFile = () => {
    const fileUrl = './6.29.23_resume.pdf';
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
    const email = 'ly.eric2022@csu.fullerton.com'; // Replace with your email address
    const subject = 'Hello from your website!';
    const body = 'Hi Eric, I found your website and wanted to get in touch with you.';

    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
  };

  return (
    <>
      <div className="introduction">
        <h4>Hi, my name is</h4>
        <h1>Eric Ly.</h1>
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

      <div className="section-container">
        <h1 id="projects-subtitle">Projects</h1>
        <div className="projects-container">
          <div className="card project-card">
            <img src={symbolicRegressorImage} alt="Project 3" className="project-image" />
            <h3>Symbolic Regressor for Pringles</h3>
            <p>
              During my ASSURE-US research program, I explored genetic programming and developed a usable fitness model for Symbolic Regressor.
              Given 50 data points that maps a hyperbolic paraboloid, the model was able to reveal the formula of such shape.
              BTS, the Symbolic Regressor is utilizing selections, crossovers, and mutations, to derive the fittest genetic programs, over multiple generations.
            </p>
          </div>
          <div className="card project-card">
            <a href="https://www.payday-purgatory.lyyeric.tech/" target="_blank" rel="noopener noreferrer">
              <img src={paydayPurgatoryImage} alt="Project 1" className="project-image" />
            </a>
            <h3>Payday Purgatory</h3>
            <p>
              Each round, players contribute a portion of their total bank balance.
              The player with the lowest contributions that round, loses a heart.
              If all hearts are depleted, the player is eliminated.
              The objective is be the last contributor standing.
              Players are authenticated through Firebase authenticator, and data is stored/modified on Firebase's database.
            </p>
          </div>
          <div className="card project-card">
            <a href="https://www.projectile-poopers.lyyeric.tech/" target="_blank" rel="noopener noreferrer">
              <img src={projectilePoopersImage} alt="Project 2" className="project-image" />
            </a>
            <h3>Projectile Poopers</h3>
            <p>
              Built upon Drew Conley's multiplayer JS game— adding game music, coin sounds, and mobile-friendly button-based controls.
              Implemented an HP system to eliminate players falling below 0 HP and designed projectiles for player damage.
              Created a coins market where players can redeem coins for HP and projectile upgrades— utilizing Firebase for authentication and data management.
            </p>
          </div>
          <div className="card project-card">
            <a href="https://www.hoa-viet-market.lyyeric.tech/" target="_blank" rel="noopener noreferrer">
              <img src={hoaVietMarketImage} alt="Project 3" className="project-image" />
            </a>
            <h3>Hoa Viet Market Business Website</h3>
            <p>
              I develop a website for a small, Vietnamese business in Los Angeles, and passed as a finalist for Snapchat Academies' engineering assessment.
              The website features contact pages, operating hours, customer accommodations, a photos photo-gallery, and Google maps integrations.
            </p>
          </div>
        </div>
      </div>

    </>
  );
}

export default App;
