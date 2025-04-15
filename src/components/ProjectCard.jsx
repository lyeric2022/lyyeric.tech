import React from 'react';

const ProjectCard = ({ project, image, onCustomClick }) => {
  const handleClick = (e) => {
    if (onCustomClick) {
      e.preventDefault();
      onCustomClick();
    }
  };

  return (
    <div className="card project-card">
      <a
        href={project.url || "#"}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
      >
        <img
          src={image}
          alt={project.title}
          className="project-image"
        />
      </a>
      <h3>{project.title}</h3>
      <p>{project.description}</p>
      {project.tags && (
        <div className="project-tags">
          {project.tags.map(tag => (
            <span key={tag} className="project-tag">{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectCard;