import { useState } from "react";
import {
  BookOpen,
  FlaskConical,
  ShieldAlert,
  Swords,
  Calculator,
  FileText,
  MessageSquareQuote,
  Phone,
  GitFork,
  Scale,
} from "lucide-react";

const NAV_ITEMS = [
  { id: "flashcards", label: "Flashcards", icon: BookOpen },
  { id: "discovery-simulator", label: "Discovery Simulator", icon: FlaskConical },
  { id: "objection-handler", label: "Objection Handler", icon: ShieldAlert },
  { id: "battle-cards", label: "Battle Cards", icon: Swords },
  { id: "feasibility-pricing", label: "Feasibility & Pricing", icon: Calculator },
  { id: "case-studies", label: "Case Studies", icon: FileText },
  { id: "testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { id: "call-prep", label: "Call Prep", icon: Phone },
  { id: "deal-cycle", label: "Deal Cycle", icon: GitFork },
  { id: "quantilope-vs-walr", label: "Quantilope vs Walr", icon: Scale },
];

export default function App() {
  const [activeModule, setActiveModule] = useState("flashcards");

  const activeItem = NAV_ITEMS.find((item) => item.id === activeModule);

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: "#0f1117", fontFamily: "Inter, sans-serif" }}
    >
      {/* Sidebar */}
      <aside
        className="flex flex-col flex-shrink-0 h-full"
        style={{
          width: "240px",
          backgroundColor: "#1a1d27",
          borderRight: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {/* Logo / Brand */}
        <div
          className="flex items-center gap-2 px-5 py-5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div
            className="flex items-center justify-center rounded-lg"
            style={{
              width: "32px",
              height: "32px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            }}
          >
            <span className="text-white font-bold text-sm">W</span>
          </div>
          <span className="text-white font-semibold text-sm tracking-wide">
            Walr AE Training
          </span>
        </div>

        {/* Nav Items */}
        <nav className="flex flex-col gap-1 px-3 py-4 flex-1 overflow-y-auto">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = activeModule === id;
            return (
              <button
                key={id}
                onClick={() => setActiveModule(id)}
                className="flex items-center gap-3 w-full text-left rounded-lg px-3 py-2.5 transition-all duration-150"
                style={{
                  backgroundColor: isActive
                    ? "rgba(99, 102, 241, 0.18)"
                    : "transparent",
                  color: isActive ? "#a5b4fc" : "rgba(255,255,255,0.55)",
                  border: isActive
                    ? "1px solid rgba(99,102,241,0.3)"
                    : "1px solid transparent",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor =
                      "rgba(255,255,255,0.05)";
                    e.currentTarget.style.color = "rgba(255,255,255,0.85)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "rgba(255,255,255,0.55)";
                  }
                }}
              >
                <Icon
                  size={16}
                  style={{
                    color: isActive ? "#818cf8" : "rgba(255,255,255,0.4)",
                    flexShrink: 0,
                  }}
                />
                <span className="text-sm font-medium truncate">{label}</span>
                {isActive && (
                  <div
                    className="ml-auto rounded-full"
                    style={{
                      width: "6px",
                      height: "6px",
                      backgroundColor: "#6366f1",
                      flexShrink: 0,
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Session Progress Footer */}
        <div
          className="px-4 py-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              Session Progress
            </span>
            <span
              className="text-xs font-bold"
              style={{ color: "#a5b4fc" }}
            >
              —
            </span>
          </div>
          <div
            className="rounded-full overflow-hidden"
            style={{
              height: "4px",
              backgroundColor: "rgba(255,255,255,0.08)",
            }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: "0%",
                background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
              }}
            />
          </div>
          <p
            className="mt-2 text-xs"
            style={{ color: "rgba(255,255,255,0.25)" }}
          >
            No activity yet
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col">
        {/* Top Bar */}
        <header
          className="flex items-center px-8 py-4 flex-shrink-0"
          style={{
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            backgroundColor: "#0f1117",
          }}
        >
          {activeItem && (
            <>
              <activeItem.icon
                size={18}
                style={{ color: "#6366f1", marginRight: "10px" }}
              />
              <h1
                className="text-base font-semibold"
                style={{ color: "rgba(255,255,255,0.9)" }}
              >
                {activeItem.label}
              </h1>
            </>
          )}
        </header>

        {/* Placeholder Content */}
        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div
            className="flex flex-col items-center gap-4 rounded-2xl px-12 py-16"
            style={{
              backgroundColor: "#1a1d27",
              border: "1px solid rgba(255,255,255,0.07)",
              maxWidth: "480px",
              width: "100%",
            }}
          >
            {activeItem && (
              <div
                className="flex items-center justify-center rounded-xl mb-2"
                style={{
                  width: "56px",
                  height: "56px",
                  background: "rgba(99,102,241,0.15)",
                  border: "1px solid rgba(99,102,241,0.25)",
                }}
              >
                <activeItem.icon size={24} style={{ color: "#818cf8" }} />
              </div>
            )}
            <h2
              className="text-2xl font-bold text-center"
              style={{ color: "#ffffff" }}
            >
              {activeItem?.label}
            </h2>
            <p
              className="text-sm text-center"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              This module is coming soon.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
