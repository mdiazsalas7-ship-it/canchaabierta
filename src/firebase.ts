import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCgqeJEq40NtwIUzEcClVw9LOiq66F-up8",
  authDomain: "serviciosph-panama.firebaseapp.com",
  projectId: "serviciosph-panama",
  storageBucket: "serviciosph-panama.firebasestorage.app",
  messagingSenderId: "96060125590",
  appId: "1:96060125590:web:ad58104f3c1929ca646db7"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;