import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import type { AppDispatch, RootState } from '../store';
import { logoutUserThunk } from '../store/slices/authSlice';

/** Account details and log out. Shown in the header dropdown and the mobile profile sheet. */
export const ProfileMenu: React.FC<{ onDone?: () => void }> = ({ onDone }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);

  const logout = async () => {
    onDone?.();
    await dispatch(logoutUserThunk());
    navigate('/');
  };

  return (
    <>
      <div className="p-4 border-b border-white/5">
        <p className="text-sm font-semibold text-white truncate">
          {currentUser?.display_name || currentUser?.username || 'Guest User'}
        </p>
        {currentUser?.email && <p className="text-xs text-anime-text/50 truncate mt-0.5">{currentUser.email}</p>}
      </div>
      <div className="p-1.5">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-anime-text hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer text-left"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
    </>
  );
};
