"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft2,
  ArrowRight2,
  Element3,
  Profile2User,
  User,
  Health,
  Hospital
} from "iconsax-react";
import logo from "../assets/preclinic_logo.png";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onClose?: () => void;
}

export default function Sidebar({ isCollapsed, onToggle, onClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { id: "Dashboard", label: "Dashboard", icon: Element3, path: "/dashboard" },
    { id: "Line Queue", label: "Line Queue", icon: Health, path: "/dashboard/queue" },
    { id: "Patients", label: "Patients", icon: Profile2User, path: "/dashboard/patients" },
    { id: "Doctors", label: "Doctors", icon: User, path: "/dashboard/doctors" },
  ];

  const handleMenuClick = (path: string) => {
    router.push(path);
    // Close mobile menu after navigation
    if (onClose) {
      onClose();
    }
  };

  return (
    <div
      className={`bg-white h-screen border-r border-gray-200 transition-all duration-300 flex flex-col ${
        isCollapsed ? "w-16 lg:w-16" : "w-60"
      }`}
    >
      {/* Header with Logo and Toggle */}
      <div className="p-3 mb-4 h-14 border-b border-gray-200 flex items-center justify-between">
        {!isCollapsed && (
          <img src={logo.src} className="pl-2" alt="eClinic" width={100} height={100} />
        )}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={onToggle}
            className="p-1.5 hover:bg-gray-100 rounded-md transition hidden lg:flex"
          >
            {isCollapsed ? (
              <ArrowRight2 size={16} className="text-gray-600" />
            ) : (
              <ArrowLeft2 size={16} className="text-gray-600" />
            )}
          </button>
          {/* Mobile close button */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-md transition lg:hidden"
            >
              <ArrowLeft2 size={16} className="text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Clinic Logo Card */}
      {!isCollapsed && (
        <div className="px-4 pb-4">
          <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 flex items-center justify-between shadow-sm">
            {/* Left: Clinic Icon */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-primary rounded-md flex items-center justify-center">
                <Health size={20} className="text-white" />
              </div>
              {!isCollapsed && (
                <div>
                  <p className="text-sm font-semibold text-gray-800 mb-0" style={{ marginBottom: -5 }}>TrustCare Clinic</p>
  
                  <small className="text-xs text-gray-500 mt-0">Musanze</small>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!isCollapsed && (
        <p className="px-4 pb-3 text-sm text-gray-400">Main Menu</p>
      )}
      {/* Menu Items */}
      <nav className="flex-1 px-3 space-y-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.path)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-md transition ${
                isActive
                  ? "text-white border border-gray-200 shadow-sm"
                  : "text-gray-700 hover:bg-gray-100"
              } ${isCollapsed ? "justify-center" : ""}`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                size={16}
                variant={isActive ? "Bold" : "Outline"}
                className={isActive ? "text-primary" : "text-gray-600"}
              />
              {!isCollapsed && (
                <span className={isActive ? "text-primary font-small text-sm" : "text-gray-600 font-small text-sm"}>{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
