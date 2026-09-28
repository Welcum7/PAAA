import React, { useState } from 'react';
import { Shield, KeyRound, UserCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { AdminUser, UserRole } from '../types';
import { StorageService } from '../services/storageService';
import { ROLE_PERMISSIONS } from '../data/initialData';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: AdminUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('super_admin');
  const [error, setError] = useState<string | null>(null);

  const adminUsers = StorageService.getAdminUsers();

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide an email address');
      return;
    }

    // Check if user exists in registered list
    const found = adminUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      StorageService.setCurrentAdmin(found);
      onSuccess(found);
    } else {
      // Create session for demo
      const newUser = StorageService.addAdminUser({
        name: email.split('@')[0].toUpperCase(),
        email,
        role: selectedRole,
        department: 'Electoral Board Operations',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      });
      StorageService.setCurrentAdmin(newUser);
      onSuccess(newUser);
    }
  };

  const handleQuickDemoLogin = (user: AdminUser) => {
    StorageService.setCurrentAdmin(user);
    onSuccess(user);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600" />

        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-white">
                  PAAA Administrative Portal
                </h3>
                <p className="text-xs text-slate-400">
                  Granular Role-Based Access Control (RBAC) Sign-In
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Quick 1-Click Role Logins for Easy Verification */}
          <div className="mb-6">
            <label className="text-xs font-semibold uppercase tracking-wider text-amber-400 block mb-2">
              Select Demo Role Profile (1-Click Switch)
            </label>
            <div className="space-y-2">
              {adminUsers.map((u) => {
                const perms = ROLE_PERMISSIONS[u.role];
                const badgeColor =
                  u.role === 'super_admin'
                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                    : u.role === 'auditor'
                    ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300'
                    : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300';

                return (
                  <button
                    key={u.id}
                    onClick={() => handleQuickDemoLogin(u)}
                    className="w-full p-3 bg-slate-950 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/40 rounded-xl text-left transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-10 h-10 rounded-lg object-cover border border-slate-700"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors">
                            {u.name}
                          </span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-semibold ${badgeColor}`}>
                            {u.role.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400">
                          {u.department} • <span className="text-[11px] text-slate-500">{u.email}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Permissions: {perms.canDisqualifyVotes ? 'Disqualify Votes, ' : ''}
                          {perms.canManageNominees ? 'Manage Nominees, ' : ''}
                          {perms.canManageUsers ? 'Full RBAC Admin' : 'Auditor / Report Export'}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-4 text-slate-500 text-xs uppercase tracking-wider">
              Or Custom Sign-In
            </span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {/* Custom Login Form */}
          <form onSubmit={handleCustomLogin} className="space-y-3 mt-2">
            <div>
              <label className="text-xs text-slate-300 block mb-1">Official Email Address</label>
              <input
                type="email"
                placeholder="officer@paa-awards.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Passcode / Token</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none"
                />
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Select Role Profile</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
              >
                <option value="super_admin">Super Administrator (Full System Permissions)</option>
                <option value="auditor">Tally Auditor & Electoral Integrity Officer</option>
                <option value="moderator">Category Curator & Nominee Manager</option>
              </select>
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <UserCheck className="w-4 h-4" />
              Authenticate Administrator
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
