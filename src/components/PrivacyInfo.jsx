import React from 'react';
import { useNavigate } from 'react-router-dom';

const PrivacyInfo = () => {
  const navigate = useNavigate();

  return (
    <div className="privacy-info">
      <h2>How I Count You</h2>
      <p>
        I plant a tiny flag in your browser (localStorage). No names, just numbers. Clear your browser to reset!
      </p>
      <button
        className="go-back-btn"
        onClick={() => navigate(-1)}
        style={{
          marginTop: '2rem',
          padding: '10px 24px',
          borderRadius: '8px',
          border: 'none',
          background: 'var(--color-accent-tertiary)',
          color: 'var(--color-background)',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >
        ← Go Back
      </button>
    </div>
  );
};

export default PrivacyInfo;