import React from 'react';
import { getInitials } from '../../utils/helper'
import { useLocation } from 'react-router-dom'; 

const ProfileInfo = ({ userInfo, onLogout }) => {
  const location = useLocation(); 

  const isLoginPage = location.pathname === '/login';

  const userName = userInfo?.fullName || 'Guest';
  const initials = userInfo?.fullName ? getInitials(userInfo.fullName) : 'G';

  return (
    <>
      {!isLoginPage && (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center rounded-full text-slate-950 font-medium bg-slate-100">
            {initials}
          </div>
          <div>
            <p className="text-sm font-medium">{userName}</p>
            <button
              className="text-sm text-slate-700 underline"
              onClick={onLogout}
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileInfo;
