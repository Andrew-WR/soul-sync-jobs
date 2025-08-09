import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PropsWithChildren } from "react";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-md text-sm font-medium interactive ${
    isActive ? "text-primary" : "text-foreground/70 hover:text-foreground"
  }`;

export const AppLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 backdrop-blur bg-background/80 border-b">
        <div className="container mx-auto flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="h-8 w-8 rounded-md bg-gradient-primary shadow-glow inline-flex items-center justify-center text-primary-foreground">IC</span>
            <span className="text-lg">InstaConnect</span>
          </Link>
          <nav className="hidden md:flex items-center gap-2">
            <NavLink to="/" className={navLinkClass} end>
              Home
            </NavLink>
            <NavLink to="/jobs" className={navLinkClass}>
              Jobs
            </NavLink>
            <NavLink to="/dashboard" className={navLinkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/companies" className={navLinkClass}>
              Companies
            </NavLink>
          </nav>
          <div className="flex items-center gap-3">
            <Button asChild variant="hero" className="hidden sm:inline-flex">
              <Link to="/dashboard">Create Profile</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t">
        <div className="container mx-auto py-10 text-sm text-muted-foreground flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} InstaConnect. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a className="hover:text-foreground" href="#">Privacy</a>
            <a className="hover:text-foreground" href="#">Terms</a>
            <a className="hover:text-foreground" href="#">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;
