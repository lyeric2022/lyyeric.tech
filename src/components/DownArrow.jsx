import React from 'react';
import "./DownArrow.scss";

const DownArrow = () => {
  const handleScrollToProjects = () => {
    const projectsSection = document.getElementById('projects-section');
    if (projectsSection) {
      const offset = -50; // Adjust this value to set how much further up you want to scroll
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = projectsSection.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition + offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="arrow-container" onClick={handleScrollToProjects}>
      <div className="arrow">
        <p>Explore More</p>
        <div className="arrow-right"></div>
        <div className="arrow-left"></div>
      </div>
    </div>
  );
};

export default DownArrow;