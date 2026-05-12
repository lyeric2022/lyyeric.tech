import React from 'react';
import './DownArrow.scss';

const DownArrow = () => {
  const handleScrollToProjects = () => {
    const projectsSection = document.getElementById('projects-section');
    if (projectsSection) {
      projectsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <button
      type="button"
      className="arrow-container"
      onClick={handleScrollToProjects}
      aria-label="Scroll to projects section"
    >
      <div className="arrow">
        <p>Explore More</p>
        <div className="arrow-right" />
        <div className="arrow-left" />
      </div>
    </button>
  );
};

export default DownArrow;