export interface User {
  email: string;
  name: string;
  registerId: string;
  role: 'student' | 'hod';
  phone?: string;
  department?: string;
  course?: string;
  avatar?: string;
}

const USERS_KEY = 'losify_registered_users';
const CURRENT_USER_KEY = 'losify_current_user';

export const DEFAULT_HOD: User & { password: string } = {
  email: 'hod.losify@gmail.com',
  password: 'hodpassword123',
  name: 'Campus HOD Admin',
  registerId: 'HOD-001',
  role: 'hod',
};

export const DEFAULT_STUDENT: User & { password: string } = {
  email: 'student.losify@gmail.com',
  password: 'student123',
  name: 'Student User',
  registerId: 'STU-2026104',
  role: 'student',
};

export function isGmailAddress(email: string): boolean {
  if (!email) return false;
  const trimmed = email.trim().toLowerCase();
  return trimmed.endsWith('@gmail.com');
}

export function initUsers(): Array<User & { password?: string }> {
  if (typeof window === 'undefined') return [DEFAULT_HOD, DEFAULT_STUDENT];
  try {
    const saved = localStorage.getItem(USERS_KEY);
    if (!saved) {
      const initial = [DEFAULT_HOD, DEFAULT_STUDENT];
      localStorage.setItem(USERS_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(saved);
    if (!parsed.some((u: any) => u.email.toLowerCase() === DEFAULT_HOD.email.toLowerCase())) {
      parsed.push(DEFAULT_HOD);
    }
    if (!parsed.some((u: any) => u.email.toLowerCase() === DEFAULT_STUDENT.email.toLowerCase())) {
      parsed.push(DEFAULT_STUDENT);
    }
    return parsed;
  } catch {
    return [DEFAULT_HOD, DEFAULT_STUDENT];
  }
}

export function findUserByEmail(email: string): User | null {
  const users = initUsers();
  const found = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!found) return null;
  const { password: _, ...userNoPass } = found as any;
  return userNoPass;
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(CURRENT_USER_KEY) || sessionStorage.getItem(CURRENT_USER_KEY);
    if (!saved) {
      return null;
    }
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

export function login(email: string, pass: string, expectedRole?: 'student' | 'hod'): User {
  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedEmail.endsWith('@gmail.com')) {
    throw new Error('Access denied: Only valid @gmail.com email addresses are allowed.');
  }

  const users = initUsers();
  const found = users.find(
    (u) => u.email.toLowerCase() === trimmedEmail && u.password === pass
  );
  if (!found) {
    throw new Error('Invalid credentials. If you have not registered your @gmail.com account, please Sign Up first or use Continue with Google.');
  }

  if (expectedRole && found.role !== expectedRole) {
    throw new Error(`This account is registered as a ${found.role.toUpperCase()}. Please switch to the ${found.role === 'hod' ? 'HOD' : 'Student'} login tab.`);
  }

  const { password: _, ...userNoPass } = found;
  if (typeof window !== 'undefined') {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userNoPass));
    sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userNoPass));
    window.dispatchEvent(new Event('authChange'));
  }
  return userNoPass;
}

export function signup(data: {
  email: string;
  name: string;
  registerId: string;
  password: string;
  role?: 'student' | 'hod';
}): User {
  const trimmedEmail = data.email.trim().toLowerCase();
  if (!trimmedEmail.endsWith('@gmail.com')) {
    throw new Error('Registration error: Only real @gmail.com email addresses are allowed.');
  }

  const users = initUsers();
  const existingIndex = users.findIndex((u) => u.email.toLowerCase() === trimmedEmail);
  const existing = existingIndex >= 0 ? users[existingIndex] : null;

  const newUser: User & { password?: string } = {
    ...existing,
    email: trimmedEmail,
    name: data.name.trim() || (existing?.name ?? (data.role === 'hod' ? 'HOD Administrator' : 'Student')),
    registerId: data.registerId.trim() || (existing?.registerId ?? (data.role === 'hod' ? `HOD-${Math.floor(100 + Math.random() * 900)}` : `STU-${Math.floor(100000 + Math.random() * 900000)}`)),
    password: data.password || existing?.password,
    role: data.role || existing?.role || 'student',
  };

  if (existingIndex >= 0) {
    users[existingIndex] = newUser;
  } else {
    users.push(newUser);
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    const { password: _, ...userNoPass } = newUser;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userNoPass));
    sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userNoPass));
    window.dispatchEvent(new Event('authChange'));
    return userNoPass;
  }

  const { password: _, ...userNoPass } = newUser;
  return userNoPass;
}

