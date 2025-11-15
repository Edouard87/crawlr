export async function createUser(userData: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const now = Timestamp.now();
    const userRef = doc(collection(db, COLLECTIONS.USERS));
    
    const user: Omit<User, "id"> = {
      ...userData,
      createdAt: now,
      updatedAt: now,
    };
    
    await setDoc(userRef, user);
    return userRef.id;
  }