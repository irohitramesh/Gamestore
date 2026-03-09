import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState('');

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Fetch user profile from Firestore
                try {
                    const userDocRef = doc(db, 'users', firebaseUser.uid);
                    const userDoc = await getDoc(userDocRef);
                    const userData = userDoc.exists() ? userDoc.data() : {};
                    setUser({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName || userData.displayName || '',
                        photoURL: firebaseUser.photoURL,
                        ...userData
                    });
                } catch {
                    setUser({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName || '',
                        photoURL: firebaseUser.photoURL
                    });
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const signup = async (email, password, displayName) => {
        setAuthError('');
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            // Update Firebase profile
            await updateProfile(result.user, { displayName });
            // Create user document in Firestore
            await setDoc(doc(db, 'users', result.user.uid), {
                displayName,
                email,
                createdAt: serverTimestamp(),
                library: [],
                orders: []
            });
            return result.user;
        } catch (error) {
            const msg = getErrorMessage(error.code);
            setAuthError(msg);
            throw new Error(msg);
        }
    };

    const login = async (email, password) => {
        setAuthError('');
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            return result.user;
        } catch (error) {
            const msg = getErrorMessage(error.code);
            setAuthError(msg);
            throw new Error(msg);
        }
    };

    const logout = async () => {
        setAuthError('');
        await signOut(auth);
    };

    const clearError = () => setAuthError('');

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            authError,
            signup,
            login,
            logout,
            clearError,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
};

function getErrorMessage(code) {
    switch (code) {
        case 'auth/email-already-in-use': return 'An account with this email already exists.';
        case 'auth/invalid-email': return 'Please enter a valid email address.';
        case 'auth/weak-password': return 'Password must be at least 6 characters.';
        case 'auth/user-not-found': return 'No account found with this email.';
        case 'auth/wrong-password': return 'Incorrect password. Please try again.';
        case 'auth/invalid-credential': return 'Invalid email or password. Please try again.';
        case 'auth/too-many-requests': return 'Too many attempts. Please try again later.';
        default: return 'An error occurred. Please try again.';
    }
}
