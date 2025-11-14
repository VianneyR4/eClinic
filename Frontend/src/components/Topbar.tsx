"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  SearchNormal1,
  MessageText1,
  Setting2,
  Notification,
  ArrowDown2,
  Profile,
  DocumentText,
  Logout,
  Command,
  Bubble,
  Menu,
} from "iconsax-react";
import SyncIndicator from "./SyncIndicator";
import SearchDropdown from "./SearchDropdown";
import { apiService } from "@/services/api";

interface TopbarProps {
  onMenuClick?: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch current user for display
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await apiService.getMe();
        if (res?.success && res?.data) {
          setUser({ name: res.data.name, email: res.data.email });
        }
      } catch (e) {
        // ignore; handled by higher-level auth checks
      }
    };
    fetchUser();
  }, []);

  const getInitials = () => {
    if (user?.name) {
      const parts = user.name.trim().split(/\s+/);
      const initials = parts.slice(0, 2).map(p => p[0]?.toUpperCase()).join('');
      return initials || 'U';
    }
    if (user?.email) return user.email[0]?.toUpperCase() || 'U';
    return 'U';
  };

  return (
    <div className="bg-white h-14 border-b border-gray-200 flex items-center justify-between px-2 sm:px-4 relative">
      {/* Mobile Menu Button */}
      {onMenuClick && (
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-gray-100 rounded-md transition lg:hidden mr-2"
        >
          <Menu size={20} className="text-gray-600" />
        </button>
      )}

      {/* Left Section - Search */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 relative" ref={searchContainerRef}>
        <div className="relative flex items-center w-full max-w-xs mr-4 bg-white rounded-md shadow-sm border border-gray-100 focus-within:ring-1 focus-within:ring-gray-300 transition-all duration-200">
          {/* Search Icon */}
          <SearchNormal1
            size={16}
            className="absolute left-2 sm:left-3 text-gray-400 pointer-events-none"
          />

          {/* Input */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(e.target.value.length > 0);
            }}
            onFocus={() => {
              if (searchQuery.length > 0) {
                setShowSearchDropdown(true);
              }
            }}
            placeholder="Search patients, doctors..."
            className="w-full pl-8 sm:pl-9 pr-12 sm:pr-16 py-2 text-sm text-gray-700 placeholder-gray-400 bg-transparent rounded-xl focus:outline-none"
          />

          {/* Shortcut Hint or Command Icon */}
          <div className="absolute right-1 flex items-center gap-1">
            <button
              className="p-1 sm:p-1.5 hover:bg-gray-100 shadow-sm rounded-md transition"
              title="Command Menu"
            >
              <Command size={14} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Search Dropdown */}
        {showSearchDropdown && searchQuery && (
          <div className="absolute left-0 top-full mt-2 z-50" style={{ width: '100%'}}>
            <SearchDropdown
              query={searchQuery}
              onClose={() => setShowSearchDropdown(false)}
            />
          </div>
        )}
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Sync Indicator - Hidden on small mobile */}
        <div className="hidden sm:block">
          <SyncIndicator />
        </div>
        
        {/* Virtual Assistant - Hidden on mobile, show on tablet+ */}
        <button className="hidden md:flex px-3 md:px-5 py-1.5 bg-primary text-white text-xs rounded-md hover:bg-opacity-90 transition items-center gap-1.5" 
          onClick={() => router.push('/dashboard/assistant')}
          style={{
            height: 35,
            background: "linear-gradient(38deg,rgba(46, 55, 164, 1) 0%, rgba(87, 199, 133, 1) 98%, rgba(145, 199, 87, 1) 100%)"
          }}>
          <span className="font-medium hidden lg:inline">Virtual Assistant</span>
          <Bubble size={16} variant={"Bold"} className="text-white" />
        </button>

        {/* Settings - Hidden on mobile */}
        <button className="hidden sm:flex p-2 hover:bg-gray-100 rounded-full border border-gray-200 transition">
          <Setting2 size={16} className="text-gray-600" />
        </button>

        {/* Notifications */}
        <button className="p-2 hover:bg-gray-100 rounded-full border border-gray-200 transition relative">
          <Notification size={16} className="text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Profile */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center gap-1.5 p-0.5 hover:bg-gray-100 rounded-md transition"
          >
            <div className="relative">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-xs">{getInitials()}</span>
              </div>
              <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white"></span>
            </div>
            <ArrowDown2
              size={14}
              className={`text-gray-600 transition ${
                showProfileDropdown ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {showProfileDropdown && (
            <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-2 z-50">
              {(user?.name || user?.email) && (
                <div className="px-3 py-2 border-b border-gray-100">
                  <div className="text-sm font-medium text-gray-900 truncate">{user?.name || 'User'}</div>
                  <div className="text-xs text-gray-500 truncate">{user?.email}</div>
                </div>
              )}
              <button className="w-full px-3 py-1.5 text-left hover:bg-gray-100 flex items-center gap-2 transition">
                <Profile size={16} className="text-gray-600" />
                <span className="text-xs text-gray-700">Profile</span>
              </button>
              <button className="w-full px-3 py-1.5 text-left hover:bg-gray-100 flex items-center gap-2 transition">
                <DocumentText size={16} className="text-gray-600" />
                <span className="text-xs text-gray-700">Logs</span>
              </button>
              <hr className="my-1 border-gray-200" />
              <button
                onClick={async () => {
                  try {
                    await apiService.logout();
                  } catch (error) {
                    console.error('Logout error:', error);
                  } finally {
                    localStorage.removeItem('token');
                    router.push('/login');
                  }
                }}
                className="w-full px-3 py-1.5 text-left hover:bg-gray-100 flex items-center gap-2 transition text-red-600"
              >
                <Logout size={16} />
                <span className="text-xs">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

