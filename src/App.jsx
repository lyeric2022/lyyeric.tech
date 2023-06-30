import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.scss';

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
        <p id="introduction-paragraph">Currently, I'm studying Computer Science & Economics, at California State University, Fullerton. </p>
        <p>This is my personal website, where I highlight my projects and interests. </p>
        <p>Thanks for reading!  👻 </p>
      </div>


      <div className="card linkers">
        <button onClick={handleOpenFile}>Resume</button>
        <button onClick={handleOpenLinkedIn}>LinkedIn</button>
        <button onClick={handleOpenGitHub}>GitHub</button>
        <button onClick={handleSendEmail}>Email</button>
      </div>

      <div className="projects-container">
        <h1 id="projects-subtitle">Projects</h1>
        <div className="card project-card">
          <img src="./src/assets/symbolic_regressor.png" alt="Project 3" className="project-image" />
          <h3>Symbolic Regressor for Pringles</h3>
          <p>
            &emsp;&emsp;During my ASSURE-US research program, I explored genetic programming and developed a usable fitness model for Symbolic Regressor.
            Given 50 data points that maps a hyperbolic paraboloid, the model was able to reveal the formula of such shape.
            BTS, the Symbolic Regressor is utilizing selections, crossovers, and mutations, to derive the fittest genetic programs, over multiple generations.
          </p>
        </div>
        <div className="card project-card">
          <img src="./src/assets/payday_purgatory.png" alt="Project 1" className="project-image" />
          <h3>Payday Purgatory</h3>
          <p>
            &emsp;&emsp;Each round, players contribute a portion of their total bank balance.
            The player with the lowest contributions that round, loses a heart.
            If all hearts are depleted, the player is eliminated.
            The objective is be the last contributor standing.
            Players are authenticated through Firebase authenticator, and data is stored/modified on Firebase's database.
          </p>
        </div>
        <div className="card project-card">
          <img src="./src/assets/projectile_poopers.png" alt="Project 2" className="project-image" />
          <h3>Projectile Poopers</h3>
          <p>
            &emsp;&emsp;I built this from Drew Conley's multiplayer JS game.
            I introduced game music and coin sounds, and developed button-based controls for mobile devices.
            I added hearts to eliminate players who go below 0, and designed/implemented projectiles that are able to shoot out and damage players.
            I created a coins market, where players are able to redeem their coins for HP and projectile damage, and utilized Firebase to authenticate, reference, and update players' & objects' data. 
          </p>
        </div>
        <div className="card project-card">
          <img src="./src/assets/hoa_viet_market.png" alt="Project 3" className="project-image" />
          <h3>Hoa Viet Market Business Website</h3>
          <p>
            &emsp;&emsp;I develop a website for a small, Vietnamese business in Los Angeles, and passed as a finalist for Snapchat Academies' engineering assessment.
            The website features contact pages, operating hours, customer accommodations, a photos photo-gallery, and Google maps integrations.
          </p>
        </div>
      </div>
    </>
  );
}

export default App;
