import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyDey67QmxKQl4AuwLGpFT3UeXTtk1z6R94",
    authDomain: "lyyeric-d727f.firebaseapp.com",
    projectId: "lyyeric-d727f",
    storageBucket: "lyyeric-d727f.firebasestorage.app",
    messagingSenderId: "335055775316",
    appId: "1:335055775316:web:c9360aae04a48abfd9efc1",
    measurementId: "G-1JRGXLD88S"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Helper function to log events
export const logAnalyticsEvent = (eventName, eventParams = {}) => {
  logEvent(analytics, eventName, eventParams);
};

export { analytics };
export default app;