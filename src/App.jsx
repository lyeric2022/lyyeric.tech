import React from 'react';
import './App.scss';

import hoaVietMarketImage from "./assets/hoa_viet_market.png"
import symbolicRegressorImage from "./assets/symbolic_regressor.png";
import paydayPurgatoryImage from "./assets/payday_purgatory.png";
import projectilePoopersImage from "./assets/projectile_poopers.png";
import pongFromP5Image from "./assets/p5_pong.png"
import ameliorationGameImage from "./assets/amelioration.png"

function App() {
  const handleOpenFile = () => {
    const fileUrl = './07.01.23_resume.pdf';
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

  const handleOpenSymbolicRegressor = () => {
    const fileUrl = './symbolic_regressor_pringles.html';
    window.open(fileUrl, '_blank');
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
            <a href="#" onClick={handleOpenSymbolicRegressor}>
              <img src={symbolicRegressorImage} alt="Project 3" className="project-image" />
            </a>
            <h3>Symbolic Regressor for Pringles</h3>
            <p>
              During my ASSURE-US research program, I worked genetic programming and developed a usable generator model within symbolic regression.
              Given only 50 data points representing a hyperbolic paraboloid, the model can successfully reveal many shapes' mathematical formulas.
              Behind the scenes, the symbolic regressor uses natural selections, crossovers, and mutations, to derive the fittest genetic programs across multiple generations.
            </p>
          </div>
          <div className="card project-card">
            <a href="https://www.payday-purgatory.lyyeric.tech/" target="_blank" rel="noopener noreferrer">
              <img src={paydayPurgatoryImage} alt="Project 1" className="project-image" />
            </a>
            <h3>Payday Purgatory</h3>
            <p>
              Players are authenticated through Firebase authenticator, and data is stored/modified on Firebase's database.
              Each round, players contribute a portion of their total bank balance.
              The player with the lowest contributions that round, loses a heart.
              If all hearts are depleted, the player is eliminated.
              The objective is be the last contributor standing.
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
          <div className="card project-card">
            <a href="https://editor.p5js.org/lyyy.eric/full/FOjoMB4WQ" target="_blank" rel="noopener noreferrer">
              <img src={pongFromP5Image} alt="Project 3" className="project-image" />
            </a>
            <h3>Multi-mode Pong</h3>
            <p>
              Play with friends, where each player can navigate their paddles via the keyboard keys. 
              Play solo, and battle against two possible AI bots that mimicks real players.
              Or, watch as a spectator, as AI bots battle it out in Pong. 
              Nuanced features includes ball-color transformations, after bounces, and a tracker to measure how fast the ball is moving.
            </p>
          </div>
          <div className="card project-card">
            <a href="https://editor.p5js.org/lyyy.eric/full/Fi3PUVueB" target="_blank" rel="noopener noreferrer">
              <img src={ameliorationGameImage} alt="Project 3" className="project-image" />
            </a>
            <h3>Amelioration</h3>
            <p>
              During Google's Code Next Connect program, I created a sprite-based runner game in p5.js, inspired by Jetpack Joyride and Temple Run.
              The objective is to reach the last spaceship while avoiding lava pits.
              I playtested the game with friends and mentors, incorporated critical feedback, and added features like high-score tracking, scenery transformations, speed variations, customizable skins, pausing mechanics, and background music.
            </p>
          </div>
        </div>
      </div>

    </>
  );
}

export default App;
