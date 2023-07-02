import React from 'react';

import symbolicRegressorImage from "./assets/symbolic_regressor.png";
import paydayPurgatoryImage from "./assets/payday_purgatory.png";
import projectilePoopersImage from "./assets/projectile_poopers.png";
import anhChiEmVinesImage from "./assets/vsa-ace.png"
import hoaVietMarketImage from "./assets/hoa_viet_market.png"
import bolbsEvolutionImage from "./assets/bolbs-evolutionary-simulator.png"
import martingaleSimulatorImage from "./assets/martingale.png"
import funtimeTriviaImage from "./assets/funtime_trivia.png"
import pongFromP5Image from "./assets/p5_pong.png"
import ameliorationGameImage from "./assets/amelioration.png"

const Projects = () => {
    const handleOpenSymbolicRegressor = () => {
        const fileUrl = './symbolic_regressor_pringles.html';
        window.open(fileUrl, '_blank');
    };

    return (
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
                    <a href="https://vsa-ace-vines.vercel.app/" target="_blank" rel="noopener noreferrer">
                        <img src={anhChiEmVinesImage} alt="Project 2" className="project-image" />
                    </a>
                    <h3>VSA Anh Chị Em Vines</h3>
                    <p>
                        VSA at CSUF has a special tradition of veteran members "adopting" new members in their "lines".
                        This process is fun, unique, and spans a decade.
                        However, it is difficult recognize who belongs in which ancestral line, so I developed a 2D visualizer that uses D3.js to graph members' ancestral lines.
                        On the page, users are also able to filter through specific lines, which would promptly show only members within such lines.
                    </p>
                </div>
                <div className="card project-card">
                    <a href="https://www.hoa-viet-market.lyyeric.tech/" target="_blank" rel="noopener noreferrer">
                        <img src={hoaVietMarketImage} alt="Project 3" className="project-image" />
                    </a>
                    <h3>Hoa Viet Market Business Website</h3>
                    <p>
                        I developed a website for a small Vietnamese business in Los Angeles, focusing on contact pages, operating hours, customer accommodations, a photo gallery, and Google Maps integration.
                        The site's design captures the business's essence and provides visitors with a relevant information about the Hoa Viet market.
                    </p>
                </div>
                <div className="card project-card">
                    <a href="https://bolb-simulator-v1.vercel.app/" target="_blank" rel="noopener noreferrer">
                        <img src={bolbsEvolutionImage} alt="Project 3" className="project-image" />
                    </a>
                    <h3>Evolutionary AI Bolbs</h3>
                    <p>
                        Bolbs are randomly spawned with attributes like speed, color, hunger-timer, will-to-multiply, and age-timers.
                        They sustain themselves by eating plants or other bolbs.
                        Cannibalization events offer a chance for multiplication, based on the bolb's will-to-multiply.
                        Offsprings inherit similar genetic attributes.
                        As generations progress, bolbs optimize their balance between speed, hunger-timer, and will-to-multiply.
                        Natural predators are introductable to tests the species' resilience.
                    </p>
                </div>
                <div className="card project-card">
                    <a href="https://replit.com/@lyyeric/martingale-betting-simulator#" target="_blank" rel="noopener noreferrer">
                        <img src={martingaleSimulatorImage} alt="Project 3" className="project-image" />
                    </a>
                    <h3>Martingale Betting Simulator</h3>
                    <p>
                        In traditional gambling, players usually lose money but can occasionally win big.
                        The martingale betting strategy reverses these odds, allowing players to often make money but risking occasional big losses.
                        It relies on having enough funds to cover losing streaks and doubling the bet after each loss.
                        In my simulator, users can test their chances by inputting their original money, betting amounts, and the number of rounds they want to play.
                    </p>
                </div>
                <div className="card project-card">
                    <a href="https://project-day-4.lyyeric.repl.co/" target="_blank" rel="noopener noreferrer">
                        <img src={funtimeTriviaImage} alt="Project 3" className="project-image" />
                    </a>
                    <h3>Funtime Trivia</h3>
                    <p>
                        During my Google CSSI program, I worked with two other engineers to develop a gamified, learning platform.
                        We implemented several game modes, that ranged from music, history, culture, food, etc.
                        We integrated multiple pages, and utilized APIs from Giphy and Api-Ninja.
                        Our tech stack was HTML/CSS, Bulma, and vanilla Javascript.
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
    );
};

export default Projects;
