import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut as fbSignOut,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  currentUser: User | null;
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  role: UserRole;
  isAdmin: boolean;
  isManager: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string, role?: UserRole) => Promise<void>;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, name: string, role?: UserRole) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  loginAsDemo: (role: UserRole) => Promise<void>;
  loginAsDemoUser: (role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  updateRole: (newRole: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user profile from firestore or local cache
  const fetchUserProfile = async (user: User) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      
      const isDefaultAdmin = user.email === 'haris26255@gmail.com';
      
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        const profile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || data.displayName || 'Portal User',
          role: isDefaultAdmin ? 'admin' : (data.role || 'staff'),
          department: data.department || 'IT Operations',
          createdAt: data.createdAt || new Date().toISOString(),
        };
        setUserProfile(profile);
      } else {
        // Create new user profile document
        const newProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || user.email?.split('@')[0] || 'Portal User',
          role: isDefaultAdmin ? 'admin' : 'staff',
          department: 'IT Operations',
          createdAt: new Date().toISOString(),
        };
        await setDoc(userRef, newProfile);
        setUserProfile(newProfile);
      }
    } catch (err) {
      console.warn('Could not read user profile from Firestore, using auth fallback:', err);
      // Fallback profile
      const fallback: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || user.email?.split('@')[0] || 'Portal User',
        role: user.email === 'haris26255@gmail.com' ? 'admin' : 'admin', // default to admin for preview
        department: 'IT Department',
        createdAt: new Date().toISOString(),
      };
      setUserProfile(fallback);
    }
  };

  useEffect(() => {
    // Check if there's a stored demo session
    const storedDemo = localStorage.getItem('assetportal_demo_user');
    if (storedDemo && !auth.currentUser) {
      try {
        const parsed = JSON.parse(storedDemo) as UserProfile;
        setUserProfile(parsed);
        setLoading(false);
      } catch (e) {
        console.error(e);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        localStorage.removeItem('assetportal_demo_user');
        await fetchUserProfile(user);
      } else {
        const demoUser = localStorage.getItem('assetportal_demo_user');
        if (!demoUser) {
          setUserProfile(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      setLoading(false);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string, assignedRole: UserRole = 'staff') => {
    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(res.user, { displayName: name });
      const newProfile: UserProfile = {
        uid: res.user.uid,
        email: res.user.email || email,
        displayName: name,
        role: email === 'haris26255@gmail.com' ? 'admin' : assignedRole,
        department: 'IT Operations',
        createdAt: new Date().toISOString(),
      };
      try {
        await setDoc(doc(db, 'users', res.user.uid), newProfile);
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, `users/${res.user.uid}`);
      }
      setUserProfile(newProfile);
    } catch (error: any) {
      setLoading(false);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      await fetchUserProfile(res.user);
    } catch (error: any) {
      setLoading(false);
      throw error;
    }
  };

  const loginAsDemo = async (role: UserRole) => {
    setLoading(true);
    const names = {
      admin: 'Administrator (Demo)',
      manager: 'Operations Manager (Demo)',
      staff: 'IT Support Engineer (Demo)',
    };
    const emails = {
      admin: 'admin@assetportal.internal',
      manager: 'manager@assetportal.internal',
      staff: 'staff@assetportal.internal',
    };
    const demoProfile: UserProfile = {
      uid: `demo-${role}-${Date.now()}`,
      email: emails[role],
      displayName: names[role],
      role,
      department: role === 'admin' ? 'Executive IT' : role === 'manager' ? 'Hardware Asset Ops' : 'Technical Support',
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('assetportal_demo_user', JSON.stringify(demoProfile));
    setUserProfile(demoProfile);
    setLoading(false);
  };

  const signOut = async () => {
    localStorage.removeItem('assetportal_demo_user');
    setUserProfile(null);
    setCurrentUser(null);
    if (auth.currentUser) {
      await fbSignOut(auth);
    }
  };

  const updateRole = async (newRole: UserRole) => {
    if (!userProfile) return;
    const updated = { ...userProfile, role: newRole };
    setUserProfile(updated);
    if (localStorage.getItem('assetportal_demo_user')) {
      localStorage.setItem('assetportal_demo_user', JSON.stringify(updated));
    }
    if (currentUser) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid), { role: newRole }, { merge: true });
      } catch (e) {
        console.warn('Could not update role in Firestore:', e);
      }
    }
  };

  const currentRole = userProfile?.role || 'staff';
  const isAdmin = currentRole === 'admin';
  const isManager = currentRole === 'manager' || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        user: currentUser,
        userProfile,
        loading,
        role: currentRole,
        isAdmin,
        isManager,
        signInWithEmail,
        signUpWithEmail,
        signIn: signInWithEmail,
        signUp: signUpWithEmail,
        signInWithGoogle,
        loginAsDemo,
        loginAsDemoUser: loginAsDemo,
        signOut,
        updateRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
