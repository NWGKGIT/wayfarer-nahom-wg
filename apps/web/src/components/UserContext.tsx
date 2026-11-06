'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type User = {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  role?: string;
  isSystemAdmin?: boolean;
};

export const SEEDED_USERS: User[] = [
  {
    id: 'sara',
    name: 'Sara',
    bio: 'Cultural heritage explorer fascinated by Addis Ababa’s rich history, museums, and historical landmarks.',
    role: 'Cultural & History Enthusiast',
  },
  {
    id: 'abel',
    name: 'Abel',
    bio: 'Specialty coffee aficionado and culinary explorer searching for the freshest roasts and authentic bites.',
    role: 'Coffee & Culinary Explorer',
  },
  {
    id: 'liya',
    name: 'Liya',
    bio: 'Nature enthusiast, landscape photographer, and hiker exploring mountain overlooks and lush parks.',
    role: 'Nature & High-Altitude Adventurer',
  },
  {
    id: 'admin',
    name: 'Admin',
    bio: 'City curator and administrator. Manages places, schedules guided tours, and oversees traveller personas.',
    role: 'System & City Curator',
    isSystemAdmin: true,
  },
];

type UserContextType = {
  userId: string | null;
  currentUser: User | null;
  users: User[];
  isAdmin: boolean;
  setUserId: (id: string | null) => void;
  signOut: () => void;
  refreshUsers: () => Promise<void>;
};

const UserContext = createContext<UserContextType>({
  userId: null,
  currentUser: null,
  users: SEEDED_USERS,
  isAdmin: false,
  setUserId: () => {},
  signOut: () => {},
  refreshUsers: async () => {},
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

  const refreshUsers = async () => {
    try {
      const res = await fetch('/api/wayfarer', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.users)) {
          // Merge DB users with preset roles/bios
          const merged: User[] = data.users.map((dbUser: { id: string; name: string }) => {
            const preset = SEEDED_USERS.find(p => p.id === dbUser.id);
            return {
              id: dbUser.id,
              name: dbUser.name,
              bio: preset?.bio || 'Traveller exploring the best spots in Addis Ababa.',
              role: preset?.role || (dbUser.id === 'admin' ? 'System & City Curator' : 'Traveller'),
              isSystemAdmin: dbUser.id === 'admin',
            };
          });

          // Ensure Admin is always included
          if (!merged.some(u => u.id === 'admin')) {
            const adminPreset = SEEDED_USERS.find(u => u.id === 'admin')!;
            merged.push(adminPreset);
          }

          setUsers(merged);
        }
      }
    } catch {
      // Keep existing users if fetch fails
    }
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem('wayfarer_user_id');
      if (stored) {
        setUserIdState(stored);
      }
    } catch {
      // localStorage may fail in restricted environments
    }
    refreshUsers();
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
  const isAdmin = currentUser?.id === 'admin' || userId === 'admin';

  return (
    <UserContext.Provider
      value={{
        userId,
        currentUser,
        users,
        isAdmin,
        setUserId,
        signOut,
        refreshUsers,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

