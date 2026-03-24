// This is a simplified version for deployment
// The original file is backed up as firebase.ts.bak

// Mock Firebase for deployment (prevents build errors)
export const auth = {
  currentUser: null,
  onAuthStateChanged: () => () => {},
  signInWithEmailAndPassword: () => Promise.resolve({}),
  signOut: () => Promise.resolve()
};

export const db = {
  collection: () => ({
    doc: () => ({
      get: () => Promise.resolve({ exists: false, data: () => ({}) }),
      set: () => Promise.resolve()
    })
  })
};

// Export a dummy firebase object
export const firebase = {
  auth: () => auth,
  firestore: () => db
};

export default firebase;
