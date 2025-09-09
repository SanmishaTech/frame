import { AppSidebar } from "@/components/common/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Sun, Moon, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as React from "react";
interface RouteConfig {
  parent?: string;
  label: string;
  path: string;
}

const ROUTE_MAP: Record<string, RouteConfig> = {
  users: {
    parent: "Management",
    label: "Users",
    path: "/users",
  },
  doctors: {
    parent: "Management",
    label: "Doctors",
    path: "/doctors",
  },
  reports: {
    parent: "Reports",
    label: "Doctor Report",
    path: "/reports/doctors",
  },
};

export default function MainLayout() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    // If no saved preference, check system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Get user data from localStorage
  const user = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  // Check if user is admin

  // Effect to sync dark mode state with HTML class
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  // Effect to listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem("theme")) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const location = useLocation();

  const getBreadcrumbs = () => {
    const currentPath = location.pathname.split("/").filter(Boolean)[0];

    // If the current path is in our route map and has a parent
    const route = ROUTE_MAP[currentPath];
    if (route && route.parent) {
      return [
        {
          label: route.parent,
          path: "",
          isLast: false,
        },
        {
          label: route.label,
          path: route.path,
          isLast: true,
        },
      ];
    }

    // Default fallback for unmapped routes
    return [
      {
        label: currentPath
          ? currentPath.charAt(0).toUpperCase() + currentPath.slice(1)
          : "Home",
        path: `/${currentPath}`,
        isLast: true,
      },
    ];
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem("theme", newDarkMode ? "dark" : "light");
  };
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Sticky Header */}
          <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background shadow-sm transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4 w-full justify-between">
              {/* Sidebar Trigger and Breadcrumb */}
              <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                  <BreadcrumbList>
                    {getBreadcrumbs().map((crumb, index) => (
                      <div key={crumb.path} className="flex items-center">
                        <BreadcrumbItem className="hidden md:block">
                          {crumb.isLast ? (
                            <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink href={crumb.path}>
                              {crumb.label}
                            </BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                        {!crumb.isLast && (
                          <BreadcrumbSeparator className="hidden md:block" />
                        )}
                      </div>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
              </div>

              <div>
                <div className="flex items-center gap-2 w-full justify-between">
                  {/* <button className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-3 rounded-full shadow-lg hover:scale-105 transition-transform duration-300 hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 10h.01M12 14v.01M12 12a4 4 0 100-8 4 4 0 000 8zm0 0v2m0 4h.01"
                      />
                    </svg>
                    Help
                  </button> */}
                  <Button
                    onClick={() => navigate("/help/user-manual")}
                    // className="dark:bg-yellow dark:text-black bg-yellow-500 cursor-pointer"
                    // variant="outline"
                    // size="icon"
                    aria-label="Toggle Dark Mode"
                  >
                    Help
                  </Button>

                  {/* Dark Mode Switcher */}
                  <Button
                    onClick={toggleDarkMode}
                    className="size-7 cursor-pointer"
                    variant="ghost"
                    size="icon"
                    aria-label="Toggle Dark Mode"
                  >
                    {isDarkMode ? <Moon /> : <Sun />}
                  </Button>
                </div>
              </div>
            </div>
          </header>

          <main className="pt-2 overflow-x-hidden">
            <div className="px-1 sm:px-3 overflow-x-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
