// src/boot/firebaseConfig.ts
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// Configuración firebase con variables de entorno
const firebaseConfig = {
  apiKey: import.meta.env.VITE_apiKey,
  authDomain: import.meta.env.VITE_authDomain,
  projectId: import.meta.env.VITE_projectId,
  storageBucket: import.meta.env.VITE_storageBucket,
  messagingSenderId: import.meta.env.VITE_messagingSenderId,
  appId: import.meta.env.VITE_appId,
  measurementId: import.meta.env.VITE_measurementId,
}

// Inicializar Firebase
const firebaseApp = initializeApp(firebaseConfig)

// Servicios de Firebase
export const auth = getAuth(firebaseApp)
export const db = getFirestore(firebaseApp)

export { firebaseApp }
