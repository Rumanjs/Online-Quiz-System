import { create } from 'zustand';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const useAuthStore = create((set) => ({
  user: null,
  userData: null,
  loading: true,
  error: null,

  init: () => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        set({ user });
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          set({ userData: docSnap.data(), loading: false });
        } else {
          set({ loading: false });
        }
      } else {
        set({ user: null, userData: null, loading: false });
      }
    });
  },

  signup: async (email, password, displayName) => {
    set({ loading: true, error: null });
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName,
        role: 'user', // default role
        createdAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'users', user.uid), userData);
      set({ user, userData, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Wait for onAuthStateChanged to pick up the user data
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  logout: async () => {
    set({ loading: true, error: null });
    try {
      await signOut(auth);
      set({ user: null, userData: null, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  }
}));
