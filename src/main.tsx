import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { ClerkProvider } from "@clerk/clerk-react";

import "./index.css";
import App from "./App.tsx";
import { ToasterProvider } from "./provider/toast-provider.tsx";

// Import your Publishable Key (optional fallback to avoid crash during setup)
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as
  | string
  | undefined;

const AppTree = PUBLISHABLE_KEY ? (
  <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
    <App />
    <ToasterProvider />
  </ClerkProvider>
) : (
  <>
    {console.warn(
      "Clerk publishable key missing. Rendering without authentication provider. Set VITE_CLERK_PUBLISHABLE_KEY in .env to enable auth."
    )}
    <App />
    <ToasterProvider />
  </>
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>{AppTree}</StrictMode>
);
