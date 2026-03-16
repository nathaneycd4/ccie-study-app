const STORAGE_KEY = 'ccie_auth_email'
const ALLOWED_EMAIL = import.meta.env.VITE_ALLOWED_EMAIL as string | undefined
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL as string | undefined

export function getStoredEmail(): string | null {
  return localStorage.getItem(STORAGE_KEY)
}

export function isAuthenticated(): boolean {
  const email = getStoredEmail()
  if (!email) return false
  if (ALLOWED_EMAIL) return email.toLowerCase() === ALLOWED_EMAIL.toLowerCase()
  return true
}

export function login(email: string): boolean {
  if (ALLOWED_EMAIL && email.toLowerCase() !== ALLOWED_EMAIL.toLowerCase()) {
    return false
  }
  localStorage.setItem(STORAGE_KEY, email)
  return true
}

export function isAdmin(): boolean {
  const email = getStoredEmail()
  if (!email) return false
  if (!ADMIN_EMAIL) return false
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
}

export function logout(): void {
  localStorage.removeItem(STORAGE_KEY)
}
