'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, UserCheck, Lock, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type UserRole = 'admin' | 'guest';

interface AccountLoginModalProps {
  isOpen: boolean;
  currentRole: UserRole;
  onClose: () => void;
  onSelectRole: (targetRole: UserRole) => void;
}

export const AccountLoginModal: React.FC<AccountLoginModalProps> = ({
  isOpen,
  currentRole,
  onClose,
  onSelectRole,
}) => {
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);

  if (!isOpen) return null;

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple passcode check (Default: "1234" or "spiderx123")
    if (passcode === '1234' || passcode === 'spiderx123' || passcode.toLowerCase() === 'admin') {
      setErrorMsg('');
      onSelectRole('admin');
      onClose();
    } else {
      setErrorMsg('Incorrect Admin Passcode. Try "1234" or "spiderx123"');
    }
  };

  const handleGuestSelect = () => {
    setErrorMsg('');
    onSelectRole('guest');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl transition-all">
        {/* Modal Header */}
        <div className="bg-muted/40 px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Account & Access Profile</h2>
              <p className="text-xs text-muted-foreground">Select access level for document workspace</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Active Profile Indicator */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border/80">
            <span className="text-xs font-medium text-muted-foreground">Active Workspace Profile:</span>
            {currentRole === 'admin' ? (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> SpiderX Admin (Official)
              </span>
            ) : (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5" /> Guest / Custom Tester
              </span>
            )}
          </div>

          {/* Profile Choice Cards */}
          <div className="grid grid-cols-1 gap-3">
            {/* Admin Profile Card */}
            <div
              onClick={() => setSelectedRole('admin')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedRole === 'admin'
                  ? 'border-purple-500 bg-purple-500/5 shadow-xs'
                  : 'border-border hover:border-muted-foreground/40 bg-card'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">SpiderX Admin Mode</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Pre-filled with official SpiderX Robotics CIN, registered address, official letterhead, and director credentials.
                    </p>
                  </div>
                </div>
                {selectedRole === 'admin' && <CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />}
              </div>

              {/* Admin Passcode Input if selected */}
              {selectedRole === 'admin' && currentRole !== 'admin' && (
                <form onSubmit={handleAdminLogin} className="mt-4 pt-3 border-t border-purple-500/20 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      Enter Admin Passcode (Passcode: <code className="text-purple-600 dark:text-purple-400 font-bold">1234</code>)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                      <input
                        type="password"
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                        placeholder="Enter Admin Passcode..."
                        className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg bg-background border border-input focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                        autoFocus
                      />
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="flex items-center gap-1.5 text-xs text-red-500">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs py-2">
                    Verify Passcode & Log In as Admin
                  </Button>
                </form>
              )}
            </div>

            {/* Guest / Tester Profile Card */}
            <div
              onClick={() => {
                setSelectedRole('guest');
                handleGuestSelect();
              }}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedRole === 'guest'
                  ? 'border-emerald-500 bg-emerald-500/5 shadow-xs'
                  : 'border-border hover:border-muted-foreground/40 bg-card'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Guest / Custom Tester Mode</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Starts completely blank (empty CIN, address, and logo). Allows testers to upload custom letterheads & signatures freely.
                    </p>
                  </div>
                </div>
                {selectedRole === 'guest' && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-muted/40 px-6 py-3 border-t border-border flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            Data is isolated per account in LocalStorage.
          </span>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
