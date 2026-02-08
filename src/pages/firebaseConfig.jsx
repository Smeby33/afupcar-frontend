// Import de Firebase
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCTGpMxs5mz21UzcRRTr7iq8Xcs0l3HsBM",
  authDomain: "armada-d336a.firebaseapp.com",
  projectId: "armada-d336a",
  storageBucket: "armada-d336a.firebasestorage.app",
  messagingSenderId: "962273471733",
  appId: "1:962273471733:web:637e2fec0f277765e929bc",
  measurementId: "G-G2BXKWCQG1"
};
  

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
