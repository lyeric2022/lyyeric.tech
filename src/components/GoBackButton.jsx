import React from 'react';
import { useNavigate } from 'react-router-dom';

const GoBackButton = () => {
  const navigate = useNavigate();

  return (
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
  );
};

export default GoBackButton;