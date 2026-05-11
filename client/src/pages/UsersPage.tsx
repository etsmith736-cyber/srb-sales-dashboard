import { useState } from 'react'
import { trpc } from '@/lib/trpc'
import { UserPlus, Trash2 } from 'lucide-react'

interface UsersPageProps {
  currentUserEmail: string
  isAdmin: boolean
}

export function UsersPage({ currentUserEmail, isAdmin }: UsersPageProps) {
  const utils = trpc.useUtils()
  const { data: users = [], isLoading } = trpc.dashboardUsers.list.useQuery()
  const [showAdd, setShowAdd] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('0')
  const [error, setError] = useState('')

  const addMutation = trpc.dashboardUsers.add.useMutation({
    onSuccess: () => { utils.dashboardUsers.list.invalidate(); setEmail(''); setPassword(''); setShowAdd(false); setError('') },
    onError: (e) => setError(e.message),
  })
  const removeMutation = trpc.dashboardUsers.remove.useMutation({
    onSuccess: () => utils.dashboardUsers.list.invalidate(),
  })

  if (!isAdmin) {
    return <div className="text-center py-16 text-[#2E2D32]/50">Only admins can manage users.</div>
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#2E2D32]">Users</h2>
          <p className="text-xs text-[#2E2D32]/50">Manage dashboard access and users</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1.5 px-3 py-2 bg-[#C4F700] hover:bg-[#b8e800] text-[#2E2D32] text-sm font-medium rounded-lg transition-colors">
          <UserPlus size={14} /> Add user
        </button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm space-y-3">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          <input type="password" placeholder="Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="0">User</option>
            <option value="1">Admin</option>
          </select>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button onClick={() => addMutation.mutate({ email, password, isAdmin: parseInt(role) })} disabled={addMutation.isPending} className="px-4 py-2 bg-[#C4F700] hover:bg-[#b8e800] text-[#2E2D32] text-sm font-medium rounded-lg">
            {addMutation.isPending ? 'Adding...' : 'Add User'}
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-[#2E2D32]/50">Loading...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#2E2D32]/50">No users found</div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-4 py-3 text-left text-xs font-medium text-[#2E2D32]/60 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#2E2D32]/60 uppercase">Role</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-[#2E2D32]/60 uppercase">Actions</th>
            </tr></thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-50">
                  <td className="px-4 py-3 text-[#2E2D32]">{user.email}</td>
                  <td className="px-4 py-3 text-[#2E2D32]/70">{user.isAdmin ? 'Admin' : 'User'}</td>
                  <td className="px-4 py-3 text-right">
                    {user.email !== currentUserEmail && (
                      <button onClick={() => removeMutation.mutate({ id: user.id })} className="text-red-400 hover:text-red-600 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p className="text-xs text-[#2E2D32]/40 text-center">Contact an admin to add or remove users.</p>
    </div>
  )
}
