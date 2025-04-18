import React from 'react';
import GoBackButton from './GoBackButton';


const PrivacyInfo = () => (
  <div className="privacy-info">
    <h2>How I Count You</h2>
    <p>
      I plant a tiny flag in your browser (localStorage). No names, just numbers. Clear your browser to reset!
    </p>
    <GoBackButton />
  </div>
);

export default PrivacyInfo;