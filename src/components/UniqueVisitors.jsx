import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import './UniqueVisitors.scss';

const VISITOR_KEY = 'site_visitor_counted';

const UniqueVisitors = () => {
  const [visitorCount, setVisitorCount] = useState(0);
  const [status, setStatus] = useState('loading');
  const [isNewVisit, setIsNewVisit] = useState(false);

  useEffect(() => {
    const fetchVisitorCount = async () => {
      try {
        const visitorRef = doc(db, 'stats', 'visitors');
        const docSnap = await getDoc(visitorRef);

        if (docSnap.exists()) {
          setVisitorCount(docSnap.data().count);

          // Only count if not already counted in localStorage
          const alreadyCounted = localStorage.getItem(VISITOR_KEY);

          if (!alreadyCounted) {
            try {
              await updateDoc(visitorRef, {
                count: increment(1)
              });

              localStorage.setItem(VISITOR_KEY, 'true');

              // Get the updated count and trigger animation
              const updatedDoc = await getDoc(visitorRef);
              setVisitorCount(updatedDoc.data().count);
              setIsNewVisit(true);

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