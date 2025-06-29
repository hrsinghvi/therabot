import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

interface UserProfileProps {
  name: string;
  email?: string;
  imageUrl?: string;
  onSettingsClick: () => void;
}

export function UserProfile({ name, email, imageUrl, onSettingsClick }: UserProfileProps) {
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex items-center justify-between p-3">
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10 border-2 border-primary/50">
          <AvatarImage src={imageUrl} alt={name} />
          <AvatarFallback>{getInitials(name)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">{name}</span>
          {email && <span className="text-xs text-muted-foreground">{email}</span>}
        </div>
      </div>
      
      <Button variant="ghost" size="icon" className="rounded-full w-9 h-9" onClick={onSettingsClick}>
        <Settings className="w-5 h-5 text-muted-foreground transition-transform duration-300 group-hover:rotate-90" />
      </Button>
    </div>
  );
} 