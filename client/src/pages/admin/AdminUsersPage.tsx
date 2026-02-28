import React, { useEffect, useState } from 'react';
import { User } from '../../types';
import { adminService } from '../../services/adminService';

const ROLES: Array<'customer' | 'manager' | 'admin'> = ['customer', 'manager', 'admin'];

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const data = await adminService.getUsers();
      setUsers(data);
    } catch {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (userId: number, newRole: 'customer' | 'manager' | 'admin') => {
    try {
      const updated = await adminService.updateUserRole(userId, newRole);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? { ...u, role: updated.role } : u)));
    } catch {
      setError('Failed to update user role.');
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner" /><p>Loading users...</p></div>;
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1>Users</h1>
        <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
          {users.length} user{users.length !== 1 ? 's' : ''}
        </span>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td style={{ fontWeight: 500 }}>{user.firstName} {user.lastName}</td>
                <td style={{ color: 'var(--text-muted)' }}>{user.email}</td>
                <td>
                  <span className={`badge-role badge-role-${user.role}`}>
                    {user.role}
                  </span>
                </td>
                <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</td>
                <td>
                  <select
                    className="admin-select"
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsersPage;
