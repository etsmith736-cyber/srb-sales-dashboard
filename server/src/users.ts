import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import type { DashboardUser } from './shared-types.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const USERS_FILE = path.join(__dirname, '../../data/users.json')

interface StoredUser extends DashboardUser {
  passwordHash: string
}

function ensureDataDir() {
  const dir = path.dirname(USERS_FILE)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function loadUsers(): StoredUser[] {
  ensureDataDir()
  if (!fs.existsSync(USERS_FILE)) {
    // Create default admin user
    const defaultAdmin: StoredUser = {
      id: 1,
      email: 'admin@risingventures.com',
      passwordHash: bcrypt.hashSync('admin123', 10),
      isAdmin: 1,
      createdAt: new Date().toISOString(),
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify([defaultAdmin], null, 2))
    return [defaultAdmin]
  }
  const content = fs.readFileSync(USERS_FILE, 'utf-8')
  return JSON.parse(content)
}

function saveUsers(users: StoredUser[]) {
  ensureDataDir()
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
}

export async function validateCredentials(
  email: string,
  password: string
): Promise<{ success: boolean; user?: DashboardUser }> {
  const users = loadUsers()
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())

  if (!user) {
    return { success: false }
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    return { success: false }
  }

  const { passwordHash: _, ...publicUser } = user
  return { success: true, user: publicUser }
}

export function listUsers(): DashboardUser[] {
  const users = loadUsers()
  return users.map(({ passwordHash: _, ...u }) => u)
}

export async function addUser(
  email: string,
  password: string,
  isAdmin: number = 0
): Promise<{ success: boolean; error?: string }> {
  const users = loadUsers()

  if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, error: 'User with this email already exists' }
  }

  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters' }
  }

  const newUser: StoredUser = {
    id: Math.max(0, ...users.map((u) => u.id)) + 1,
    email,
    passwordHash: await bcrypt.hash(password, 10),
    isAdmin,
    createdAt: new Date().toISOString(),
  }

  users.push(newUser)
  saveUsers(users)
  return { success: true }
}

export function removeUser(id: number): { success: boolean; error?: string } {
  const users = loadUsers()
  const index = users.findIndex((u) => u.id === id)

  if (index === -1) {
    return { success: false, error: 'User not found' }
  }

  // Prevent removing the last admin
  const admins = users.filter((u) => u.isAdmin === 1)
  if (admins.length === 1 && users[index].isAdmin === 1) {
    return { success: false, error: 'Cannot remove the last admin user' }
  }

  users.splice(index, 1)
  saveUsers(users)
  return { success: true }
}

export async function changePassword(
  id: number,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  if (newPassword.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters' }
  }

  const users = loadUsers()
  const user = users.find((u) => u.id === id)

  if (!user) {
    return { success: false, error: 'User not found' }
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10)
  saveUsers(users)
  return { success: true }
}
