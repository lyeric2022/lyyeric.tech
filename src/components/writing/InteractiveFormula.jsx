import React, { useState, useRef, useEffect } from 'react';
import './InteractiveFormula.scss';

const InteractiveFormula = ({ formula, explanation, triggerText = "formula" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);
  const popupRef = useRef(null);

  useEffect(() => {
    if (isVisible && containerRef.current && popupRef.current) {
      const container = containerRef.current;
      const popup = popupRef.current;
      const rect = container.getBoundingClientRect();
      
      // Wait for popup to render to get its actual width
      setTimeout(() => {
        const popupRect = popup.getBoundingClientRect();
        const popupWidth = popupRect.width || 350;
        const viewportWidth = window.innerWidth;
        const centerX = rect.left + rect.width / 2;
        
        // Use fixed positioning to escape overflow constraints
        popup.style.position = 'fixed';
        popup.style.top = `${rect.bottom + 4}px`;
        
        // Check if popup goes off right edge
        if (centerX + popupWidth / 2 > viewportWidth - 20) {
          popup.style.left = 'auto';
          popup.style.right = '20px';
          popup.style.transform = 'none';
        }
        // Check if popup goes off left edge
        else if (centerX - popupWidth / 2 < 20) {
          popup.style.left = '20px';
          popup.style.right = 'auto';
          popup.style.transform = 'none';
        }
        else {
          popup.style.left = `${centerX}px`;
          popup.style.right = 'auto';
          popup.style.transform = 'translateX(-50%)';
        }
      }, 0);
    }
  }, [isVisible]);

  return (
    <span className="interactive-formula-container" ref={containerRef}>
      <span 
        className="formula-trigger"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
      >
        {triggerText}
      </span>
      {isVisible && (
        <div className="formula-popup" ref={popupRef}>
          <div className="formula-content">
            <code>{formula}</code>
            {explanation && <p className="formula-explanation">{explanation}</p>}
          </div>
        </div>
      )}
    </span>
  );
};

export default InteractiveFormula;

