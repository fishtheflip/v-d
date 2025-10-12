// src/features/auth/AuthProvider.tsx
import {
    createContext, useContext, useEffect, useMemo, useState, type ReactNode,
  } from 'react';
  import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
    createUserWithEmailAndPassword,
    type User,
  } from 'firebase/auth';
  import { auth, db } from '../lib/firebase';
  import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
  
  type AuthContextType = {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string, remember?: boolean) => Promise<void>;
    logout: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    register: (email: string, password: string, displayName?: string, phone?: string) => Promise<void>;
    updateDisplayName: (displayName: string) => Promise<void>;
  };
  
  const AuthContext = createContext<AuthContextType | null>(null);
  
  export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const unsub = onAuthStateChanged(auth, (u) => {
        setUser(u);
        setLoading(false);
      });
      return () => unsub();
    }, []);
  
    const login = async (email: string, password: string, remember = true) => {
      await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email, password);
    };
  
    const logout = () => signOut(auth);
  
    const resetPassword = (email: string) => sendPasswordResetEmail(auth, email);
  
    // 🔽 Регистрация + создание профиля в Firestore
    const register = async (email: string, password: string, displayName?: string, phone?: string) => {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
  
      if (displayName) {
        await updateProfile(cred.user, { displayName });
      }
  
      await setDoc(
        doc(db, 'users', cred.user.uid),
        {
          uid: cred.user.uid,
          email,
          displayName: displayName ?? '',
          phone: phone ?? '',
          age: 'random',
          city: 'ALMIGTHY',
          createdAt: serverTimestamp(),
          status: 'prem',
          availableCourses: ['krump1'],
          premPass: 0,
          payPass: 0,
          userCourses: [],
          concreteCourses: [''],
          likedCourses: [''],
          finishedCourses: [''],
        },
        { merge: true } // на случай повторных запусков не перезатрёт существующие поля
      );
    };
  
    const updateDisplayName = async (displayName: string) => {
      if (!auth.currentUser) return;
      await updateProfile(auth.currentUser, { displayName });
      await setDoc(
        doc(db, 'users', auth.currentUser.uid),
        { displayName },
        { merge: true }
      );
    };
  
    const value = useMemo(
      () => ({ user, loading, login, logout, resetPassword, register, updateDisplayName }),
      [user, loading]
    );
  
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
  }
  
  export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
  };
  