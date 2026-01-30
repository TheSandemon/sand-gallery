import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your actual Firebase project configuration
// You can find this in the Firebase Console under Project Settings > General > Your Apps
const firebaseConfig = {
    apiKey: "AIzaSyCwz1TaDlxamSbKDraSfmMotFBoLWZ08Wc",
    authDomain: "sand-gallery-lab.firebaseapp.com",
    projectId: "sand-gallery-lab",
    storageBucket: "sand-gallery-lab.appspot.com",
    messagingSenderId: "994096883540",
    appId: "1:994096883540:web:90c2fdf989b12e07dacac1",
    measurementId: "G-7TNLB1RS80"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
