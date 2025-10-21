import { useAuth, UserButton } from "@clerk/clerk-react";
import { Loader } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

export const ProfileContainer = () => {
  try {
    const { isSignedIn, isLoaded } = useAuth();

    if (!isLoaded) {
      return (
        <div className="flex items-center">
          <Loader className="min-w-4 min-h-4 animate-spin text-emerald-500" />
        </div>
      );
    }

    return (
      <div className="flex items-center gap-6">
        {isSignedIn ? (
          <UserButton afterSignOutUrl="/" />
        ) : (
          <Link to={"/signin"}>
            <Button size={"sm"}>Get Started</Button>
          </Link>
        )}
      </div>
    );
  } catch {
    // Fallback when ClerkProvider is not configured
    return (
      <div className="flex items-center gap-6">
        <Link to={"/signin"}>
          <Button size={"sm"}>Get Started</Button>
        </Link>
      </div>
    );
  }
};
