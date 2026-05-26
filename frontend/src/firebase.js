import { initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAP3sHYmTzmVLVddDjKNb1iU___BgyrV4A",
  authDomain: "project-c79e5.firebaseapp.com",
  projectId: "project-c79e5",
  storageBucket: "project-c79e5.firebasestorage.app",
  messagingSenderId: "206237826941",
  appId: "1:206237826941:web:633505c35ec556c8005614",
  measurementId: "G-B25CFDYH61"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth=getAuth(app);
export const db=getFirestore(app);



//
