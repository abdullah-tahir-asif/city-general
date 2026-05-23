import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp, deleteApp } from 'firebase/app';
import { 
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  getAuth,
  updateEmail,
  updatePassword
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  getDocs,
  setDoc, 
  collection, 
  query, 
  where, 
  onSnapshot,
  orderBy
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Appointment } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  createdAt: string;
  primaryClinician: string;
  role?: 'admin' | 'patient';
}

interface FirebaseContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  appointments: Appointment[];
  loading: boolean;
  authError: string | null;
  isAdmin: boolean;
  signUp: (email: string, password: string, name: string, phone: string, dob: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  bookAppointment: (appt: Omit<Appointment, 'id' | 'userId' | 'createdAt' | 'status'>, targetUserId?: string) => Promise<Appointment>;
  updateAppointmentStatus: (apptId: string, status: 'Scheduled' | 'Completed' | 'Cancelled') => Promise<void>;
  rescheduleAppointment: (apptId: string, date: string, timeSlot: string) => Promise<void>;
  getAllPatients: () => Promise<UserProfile[]>;
  updateAdminCredentials: (newEmail?: string, newPassword?: string) => Promise<void>;
  createNewAdmin: (email: string, password: string, name: string, phone: string, dob: string) => Promise<void>;
  promoteUserToAdmin: (targetUid: string) => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Monitor auth status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      setAuthError(null);
      if (currentUser) {
        setUser(currentUser);
        const userIsAdminStatic = currentUser.email === 'abdullahtahirasif@gmail.com' || currentUser.email === 'admin@citygeneral.org';
        let userIsAdmin = userIsAdminStatic;

        // Load additional registry details from Firestore
        const userDocPath = `users/${currentUser.uid}`;
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid));

          if (adminDoc.exists() || (userDoc.exists() && (userDoc.data() as UserProfile).role === 'admin')) {
            userIsAdmin = true;
          }
          setIsAdmin(userIsAdmin);

          if (userDoc.exists()) {
            const data = userDoc.data() as UserProfile;
            setProfile({
              ...data,
              role: userIsAdmin ? 'admin' : (data.role || 'patient')
            });
          } else {
            console.warn("No user profile found for authenticated UID in Firestore. Setting up a safe default HIPAA patient file...");
            const defaultProfile: UserProfile = {
              uid: currentUser.uid,
              name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Alex Mercer',
              email: currentUser.email || 'patient.demo@citygeneral.org',
              phone: '+1 (555) 728-9412',
              dob: '1992-05-14',
              createdAt: new Date().toISOString(),
              primaryClinician: 'Dr. Robert Chen',
              role: userIsAdmin ? 'admin' : 'patient'
            };
            await setDoc(doc(db, 'users', currentUser.uid), defaultProfile);
            setProfile(defaultProfile);
          }
        } catch (err) {
          console.error("Failed to load user profile:", err);
          // If we can't load profile due to permission issue
          handleFirestoreError(err, OperationType.GET, userDocPath);
        }
      } else {
        setUser(null);
        setProfile(null);
        setAppointments([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Monitor Appointments for logged-in user in real-time (loads all for admin)
  useEffect(() => {
    if (!user) {
      setAppointments([]);
      return;
    }

    const apptCollectionPath = 'appointments';
    const q = isAdmin
      ? query(collection(db, 'appointments'))
      : query(
          collection(db, 'appointments'),
          where('userId', '==', user.uid)
        );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const apptsList: Appointment[] = [];
        snapshot.forEach((doc) => {
          apptsList.push(doc.data() as Appointment);
        });
        
        // Client-side sort by createdAt descending since Firestore handles indexes optionally
        apptsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setAppointments(apptsList);
      },
      (error) => {
        console.error("Appointments snapshot subscription issue:", error);
        handleFirestoreError(error, OperationType.LIST, apptCollectionPath);
      }
    );

    return () => unsubscribe();
  }, [user, isAdmin]);

  // Sign Up Flow
  const signUp = async (email: string, password: string, name: string, phone: string, dob: string) => {
    setLoading(true);
    setAuthError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      const isUserAdmin = email === 'abdullahtahirasif@gmail.com' || email === 'admin@citygeneral.org';

      const userProfile: UserProfile = {
        uid: newUser.uid,
        name,
        email,
        phone,
        dob,
        createdAt: new Date().toISOString(),
        primaryClinician: 'Dr. Robert Chen',
        role: isUserAdmin ? 'admin' : 'patient'
      };

      // Write to users collection
      const userDocPath = `users/${newUser.uid}`;
      try {
        await setDoc(doc(db, 'users', newUser.uid), userProfile);
        setProfile(userProfile);
      } catch (dbErr) {
        handleFirestoreError(dbErr, OperationType.CREATE, userDocPath);
      }
    } catch (err: any) {
      console.error("Auth Sign-Up Error:", err);
      setAuthError(err?.message || "Could not register new user account.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign In Flow with electronic registration fallback for demo testing attributes
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error("Auth Sign-In Error:", err);
      
      // Robust auto-signup fallback if admin user doesn't exist
      if ((email === 'admin@citygeneral.org' || email === 'abdullahtahirasif@gmail.com') && (err?.code === 'auth/user-not-found' || err?.code === 'auth/invalid-credential')) {
        console.info("Demo admin account not registered in secure Auth. Initializing electronic creation on-the-fly...");
        try {
          const adminName = email === 'abdullahtahirasif@gmail.com' ? 'Abdullah Tahir Asif' : 'Administrative Lead';
          await signUp(email, password, adminName, '+1 (555) 019-9900', '1980-01-01');
          return;
        } catch (signUpErr: any) {
          if (signUpErr?.code === 'auth/email-already-in-use') {
            const wrongPasswordErr = new Error("Incorrect password for this registered Administrator account.");
            setAuthError(wrongPasswordErr.message);
            throw wrongPasswordErr;
          }
          console.error("Auto admin-user registration failed:", signUpErr);
          setAuthError(signUpErr?.message || "Failed to establish admin credentials.");
          throw signUpErr;
        }
      }

      // Robust auto-signup fallback if demo user doesn't exist
      if (email === 'patient.demo@citygeneral.org' && (err?.code === 'auth/user-not-found' || err?.code === 'auth/invalid-credential')) {
        console.info("Demo account not registered in secure Auth. Initializing electronic creation on-the-fly...");
        try {
          await signUp(email, password, 'Alex Mercer', '+1 (555) 728-9412', '1992-05-14');
          return;
        } catch (signUpErr: any) {
          if (signUpErr?.code === 'auth/email-already-in-use') {
            const wrongPasswordErr = new Error("Incorrect password for this registered demo patient card.");
            setAuthError(wrongPasswordErr.message);
            throw wrongPasswordErr;
          }
          console.error("Auto demo-user registration failed:", signUpErr);
          setAuthError(signUpErr?.message || "Failed to establish demo patient credentials.");
          throw signUpErr;
        }
      }
      setAuthError(err?.message || "Invalid email or password.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign Out Flow
  const signOut = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      setProfile(null);
      setUser(null);
      setAppointments([]);
      setIsAdmin(false);
    } catch (err: any) {
      console.error("Auth Sign-Out Error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Book Appointment
  const bookAppointment = async (
    apptData: Omit<Appointment, 'id' | 'userId' | 'createdAt' | 'status'>,
    targetUserId?: string
  ): Promise<Appointment> => {
    if (!user) {
      throw new Error("You must be signed in to reserve a checkup slot.");
    }

    const apptId = `APT-${Math.floor(10000 + Math.random() * 90000)}`;
    const finalUserId = targetUserId || user.uid;
    const newAppt: Appointment = {
      ...apptData,
      id: apptId,
      userId: finalUserId,
      status: 'Scheduled',
      createdAt: new Date().toISOString()
    };

    const docPath = `appointments/${apptId}`;
    try {
      await setDoc(doc(db, 'appointments', apptId), newAppt);
      return newAppt;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, docPath);
    }
  };

  // Get all registered patients (Admin view)
  const getAllPatients = async (): Promise<UserProfile[]> => {
    if (!isAdmin) {
      throw new Error("Access denied: Administrative privileges required.");
    }
    const path = 'users';
    try {
      const q = collection(db, 'users');
      const querySnapshot = await getDocs(q);
      const patients: UserProfile[] = [];
      querySnapshot.forEach((doc) => {
        patients.push(doc.data() as UserProfile);
      });
      return patients;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
    }
  };

  // Cancel / Complete Appointment Status
  const updateAppointmentStatus = async (apptId: string, status: 'Scheduled' | 'Completed' | 'Cancelled') => {
    if (!user) return;
    const docPath = `appointments/${apptId}`;
    try {
      // Load current document to merge appropriately
      const apptDoc = await getDoc(doc(db, 'appointments', apptId));
      if (apptDoc.exists()) {
        const updatedDoc = {
          ...apptDoc.data(),
          status,
          updatedAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'appointments', apptId), updatedDoc);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, docPath);
    }
  };

  // Reschedule Appointment
  const rescheduleAppointment = async (apptId: string, date: string, timeSlot: string) => {
    if (!user) return;
    const docPath = `appointments/${apptId}`;
    try {
      const apptDoc = await getDoc(doc(db, 'appointments', apptId));
      if (apptDoc.exists()) {
        const updatedDoc = {
          ...apptDoc.data(),
          date,
          timeSlot,
          updatedAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'appointments', apptId), updatedDoc);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, docPath);
    }
  };

  // Update admin password / email
  const updateAdminCredentials = async (newEmail?: string, newPassword?: string) => {
    if (!user) {
      throw new Error("No active authenticated session found.");
    }
    
    setLoading(true);
    try {
      if (newEmail && newEmail.trim() !== user.email) {
        await updateEmail(user, newEmail.trim());
        // Sync profile details in firestore
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, { email: newEmail.trim() }, { merge: true });
        
        // Also update any admins document
        const adminDocRef = doc(db, 'admins', user.uid);
        const adminSnap = await getDoc(adminDocRef);
        if (adminSnap.exists()) {
          await setDoc(adminDocRef, { email: newEmail.trim() }, { merge: true });
        }

        if (profile) {
          setProfile({ ...profile, email: newEmail.trim() });
        }
      }

      if (newPassword && newPassword.trim()) {
        await updatePassword(user, newPassword.trim());
      }
    } catch (err: any) {
      console.error("Credentials update failed:", err);
      if (err?.code === 'auth/requires-recent-login') {
        throw new Error("Security Alert: Modifying administrative credentials requires a recent authentication session. Please exit the console, sign in again, and retry.");
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create robust new Admin without deleting/disturbing active user session using temporal app
  const createNewAdmin = async (
    email: string,
    password: string,
    name: string,
    phone: string,
    dob: string
  ) => {
    if (!isAdmin) {
      throw new Error("Access denied: Administrative privileges required.");
    }
    
    setLoading(true);
    const tempAppName = `TempAdmin-${Date.now()}`;
    const tempApp = initializeApp(firebaseConfig, tempAppName);
    const tempAuth = getAuth(tempApp);

    try {
      // 1. Register newly specified person
      const credential = await createUserWithEmailAndPassword(tempAuth, email.trim(), password);
      const newAdminUid = credential.user.uid;
      
      // Clean up Auth trace immediately
      await firebaseSignOut(tempAuth);
      await deleteApp(tempApp);

      // 2. Profile Doc in Users
      const userProfile: UserProfile = {
        uid: newAdminUid,
        name,
        email: email.trim(),
        phone,
        dob,
        createdAt: new Date().toISOString(),
        primaryClinician: 'Administrative Lead Team',
        role: 'admin'
      };
      await setDoc(doc(db, 'users', newAdminUid), userProfile);

      // 3. Admin Designation record in admins
      await setDoc(doc(db, 'admins', newAdminUid), {
        uid: newAdminUid,
        email: email.trim(),
        assignedAt: new Date().toISOString(),
        assignedBy: user?.email || 'System'
      });

    } catch (err: any) {
      try {
        await deleteApp(tempApp);
      } catch (_) {}
      console.error("Failed to register new Administrator:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Promote any existing patient directly to admin configuration
  const promoteUserToAdmin = async (targetUid: string) => {
    if (!isAdmin) {
      throw new Error("Access denied: Administrative privileges required.");
    }

    setLoading(true);
    try {
      const userDocRef = doc(db, 'users', targetUid);
      const userSnap = await getDoc(userDocRef);
      if (!userSnap.exists()) {
        throw new Error("The specified patient document was not found.");
      }

      const userData = userSnap.data() as UserProfile;

      // 1. Write role update
      await setDoc(userDocRef, { role: 'admin' }, { merge: true });

      // 2. Write record to admins collection
      await setDoc(doc(db, 'admins', targetUid), {
        uid: targetUid,
        email: userData.email,
        assignedAt: new Date().toISOString(),
        assignedBy: user?.email || 'System'
      });
    } catch (err: any) {
      console.error("Failed to promote target to administrative level:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <FirebaseContext.Provider value={{
      user,
      profile,
      appointments,
      loading,
      authError,
      signUp,
      signIn,
      signOut,
      bookAppointment,
      updateAppointmentStatus,
      rescheduleAppointment,
      getAllPatients,
      isAdmin,
      updateAdminCredentials,
      createNewAdmin,
      promoteUserToAdmin
    }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}
