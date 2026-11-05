'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type User = {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
};

export const SEEDED_USERS: User[] = [
  {
    id: 'sara',
    name: 'Sara',
    bio: 'Cultural heritage explorer fascinated by Addis Ababa’s rich history, museums, and historical landmarks.',
  },
  {
    id: 'abel',
    name: 'Abel',
    bio: 'Specialty coffee aficionado and culinary explorer searching for the freshest roasts and authentic bites.',
  },
  {
    id: 'liya',
    name: 'Liya',
    bio: 'Nature enthusiast, landscape photographer, and hiker exploring mountain overlooks and lush parks.',
  },
];

type UserContextType = {
  userId: string | null;
  currentUser: User | null;
  users: User[];
  setUserId: (id: string | null) => void;
  signOut: () => void;
};

const UserContext = createContext<UserContextType>({
  userId: null,
  currentUser: null,
  users: SEEDED_USERS,
  setUserId: () => {},
  signOut: () => {},
});

export function UserProvider({
  children,
  initialUsers = SEEDED_USERS,
}: {
  children: React.ReactNode;
  initialUsers?: User[];
}) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [userId, setUserIdState] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('wayfarer_user_id');
      if (stored) {
        setUserIdState(stored);
      }
    } catch {
      // localStorage may fail in restricted environments
    }
  }, []);

  const setUserId = (id: string | null) => {
    setUserIdState(id);
    try {
      if (id) {
        localStorage.setItem('wayfarer_user_id', id);
      } else {
        localStorage.removeItem('wayfarer_user_id');
      }
    } catch {
      // ignore
    }
  };

  const signOut = () => {
    setUserId(null);
  };

  const currentUser = users.find(u => u.id === userId) || null;

  return (
    <UserContext.Provider
      value={{
        userId,
        currentUser,
        users,
        setUserId,
        signOut,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

