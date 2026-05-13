import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyA6jb5U-x8CSFtHCZMVqHaWzLeV98MoWGE",
  authDomain: "studio-3733366627-e5d3d.firebaseapp.com",
  databaseURL: "https://studio-3733366627-e5d3d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "studio-3733366627-e5d3d",
  storageBucket: "studio-3733366627-e5d3d.firebasestorage.app",
  messagingSenderId: "195800850019",
  appId: "1:195800850019:web:1730ace5541b7a10126256"
};

const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)
