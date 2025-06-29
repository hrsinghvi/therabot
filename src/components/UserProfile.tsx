import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, Settings } from "lucide-react";

interface UserProfileProps {
  name: string;
  email?: string;
  imageUrl?: string;
  onSettingsClick: () => void;
  onLogout: () => void;
}

export function UserProfile({ name, email, imageUrl, onSettingsClick, onLogout }: UserProfileProps) {
  const getInitials = (name: string) => {
    if (!name) return "?";
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex items-center justify-between p-3">
      <div className="flex items-center gap-3 overflow-hidden">
        <Avatar className="w-10 h-10 border-2 border-primary/50 flex-shrink-0">
          <AvatarImage src={imageUrl} alt={name} />
          <AvatarFallback>{getInitials(name)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col overflow-hidden">
          <span className="text-sm font-medium text-foreground truncate">{name}</span>
          {email && <span className="text-xs text-muted-foreground truncate">{email}</span>}
        </div>
      </div>
      
      <div className="flex items-center">
        <Button variant="ghost" size="icon" className="rounded-full w-9 h-9 flex-shrink-0" onClick={onSettingsClick}>
          <Settings className="w-5 h-5 text-muted-foreground transition-transform duration-300 group-hover:rotate-90" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full w-9 h-9 flex-shrink-0" onClick={onLogout}>
          <LogOut className="w-5 h-5 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
} 