export function loginWithFirebaseUser(
  firebaseUser: { email?: string | null; displayName?: string | null; uid: string },
  selectedRole?: 'student' | 'hod'
): { user: User; isNewUser: boolean } {
  const email = (firebaseUser.email || '').trim().toLowerCase();
  if (!email || !email.endsWith('@gmail.com')) {
    throw new Error('Access denied: Only verified @gmail.com Google accounts are allowed to log in.');
  }

  const users = initUsers();
  const existingUserIndex = users.findIndex((u) => u.email.toLowerCase() === email);

  if (existingUserIndex >= 0) {
    const existing = users[existingUserIndex];
    if (selectedRole && existing.role !== selectedRole) {
      existing.role = selectedRole;
      users[existingUserIndex] = existing;
      if (typeof window !== 'undefined') {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
      }
    }
    const { password: _, ...userNoPass } = existing;
    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userNoPass));
      sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userNoPass));
      window.dispatchEvent(new Event('authChange'));
    }
    return { user: userNoPass, isNewUser: false };
  }

  // New user signing in with Google
  const name = firebaseUser.displayName || email.split('@')[0];
  const role = selectedRole || 'student';
  const registerId = role === 'hod'
    ? `HOD-GGL-${firebaseUser.uid.substring(0, 4).toUpperCase()}`
    : `STU-GGL-${firebaseUser.uid.substring(0, 4).toUpperCase()}`;

  const newUser: User = {
    email,
    name,
    registerId,
    role,
  };

  users.push(newUser);

  if (typeof window !== 'undefined') {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    window.dispatchEvent(new Event('authChange'));
  }

  return { user: newUser, isNewUser: true };
}

export function completeGoogleRegistration(data: {
  email: string;
  name: string;
  registerId: string;
  role: 'student' | 'hod';
}): User {
  const trimmedEmail = data.email.trim().toLowerCase();
  const users = initUsers();
  const existingIndex = users.findIndex((u) => u.email.toLowerCase() === trimmedEmail);
  const existing = existingIndex >= 0 ? users[existingIndex] : null;

  // Preserve user's permanently saved custom profile attributes (registerId, phone, department, course, avatar)
  const finalRegisterId = (existing?.registerId && existing.registerId.trim().length > 0)
    ? existing.registerId
    : (data.registerId.trim() || (data.role === 'hod' ? `HOD-${Math.floor(100 + Math.random() * 900)}` : `STU-${Math.floor(100000 + Math.random() * 900000)}`));

  const updatedUser: User = {
    ...existing,
    email: trimmedEmail,
    name: (existing?.name && existing.name !== 'Google User' && existing.name !== 'Student') ? existing.name : (data.name.trim() || 'Student'),
    registerId: finalRegisterId,
    role: existing?.role || data.role,
    phone: existing?.phone || undefined,
    department: existing?.department || undefined,
    course: existing?.course || undefined,
    avatar: existing?.avatar || undefined,
  };

  if (existingIndex >= 0) {
    users[existingIndex] = updatedUser;
  } else {
    users.push(updatedUser);
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
    sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
    window.dispatchEvent(new Event('authChange'));
  }

  return updatedUser;
}

export function updateUserProfile(updates: Partial<Omit<User, 'email' | 'role'>>): User {
  const current = getCurrentUser();
  if (!current) throw new Error('No user is currently logged in.');

  const users = initUsers();
  const index = users.findIndex((u) => u.email.toLowerCase() === current.email.toLowerCase());
  
  const existingInList = index >= 0 ? users[index] : undefined;

  const updatedUser: User = {
    ...(existingInList || {}),
    ...current,
    ...updates,
    name: updates.name ? updates.name.trim() : (current.name || existingInList?.name || 'Student'),
    registerId: updates.registerId ? updates.registerId.trim() : (current.registerId || existingInList?.registerId || 'STU-000'),
  };

  if (index >= 0) {
    users[index] = updatedUser;
  } else {
    users.push(updatedUser);
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
    sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
    window.dispatchEvent(new Event('authChange'));
  }

  return updatedUser;
}

export function logout() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    window.dispatchEvent(new Event('authChange'));
  }
}