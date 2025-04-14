import React, { useState } from 'react';
import ProjectCard from './components/ProjectCard';
import { projects } from './data/projectsData';

import './App.scss'

// Direct image imports
import hackLAProjectImage from "./assets/consilia.png";
import hackmitProjectImage from "./assets/hackmit_project.png";
import symbolicRegressorImage from "./assets/symbolic_regressor.png";
import paydayPurgatoryImage from "./assets/payday_purgatory.png";
import projectilePoopersImage from "./assets/projectile_poopers.png";
import anhChiEmVinesImage from "./assets/vsa-ace.png";
import hoaVietMarketImage from "./assets/hoa_viet_market.png";
import bolbsEvolutionImage from "./assets/bolbs-evolutionary-simulator.png";
import martingaleSimulatorImage from "./assets/martingale.png";
import languageQuizImage from "./assets/language_quiz.png";
import funtimeTriviaImage from "./assets/funtime_trivia.png";
import pongFromP5Image from "./assets/p5_pong.png";
import ameliorationGameImage from "./assets/amelioration.png";

// Create image mapping object
const imageMap = {
  "consilia.png": hackLAProjectImage,
  "hackmit_project.png": hackmitProjectImage,
  "symbolic_regressor.png": symbolicRegressorImage,
  "payday_purgatory.png": paydayPurgatoryImage,
  "projectile_poopers.png": projectilePoopersImage,
  "vsa-ace.png": anhChiEmVinesImage,
  "hoa_viet_market.png": hoaVietMarketImage,
  "bolbs-evolutionary-simulator.png": bolbsEvolutionImage,
  "martingale.png": martingaleSimulatorImage,
  "language_quiz.png": languageQuizImage,
  "funtime_trivia.png": funtimeTriviaImage,
  "p5_pong.png": pongFromP5Image,
  "amelioration.png": ameliorationGameImage
};

const Projects = () => {
    const [searchTerm, setSearchTerm] = useState('');
    
    const handleOpenSymbolicRegressor = () => {
        const fileUrl = './symbolic_regressor_pringles.html';
        window.open(fileUrl, '_blank');
    };

    // Custom handlers for specific projects
    const customHandlers = {
        'Symbolic Regressor for Pringles': handleOpenSymbolicRegressor
    };

    // Filter projects based on search term
    const filteredProjects = searchTerm.trim() === '' 
        ? projects 
        : projects.filter(project => 
            project.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
            project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (project.tags && project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
          );

    return (
        <div id="projects-section" className="section-container">
            <h1 id="projects-subtitle">Projects</h1>
            
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search projects by name, description, or tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                {searchTerm && (
                    <button 
                        className="clear-search" 
                        onClick={() => setSearchTerm('')}
                        aria-label="Clear search"
                    >
                        ×
                    </button>
                )}
            </div>
            
            <div className="projects-container">
                {filteredProjects.length > 0 ? (
                    filteredProjects.map(project => (
                        <ProjectCard 
                            key={project.id} 
                            project={project}
                            image={imageMap[project.image]}
                            onCustomClick={customHandlers[project.title]}
                        />
                    ))
                ) : (
                    <div className="no-results">
                        <p>No projects found matching "{searchTerm}"</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Projects;
