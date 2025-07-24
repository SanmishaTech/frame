"use client";

import * as React from "react";
import {
  ArrowUpCircleIcon,
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  UsersRound,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  Icon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NavMain } from "@/components/common/nav-main";
import { NavProjects } from "@/components/common/nav-projects";
import { NavUser } from "@/components/common/nav-user";
// import { TeamSwitcher } from "@/components/common/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { appName } from "@/config";
const initialData = {
  roles: {
    // member: {
    //   projects: [
    //     {
    //       name: "Purchase",
    //       url: "/purchase",
    //       icon: UsersRound,
    //     },
    //     {
    //       name: "My Direct List",
    //       url: "/member/directReferrals",
    //       icon: UsersRound,
    //     },
    //   ],
    //     navMain: [
    //       {
    //         title: "Masters",
    //         url: "#",
    //         icon: SquareTerminal,
    //         isActive: true,
    //         items: [
    //           { title: "Country", url: "/countries" },
    //           { title: "State", url: "./states" },
    //           { title: "City", url: "/cities" },
    //         ],
    //       },
    //     ],
    // },
    admin: {
      projects: [
        {
          name: "Doctors",
          url: "/doctors",
          icon: UsersRound,
        },
        {
          name: "Users",
          url: "/users",
          icon: UsersRound,
        },
      ],
      navMain: [
        {
          title: "Reports",
          url: "#",
          icon: SquareTerminal,
          isActive: true,
          items: [{ title: "Video Report", url: "/reports/doctors" }],
        },
      ],
    },
  },
  user: {
    name: "",
    email: "",
    avatar: "",
    avatarName: "",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [data, setData] = React.useState({
    ...initialData,
    projects: [],
    navMain: [],
  });
  const navigate = useNavigate();

  React.useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        parsedUser.avatarName = parsedUser.name.charAt(0).toUpperCase();
        const role = parsedUser.role || "admin";
        const roleData = initialData.roles[role];

        setData((prevData) => ({
          ...prevData,
          projects: roleData?.projects || [],
          navMain: roleData?.navMain || [],
          user: parsedUser,
        }));
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
      }
    }
  }, []);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {/* <TeamSwitcher teams={data.teams} /> */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              {/* <a href="/dashboard">
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-base font-semibold">{appName}</span>
              </a> */}
              <button
                onClick={() => {
                  navigate("/dashboard");
                }}
              >
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-base font-semibold">{appName}</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={data.projects || []} />
        <NavMain items={data.navMain || []} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
