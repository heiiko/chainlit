import { CircleUserRound, LogOut } from 'lucide-react';

import { useAuth } from '@chainlit/react-client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Translator } from 'components/i18n';

export default function UserNav() {
  const { user, logout } = useAuth();

  if (!user) return null;
  const displayName = user?.display_name || user?.identifier;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          id="user-nav-button"
          aria-label="User menu"
          variant="ghost"
          size="icon"
          className="text-primary-foreground hover:text-muted-foreground"
        >
          <CircleUserRound className="!size-6" strokeWidth={2} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-26" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem id="logout" onClick={() => logout(true)}>
          <Translator path="navigation.user.menu.logout" />
          <LogOut className="ml-auto" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
