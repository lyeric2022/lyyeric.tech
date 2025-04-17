import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import './UniqueVisitors.scss';

// Add this to your analytics/tracking script
function trackVisitor() {
  const visitorKey = 'site_visitor_counted';
  
  // Check if visitor was already counted
  const wasCounted = localStorage.getItem(visitorKey);
  
  if (!wasCounted) {
    // Count as new visitor (first time only)
    localStorage.setItem(visitorKey, 'true');
    
    // Your existing code to count a new visitor
    recordNewVisitor();
  }
}

function recordNewVisitor() {
  // Your existing analytics call to record a new visitor
}

const UniqueVisitors = () => {
  const [visitorCount, setVisitorCount] = useState(0);
  const [status, setStatus] = useState('loading');
  const [isNewVisit, setIsNewVisit] = useState(false);

  useEffect(() => {
    const fetchVisitorCount = async () => {
      try {
        const visitorRef = doc(db, 'stats', 'visitors');
        
        // Get the current count
        const docSnap = await getDoc(visitorRef);
        
        if (docSnap.exists()) {
          // Show the initial count
          setVisitorCount(docSnap.data().count);
          
          // Check if this is a new session
          const lastVisit = sessionStorage.getItem('lastVisitDate');
          const now = new Date().toDateString();
          
          if (!lastVisit || lastVisit !== now) {
            // New visitor! Increment count
            try {
              await updateDoc(visitorRef, {
                count: increment(1)
              });
              
              // Store the visit date
              sessionStorage.setItem('lastVisitDate', now);
              
              // Get the updated count and trigger animation
              const updatedDoc = await getDoc(visitorRef);
              setVisitorCount(updatedDoc.data().count);
              setIsNewVisit(true);
              
              // Reset special animation after it plays
              setTimeout(() => {
                setIsNewVisit(false);
              }, 3000);
            } catch (updateError) {
              console.error("Error updating count:", updateError);
            }
          }
          
          setStatus('success');
        } else {
          console.error("No visitor document found!");
          setStatus('error');
        }
      } catch (err) {
        console.error("Firestore error:", err);
        setStatus('error');
      }
    };

    fetchVisitorCount();
  }, []);

  useEffect(() => {
    // Call this when page loads
    trackVisitor();
  }, []);

  return (
    <div className={`visitor-counter ${status}`}>
      <div className="counter-content">
        <div className={`fire-emoji ${isNewVisit ? 'new-visit' : ''}`}>🔥</div>
        <div className="visitor-count-container">
          <span className="visitor-label">Visitors:</span>
          <span className={`visitor-count ${isNewVisit ? 'new-visit' : ''}`}>{visitorCount}</span>
        </div>
      </div>
    </div>
  );
};

export default UniqueVisitors;