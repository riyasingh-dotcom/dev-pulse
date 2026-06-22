"use client";

import { useState, useEffect } from "react";
import { Bell, Settings, Bot, MessageSquare, X, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "./ThemeToggle";

type NavbarProps = {
  username?: string;
  onLogout?: () => void;
  chatPanel?: React.ReactNode;
};

export function Navbar({ username, onLogout, chatPanel }: NavbarProps) {
  const [chatOpen, setChatOpen] = useState(false);

  // Close on Escape
  useEffect(() => {
    if (!chatOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setChatOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [chatOpen]);

  return (
    <>
      <header className="flex items-center justify-between px-4 sm:px-6 lg:px-20 py-4 border-b border-border shrink-0 bg-card/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M2 10L5 6L8 8L12 3"
                  stroke="white"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-base font-bold tracking-tight">DevPulse</span>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center">
            <span className="px-3 py-1.5 text-sm font-medium text-foreground relative after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-primary after:rounded-full">
              Dashboard
            </span>
            {chatPanel && (
              <button
                onClick={() => setChatOpen(true)}
                className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
              >
                <Bot className="w-3.5 h-3.5" />
                AI Chat
              </button>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Mobile AI Chat trigger */}
          {chatPanel && (
            <button
              onClick={() => setChatOpen(true)}
              className="md:hidden p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          )}
          <button className="hidden sm:flex p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <button className="hidden sm:flex p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
          <ThemeToggle />
          <Avatar className="w-8 h-8 sm:w-10 sm:h-10 ring-2 ring-border">
            <AvatarFallback className="text-sm bg-primary/15 text-primary font-bold">
              {username ? username[0].toUpperCase() : "DP"}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* AI Chat Modal */}
      {chatOpen && chatPanel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setChatOpen(false);
          }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setChatOpen(false)}
          />

          {/* Panel */}
          <div className="relative z-10 w-full max-w-lg h-155 max-h-[90vh] rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col">
            <button
              onClick={() => setChatOpen(false)}
              className="absolute top-3.5 right-4 z-20 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
            {chatPanel}
          </div>
        </div>
      )}
    </>
  );
}
