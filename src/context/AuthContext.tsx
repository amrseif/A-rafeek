import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  db,
  FirebaseUser,
  UserProfile,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  fbSignOut,
  doc,
  setDoc,
  getDoc,
  collection,
  onSnapshot,
  deleteDoc,
} from '../lib/firebase';
import { StudyDeconstructionResponse, SavedPlan } from '../types';

export interface CustomUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
}

interface AuthContextType {
  user: FirebaseUser | CustomUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  userPlans: SavedPlan[];
  saveUserPlan: (plan: StudyDeconstructionResponse, title: string, rawInput: string, studyDays: number, dailyHours: number, difficulty: string) => Promise<string>;
  deleteUserPlan: (planId: string) => Promise<void>;
  updateUserPlan: (planId: string, updatedPlan: StudyDeconstructionResponse) => Promise<void>;
  registerUser: (email: string, password: string, username: string) => Promise<void>;
  loginUser: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logoutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = 'capsule_local_user';
const LOCAL_USERS_DB_KEY = 'capsule_registered_users';
const LOCAL_PLANS_KEY = 'capsule_user_plans_';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | CustomUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userPlans, setUserPlans] = useState<SavedPlan[]>([]);

  // Load any existing local session if Firebase isn't logged in
  useEffect(() => {
    const savedLocalUser = localStorage.getItem(LOCAL_USER_KEY);
    if (savedLocalUser && !auth.currentUser) {
      try {
        const parsed = JSON.parse(savedLocalUser);
        setUser(parsed);
        setUserProfile({
          uid: parsed.uid,
          email: parsed.email,
          displayName: parsed.displayName || 'طالب كبسولة المنهج',
          createdAt: parsed.createdAt || new Date().toISOString(),
          isVerified: true,
        });
        // Load local plans
        const localPlansStr = localStorage.getItem(LOCAL_PLANS_KEY + parsed.uid);
        if (localPlansStr) {
          setUserPlans(JSON.parse(localPlansStr));
        }
      } catch (e) {
        console.warn('Failed to parse local user session', e);
      }
    }
  }, []);

  // Listen to Firebase Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        localStorage.removeItem(LOCAL_USER_KEY); // Clear fallback if real FB auth is active
        // Fetch or create profile
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfile);
          } else {
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'طالب متميز',
              createdAt: new Date().toISOString(),
              isVerified: true,
            };
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (e) {
          console.warn('Failed to load user profile from Firestore', e);
          setUserProfile({
            uid: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || 'طالب متميز',
            createdAt: new Date().toISOString(),
            isVerified: true,
          });
        }
      } else {
        // If not logged in via Firebase, check if local user was active
        const savedLocalUser = localStorage.getItem(LOCAL_USER_KEY);
        if (savedLocalUser) {
          try {
            const parsed = JSON.parse(savedLocalUser);
            setUser(parsed);
            setUserProfile({
              uid: parsed.uid,
              email: parsed.email,
              displayName: parsed.displayName,
              createdAt: parsed.createdAt || new Date().toISOString(),
              isVerified: true,
            });
            const localPlansStr = localStorage.getItem(LOCAL_PLANS_KEY + parsed.uid);
            if (localPlansStr) {
              setUserPlans(JSON.parse(localPlansStr));
            }
          } catch (e) {
            setUser(null);
            setUserProfile(null);
            setUserPlans([]);
          }
        } else {
          setUser(null);
          setUserProfile(null);
          setUserPlans([]);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Listen to current user's study plans
  useEffect(() => {
    if (!user) {
      setUserPlans([]);
      return;
    }

    // If real Firebase Auth user, sync with Firestore + localStorage
    if (auth.currentUser && auth.currentUser.uid === user.uid) {
      try {
        const plansCol = collection(db, 'users', user.uid, 'studyPlans');
        const unsubscribePlans = onSnapshot(
          plansCol,
          (snapshot) => {
            const plans: SavedPlan[] = [];
            snapshot.forEach((doc) => {
              const data = doc.data();
              plans.push({
                id: doc.id,
                title: data.title || 'خطة دراسية',
                createdAt: data.createdAt || new Date().toISOString(),
                plan: data.plan,
                rawInput: data.rawInput || '',
                studyDays: data.studyDays || 3,
                dailyHours: data.dailyHours || 2,
                difficulty: data.difficulty || 'متوسط',
              });
            });
            plans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setUserPlans(plans);
            // Backup to local
            localStorage.setItem(LOCAL_PLANS_KEY + user.uid, JSON.stringify(plans));
          },
          (err) => {
            console.warn('Firestore plans snapshot warning, falling back to local store:', err);
            const localPlansStr = localStorage.getItem(LOCAL_PLANS_KEY + user.uid);
            if (localPlansStr) {
              setUserPlans(JSON.parse(localPlansStr));
            }
          }
        );

        return () => unsubscribePlans();
      } catch (e) {
        console.warn('Error setting up Firestore plans listener', e);
      }
    } else {
      // Local User plans
      const localPlansStr = localStorage.getItem(LOCAL_PLANS_KEY + user.uid);
      if (localPlansStr) {
        try {
          setUserPlans(JSON.parse(localPlansStr));
        } catch {
          setUserPlans([]);
        }
      }
    }
  }, [user]);

  // Google 1-Click Login
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    const fbUser = result.user;
    setUser(fbUser);
  };

  // Direct Registration with Username, Email, Password
  const registerUser = async (email: string, password: string, username: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedUsername = username.trim() || 'طالب متميز';

    try {
      // 1. Attempt Firebase Auth registration
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      const fbUser = userCredential.user;

      try {
        await updateProfile(fbUser, { displayName: trimmedUsername });
      } catch (e) {
        console.warn('Could not update profile displayName', e);
      }

      const newProfile: UserProfile = {
        uid: fbUser.uid,
        email: trimmedEmail,
        displayName: trimmedUsername,
        createdAt: new Date().toISOString(),
        isVerified: true,
      };

      try {
        await setDoc(doc(db, 'users', fbUser.uid), newProfile);
      } catch (e) {
        console.warn('Could not write profile to Firestore', e);
      }

      setUserProfile(newProfile);
      setUser(fbUser);
    } catch (err: any) {
      // If Firebase Auth has email/pass disabled (auth/operation-not-allowed), smoothly activate student profile
      if (
        err.code === 'auth/operation-not-allowed' ||
        err.code === 'auth/admin-restricted-operation' ||
        err.message?.includes('operation-not-allowed')
      ) {
        console.info('Using student profile session fallback for email/password');
        const customUid = 'std_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
        const customUser: CustomUser = {
          uid: customUid,
          email: trimmedEmail,
          displayName: trimmedUsername,
        };

        const profile: UserProfile = {
          uid: customUid,
          email: trimmedEmail,
          displayName: trimmedUsername,
          createdAt: new Date().toISOString(),
          isVerified: true,
        };

        // Save in registered users list for subsequent login
        const existingUsersStr = localStorage.getItem(LOCAL_USERS_DB_KEY);
        const existingUsers = existingUsersStr ? JSON.parse(existingUsersStr) : {};
        existingUsers[trimmedEmail] = {
          uid: customUid,
          email: trimmedEmail,
          displayName: trimmedUsername,
          password: password, // client profile session
          createdAt: profile.createdAt,
        };
        localStorage.setItem(LOCAL_USERS_DB_KEY, JSON.stringify(existingUsers));
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(customUser));

        setUser(customUser);
        setUserProfile(profile);
        setUserPlans([]);
        return;
      }
      throw err;
    }
  };

  // Direct Login with Email & Password
  const loginUser = async (email: string, password: string) => {
    const trimmedEmail = email.trim().toLowerCase();

    try {
      await signInWithEmailAndPassword(auth, trimmedEmail, password);
    } catch (err: any) {
      if (
        err.code === 'auth/operation-not-allowed' ||
        err.code === 'auth/admin-restricted-operation' ||
        err.message?.includes('operation-not-allowed')
      ) {
        // Check registered custom users
        const existingUsersStr = localStorage.getItem(LOCAL_USERS_DB_KEY);
        const existingUsers = existingUsersStr ? JSON.parse(existingUsersStr) : {};
        const matched = existingUsers[trimmedEmail];

        if (matched) {
          if (matched.password === password) {
            const customUser: CustomUser = {
              uid: matched.uid,
              email: matched.email,
              displayName: matched.displayName,
            };
            localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(customUser));
            setUser(customUser);
            setUserProfile({
              uid: matched.uid,
              email: matched.email,
              displayName: matched.displayName,
              createdAt: matched.createdAt,
              isVerified: true,
            });
            const localPlansStr = localStorage.getItem(LOCAL_PLANS_KEY + matched.uid);
            if (localPlansStr) {
              setUserPlans(JSON.parse(localPlansStr));
            }
            return;
          } else {
            throw { code: 'auth/wrong-password', message: 'كلمة المرور غير صحيحة' };
          }
        } else {
          // If not in local db either, register them directly as a seamless student profile!
          const customUid = 'std_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
          const customUser: CustomUser = {
            uid: customUid,
            email: trimmedEmail,
            displayName: trimmedEmail.split('@')[0] || 'طالب متميز',
          };
          existingUsers[trimmedEmail] = {
            uid: customUid,
            email: trimmedEmail,
            displayName: customUser.displayName,
            password: password,
            createdAt: new Date().toISOString(),
          };
          localStorage.setItem(LOCAL_USERS_DB_KEY, JSON.stringify(existingUsers));
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(customUser));
          setUser(customUser);
          setUserProfile({
            uid: customUid,
            email: trimmedEmail,
            displayName: customUser.displayName,
            createdAt: new Date().toISOString(),
            isVerified: true,
          });
          return;
        }
      }
      throw err;
    }
  };

  // Logout
  const logoutUser = async () => {
    if (auth.currentUser) {
      try {
        await fbSignOut(auth);
      } catch (e) {
        console.warn('Firebase signout error', e);
      }
    }
    localStorage.removeItem(LOCAL_USER_KEY);
    setUser(null);
    setUserProfile(null);
    setUserPlans([]);
  };

  // Save a new plan isolated to this user
  const saveUserPlan = async (
    plan: StudyDeconstructionResponse,
    title: string,
    rawInput: string,
    studyDays: number,
    dailyHours: number,
    difficulty: string
  ): Promise<string> => {
    if (!user) {
      throw new Error('يجب تسجيل الدخول لحفظ الخطة الدراسية');
    }

    const planId = 'plan_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const planData: SavedPlan = {
      id: planId,
      title: title.trim() || plan.summary?.overview_arabic?.substring(0, 40) || 'خطة المذاكرة الذكية',
      createdAt: new Date().toISOString(),
      plan,
      rawInput,
      studyDays,
      dailyHours,
      difficulty,
    };

    // 1. Always update local state & local storage
    const updatedPlans = [planData, ...userPlans.filter((p) => p.id !== planId)];
    setUserPlans(updatedPlans);
    localStorage.setItem(LOCAL_PLANS_KEY + user.uid, JSON.stringify(updatedPlans));

    // 2. Try Firestore if user is authenticated with Firebase
    if (auth.currentUser && auth.currentUser.uid === user.uid) {
      try {
        const planRef = doc(db, 'users', user.uid, 'studyPlans', planId);
        await setDoc(planRef, {
          ...planData,
          userId: user.uid,
        });
      } catch (e) {
        console.warn('Firestore write plan warning:', e);
      }
    }

    return planId;
  };

  // Update existing plan (e.g. checkbox completion or task spent time)
  const updateUserPlan = async (planId: string, updatedPlan: StudyDeconstructionResponse) => {
    if (!user) return;

    // Update in local state
    const updatedList = userPlans.map((p) => (p.id === planId ? { ...p, plan: updatedPlan } : p));
    setUserPlans(updatedList);
    localStorage.setItem(LOCAL_PLANS_KEY + user.uid, JSON.stringify(updatedList));

    // Update in Firestore
    if (auth.currentUser && auth.currentUser.uid === user.uid) {
      try {
        const planRef = doc(db, 'users', user.uid, 'studyPlans', planId);
        await setDoc(planRef, { plan: updatedPlan, updatedAt: new Date().toISOString() }, { merge: true });
      } catch (e) {
        console.warn('Failed to update plan in Firestore', e);
      }
    }
  };

  // Delete plan
  const deleteUserPlan = async (planId: string) => {
    if (!user) return;

    const filtered = userPlans.filter((p) => p.id !== planId);
    setUserPlans(filtered);
    localStorage.setItem(LOCAL_PLANS_KEY + user.uid, JSON.stringify(filtered));

    if (auth.currentUser && auth.currentUser.uid === user.uid) {
      try {
        const planRef = doc(db, 'users', user.uid, 'studyPlans', planId);
        await deleteDoc(planRef);
      } catch (e) {
        console.warn('Firestore delete plan warning', e);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        userPlans,
        saveUserPlan,
        deleteUserPlan,
        updateUserPlan,
        registerUser,
        loginUser,
        loginWithGoogle,
        logoutUser,
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
