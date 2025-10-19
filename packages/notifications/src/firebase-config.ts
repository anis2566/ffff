import { initializeApp, getApps } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyA5Syucm_F2zOaTtsbZroR0Fz9AsgAeIkM",
  authDomain: "basic-org.firebaseapp.com",
  projectId: "basic-org",
  storageBucket: "basic-org.firebasestorage.app",
  messagingSenderId: "486997349567",
  appId: "1:486997349567:web:60c3b7254bf0fc8445620a",
};

export const initializeFirebase = () => {
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApps()[0];
};

export const getMessagingInstance = async () => {
  const supported = await isSupported();
  if (!supported) {
    return null;
  }
  const app = initializeFirebase();
  return getMessaging(app);
};
