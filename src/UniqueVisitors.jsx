// import { useState, useEffect } from 'react';
// import { initializeApp } from 'firebase/app';
// import { getAuth, signInAnonymously } from 'firebase/auth';
// import { getDatabase, ref, push, get, onValue, set } from 'firebase/database';

// const UniqueVisitors = () => {
//   const [userUid, setUserUid] = useState("");
//   const [uniqueVisitorsCount, setUniqueVisitorsCount] = useState(0);
//   const [totalUniqueUsers, setTotalUniqueUsers] = useState(0);

//   // Firebase configuration (You should store this securely)
//   const firebaseConfig = {
//     apiKey: "AIzaSyD7XdlFRprwRLD410pVa8T_z7D4KBmPNgs",
//     authDomain: "lyyeric-tech.firebaseapp.com",
//     databaseURL: "https://lyyeric-tech-default-rtdb.firebaseio.com",
//     projectId: "lyyeric-tech",
//     storageBucket: "lyyeric-tech.appspot.com",
//     messagingSenderId: "250111611760",
//     appId: "1:250111611760:web:dd5a3e719a7fe99eca35b5",
//     measurementId: "G-E6TTM58SLJ"
//   };

//   // Initialize Firebase
//   const firebaseApp = initializeApp(firebaseConfig);
//   const auth = getAuth(firebaseApp);
//   const db = getDatabase(firebaseApp);

//   useEffect(() => {
//     const fetchUserUid = async () => {
//       try {
//         // Check if the user is already signed in
//         const user = auth.currentUser;

//         if (user) {
//           setUserUid(user.uid);
//         } else {
//           // If not signed in, sign in anonymously
//           const userCredential = await signInAnonymously(auth);
//           setUserUid(userCredential.user.uid);
//         }

//         const usersRef = ref(db, 'users');

//         // Check if UID exists in the database
//         const uidExists = await checkUserUidExists(usersRef, userUid);

//         // console.log(uidExists && userUid != "");
//         if (!uidExists && userUid != "") {
//           // User UID doesn't exist in the database, so add it
//           push(usersRef, userUid);
//           incrementTotalUniqueUsers();
//         }

//         ////////////////////////////////////////
//         const userCountRef = ref(db, "score");

//         onValue(userCountRef, (snapshot) => {
//           setTotalUniqueUsers(snapshot.val());
//         });

//         return () => {
//           userCountRef.off("value");
//         };
//         ////////////////////////////////////////

//       } catch (error) {
//         console.error("Error fetching user uid:", error);
//       }
//     };

//     // Automatically fetch user UID and update the total count when the component mounts
//     fetchUserUid();
//   }, [auth, db]);

//   const incrementTotalUniqueUsers = () => {
//     console.log("hello");
//     const userCountRef = ref(db, "score");

//     onValue(userCountRef, (snapshot) => {
//       set(userRef, snapshot.val + 1)
//     });

//     return () => {
//       userCountRef.off("value");
//     };
//   };

//   // Function to check if a user's UID exists in the database
//   const checkUserUidExists = async (usersRef, uid) => {
//     const snapshot = await get(usersRef);
//     if (snapshot.exists()) {
//       const data = snapshot.val();
//       return Object.values(data).includes(uid);
//     }
//     return false;
//   };

//   return (
//     <div>
//       <h1>Hello, World!</h1>
//       <p>User UID: {userUid}</p>
//       <p>Total Authenticated Users: {totalUniqueUsers}</p>
//     </div>
//   );
// };

// export default UniqueVisitors;