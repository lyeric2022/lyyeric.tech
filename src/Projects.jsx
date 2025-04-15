import React, { useState, useEffect } from 'react';
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
import canticumImage from "./assets/canticum.png";
import studyDashImage from "./assets/study_dash.png";
import rootsAIImage from "./assets/diamondhacks2025.png";

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
    "amelioration.png": ameliorationGameImage,
    "canticum.png": canticumImage,
    "study_dash.png": studyDashImage,
    "diamondhacks2025.png": rootsAIImage,
};

const Projects = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [projectList, setProjectList] = useState([...projects]);
    const [isShuffled, setIsShuffled] = useState(false);
    
    // Custom handlers for specific projects
    const handleOpenSymbolicRegressor = () => {
        const fileUrl = './symbolic_regressor_pringles.html';
        window.open(fileUrl, '_blank');
    };
    
    const customHandlers = {
        'Symbolic Regressor for Pringles': handleOpenSymbolicRegressor
    };

    // Fisher-Yates (Knuth) shuffle algorithm - much more robust randomization
    const shuffleArray = (array) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };

    // Properly randomize projects
    const randomizeProjects = () => {
        const shuffled = shuffleArray([...projects]);
        setProjectList(shuffled);
        setIsShuffled(true);
    };

    // Reset to original order
    const resetOrder = () => {
        setProjectList([...projects]);
        setIsShuffled(false);
    };

    // Filter projects based on search
    useEffect(() => {
        const baseList = isShuffled ? shuffleArray([...projects]) : [...projects];
        
        if (searchTerm.trim() === '') {
            setProjectList(baseList);
        } else {
            const filtered = baseList.filter(project =>
                project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (project.tags && project.tags.some(tag => 
                    tag.toLowerCase().includes(searchTerm.toLowerCase())
                ))
            );
            setProjectList(filtered);
        }
    }, [searchTerm, isShuffled]);

    return (
        <div id="projects-section" className="section-container">
            <h1 id="projects-subtitle">Projects</h1>
            
            <div className="projects-toolbar">
                <div className="search-wrapper">
                    <input
                        type="text"
                        placeholder="Search projects..."
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
                
                <div className="toolbar-actions">
                    <button 
                        className={`toolbar-btn shuffle-btn ${isShuffled ? 'active' : ''}`}
                        onClick={randomizeProjects}
                        aria-label="Randomize projects"
                    >
                        <span className="btn-icon">⟳</span>
                        <span className="btn-text">Shuffle</span>
                    </button>
                    
                    {isShuffled && (
                        <button 
                            className="toolbar-btn reset-btn"
                            onClick={resetOrder}
                            aria-label="Reset to original order"
                        >
                            <span className="btn-icon">↺</span>
                            <span className="btn-text">Reset</span>
                        </button>
                    )}
                </div>
            </div>
            
            <div className="projects-container">
                {projectList.length > 0 ? (
                    projectList.map(project => (
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
