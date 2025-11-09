"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft2,
  ArrowRight2,
  Element3,
  Profile2User,
  User,
  Health,
} from "iconsax-react";
import logo from "../assets/preclinic_logo.png";
import { useState } from "react";

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
    {
      id: "Patients",
      label: "Patients",
      icon: Profile2User,
      path: "/dashboard/patients",
      hasChildren: true,
      children: [
        { label: "Patients list", path: "/dashboard/patients" },
        { label: "Create patient", path: "/dashboard/patients?create=1" },
      ],
    },
    {
      id: "Doctors",
      label: "Doctors",
      icon: User,
      path: "/dashboard/doctors",
      hasChildren: true,
      children: [
        { label: "Doctors list", path: "/dashboard/doctors" },
        { label: "Create doctor", path: "/dashboard/doctors?create=1" },
      ],
    },
  ];

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    Patients: true,
    Doctors: false,
  });

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleMenuClick = (path: string) => {
    router.push(path);
    if (onClose) onClose();
  };

  return (
    <div
      className={`bg-white h-screen border-r border-gray-200 flex flex-col 
      transition-all duration-500 ease-in-out 
      ${isCollapsed ? "w-16 lg:w-16" : "w-60"}`}
    >
      {/* Header */}
      <div className="p-3 mb-4 h-14 border-b border-gray-200 flex items-center justify-between transition-all duration-500 ease-in-out">
        {!isCollapsed && (
          <img
            src={logo.src}
            className="pl-2 transition-all duration-500 ease-in-out"
            alt="eClinic"
            width={100}
            height={100}
          />
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
      <div
        className={`px-4 pb-4 transition-all duration-500 ease-in-out ${
          isCollapsed ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
      >
        {!isCollapsed && (
          <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-primary rounded-md flex items-center justify-center">
                <Health size={20} className="text-white" />
              </div>
              <div>
                <p
                  className="text-sm font-semibold text-gray-800 mb-0"
                  style={{ marginBottom: -5 }}
                >
                  TrustCare Clinic
                </p>
                <small className="text-xs text-gray-500 mt-0">Musanze</small>
              </div>
            </div>
          </div>
        )}
      </div>

      {!isCollapsed && (
        <p className="px-4 pb-3 text-sm text-gray-400 transition-all duration-500 ease-in-out">
          Main Menu
        </p>
      )}

      {/* Menu */}
      <nav className="flex-1 px-3 space-y-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActiveParent =
            item.hasChildren
              ? pathname.startsWith(item.path)
              : pathname === item.path;

          return (
            <div key={item.id} className="transition-all duration-500 ease-in-out">
              <button
                onClick={() =>
                  item.hasChildren ? toggleSection(item.id) : handleMenuClick(item.path)
                }
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-md transition-all duration-100 ease-in-out ${
                  isActiveParent
                    ? "bg-gray-50 border border-gray-200 text-primary"
                    : "text-gray-700 border border-transparent hover:bg-gray-100"
                } ${isCollapsed ? "justify-center" : "justify-between"}`}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    size={16}
                    variant={isActiveParent ? "Bold" : "Outline"}
                    className={`transition-all duration-100 ease-in-out ${
                      isActiveParent ? "text-primary" : "text-gray-900"
                    }`}
                  />
                  {!isCollapsed && (
                    <span
                      className={`transition-all duration-100 ease-in-out ${
                        isActiveParent ? "text-primary font-medium" : "text-gray-900"
                      } text-sm`}
                    >
                      {item.label}
                    </span>
                  )}
                </div>
                {!isCollapsed && item.hasChildren && (
                  <ArrowRight2
                    size={14}
                    className={`text-gray-500 transition-transform duration-100 ease-in-out ${
                      openSections[item.id] ? "rotate-90" : "rotate-0"
                    }`}
                  />
                )}
              </button>

              {/* Dropdown */}
              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  !isCollapsed && item.hasChildren && openSections[item.id]
                    ? "max-h-40 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                {!isCollapsed && item.hasChildren && openSections[item.id] && (
                  <div className="ml-6 mt-1 mb-2 relative">
                    <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200" />
                    <div className="pl-4 space-y-1">
                      {item.children?.map((child) => {
                        const isChildActive = pathname === child.path;
                        return (
                          <button
                            key={child.path}
                            onClick={() => handleMenuClick(child.path)}
                            className={`relative w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-all duration-100 ease-in-out ${
                              isChildActive
                                ? "text-primary bg-gray-50"
                                : "text-gray-400 hover:bg-gray-100"
                            }`}
                          >
                            <span
                              className={`absolute -left-4 w-2 h-2 rounded-full transition-all duration-100 ease-in-out ${
                                isChildActive ? "bg-primary" : "bg-gray-200"
                              }`}
                              style={{ marginLeft: "-3px" }}
                            />
                            <span>{child.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </nav>
    </div>
  );
}
