"use client";
import React, { useEffect, useRef, useState,useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../../context/SidebarContext";
import { usePermissions } from "@/hooks/usePermissions";
import {
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  FolderIcon,
  GroupIcon,
  AlertIcon,
  DocsIcon,
  TaskIcon,
  LockIcon,
  UserIcon,
  BriefcaseIcon,
  SettingsIcon,
} from "../../icons/index";

type NavItem = {
  name: string;
  icon?: React.ReactNode;
  path?: string;
  divider?: boolean; // Section divider
  badge?: string; // Badge count key
  permission?: string | null;
  description?: string;
  subItems?: {
    name: string;
    path: string;
    icon?: React.ReactNode;
    permission?: string;
    description?: string;
    badge?: string;
  }[];
};

const navItems: NavItem[] = [
  // === OVERVIEW ===
  {
    name: "Dashboard",
    path: "/",
    icon: <GridIcon />,
    permission: null,
  },

  // === PROGRAM MANAGEMENT ===
  {
    divider: true,
    name: "Program Management",
  },
  {
    name: "Projects",
    path: "/projects",
    icon: <FolderIcon />,
    permission: "project_view",
  },
  {
    name: "Activities",
    path: "/activities",
    icon: <CalenderIcon />,
    permission: "activity_view",
  },
  {
    name: "Beneficiaries",
    path: "/beneficiaries",
    icon: <GroupIcon />,
    permission: "beneficiary_view",
  },

  // === LEGAL SERVICES ===
  {
    divider: true,
    name: "Legal Services",
  },
  {
    name: "Cases",
    path: "/cases",
    icon: <BriefcaseIcon />,
    permission: "case_view",
  },

  // === INCIDENT MANAGEMENT ===
  {
    divider: true,
    name: "Incident Management",
  },
  {
    name: "Incidents",
    path: "/incidents",
    icon: <AlertIcon />,
    permission: "incident_view",
  },

  // === CONTENT & KNOWLEDGE ===
  {
    divider: true,
    name: "Content & Knowledge",
  },
  {
    name: "Content Manager",
    path: "/content",
    icon: <DocsIcon />,
    permission: "content_manage",
  },
];

const othersItems: NavItem[] = [
  // === SYSTEM JOBS ===
  {
    divider: true,
    name: "System & Operations",
  },
  {
    name: "Jobs",
    path: "/jobs",
    icon: <TaskIcon />,
    permission: "jobs_view",
  },

  // === ADMINISTRATION ===
  {
    divider: true,
    name: "Administration",
  },
  {
    name: "Users",
    path: "/users",
    icon: <UserIcon />,
    permission: "user_view",
  },

  // === SETTINGS ===
  {
    divider: true,
    name: "Configuration",
  },
  {
    name: "Settings",
    icon: <SettingsIcon />,
    permission: "settings_manage",
    subItems: [
      {
        name: "Roles & Permissions",
        path: "/settings/roles",
        icon: <LockIcon />,
        permission: "role_view",
      },
      {
        name: "Constants",
        path: "/settings/constants",
        permission: "settings_manage",
      },
      {
        name: "Locations",
        path: "/settings/locations",
        permission: "settings_manage",
      },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const { can } = usePermissions();

  // State declarations
  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // isActive callback
  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  // Filter nav items based on permissions
  const filterNavItems = (items: NavItem[]): NavItem[] => {
    return items.filter(item => {
      // Always show dividers
      if (item.divider) return true;

      // Check if user has permission for this item
      if (item.permission && !can(item.permission)) return false;

      // Filter sub-items based on permissions
      if (item.subItems) {
        item.subItems = item.subItems.filter(subItem =>
          !subItem.permission || can(subItem.permission)
        );
        // Hide parent if all sub-items are filtered out
        return item.subItems.length > 0;
      }

      return true;
    });
  };

  const renderMenuItems = (
    navItems: NavItem[],
    menuType: "main" | "others"
  ) => {
    const filteredItems = filterNavItems(navItems);

    return (
      <ul className="flex flex-col gap-4">
        {filteredItems.map((nav, index) => (
          <li key={nav.name}>
            {/* Section Divider */}
            {nav.divider ? (
            <h2
              className={`mb-2 mt-4 text-xs uppercase flex leading-[20px] text-gray-400 font-semibold ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
              }`}
            >
              {isExpanded || isHovered || isMobileOpen ? (
                nav.name
              ) : (
                <HorizontaLDots />
              )}
            </h2>
          ) : nav.subItems ? (
            <>
              <button
                onClick={() => handleSubmenuToggle(index, menuType)}
                className={`menu-item group  ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-active"
                    : "menu-item-inactive"
                } cursor-pointer ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "lg:justify-start"
                }`}
              >
                <span
                  className={` ${
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className={`menu-item-text`}>{nav.name}</span>
                )}
                {(isExpanded || isHovered || isMobileOpen) && (
                  <ChevronDownIcon
                    className={`ml-auto w-5 h-5 transition-transform duration-200  ${
                      openSubmenu?.type === menuType &&
                      openSubmenu?.index === index
                        ? "rotate-180 text-brand-500"
                        : ""
                    }`}
                  />
                )}
              </button>
              {(isExpanded || isHovered || isMobileOpen) && (
                <div
                  ref={(el) => {
                    subMenuRefs.current[`${menuType}-${index}`] = el;
                  }}
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    height:
                      openSubmenu?.type === menuType && openSubmenu?.index === index
                        ? `${subMenuHeight[`${menuType}-${index}`]}px`
                        : "0px",
                  }}
                >
                  <ul className="mt-2 space-y-1 ml-9">
                    {nav.subItems.map((subItem) => (
                      <li key={subItem.name}>
                        <Link
                          href={subItem.path}
                          className={`menu-dropdown-item ${
                            isActive(subItem.path)
                              ? "menu-dropdown-item-active"
                              : "menu-dropdown-item-inactive"
                          }`}
                        >
                          {subItem.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className={`menu-item-text`}>{nav.name}</span>
                )}
              </Link>
            )
          )}
        </li>
      ))}
    </ul>
    );
  };

  useEffect(() => {
    // Check if the current path matches any submenu item
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    // If no submenu item matches, close the open submenu
    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname,isActive]);

  useEffect(() => {
    // Set the height of the submenu items when the submenu is opened
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex  ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                className="dark:hidden"
                src="/images/logo/logo-icon.png"
                alt="Logo"
                width={150}
                height={40}
              />
              <Image
                className="hidden dark:block"
                src="/images/logo/logo-dark.png"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <Image
              src="/images/logo/logo-icon.png"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-2">
            <div>
              {renderMenuItems(navItems, "main")}
            </div>
            <div className="">
              {renderMenuItems(othersItems, "others")}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
