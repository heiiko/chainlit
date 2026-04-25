import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

interface Props {
  author?: string;
  hide?: boolean;
  isError?: boolean;
  iconName?: string;
}

const avatarUrl = '/nl/public/icon/detijd.png';

const MessageAvatar = ({ author, hide, isError }: Props) => {
  if (isError) {
    return (
      <span className={cn('inline-block', hide && 'invisible')}>
        <AlertCircle className="h-5 w-5 fill-destructive mt-[5px] text-destructive-foreground" />
      </span>
    );
  }

  const avatarContent = (
    <Avatar className="h-5 w-5 mt-[3px]">
      <AvatarImage
        src={avatarUrl}
        alt={`Avatar for ${author || 'default'}`}
        className="bg-transparent"
      />
      <AvatarFallback className="bg-transparent">
        <Skeleton className="h-full w-full rounded-full" />
      </AvatarFallback>
    </Avatar>
  );

  return (
    <span className={cn('inline-block', hide && 'invisible')}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{avatarContent}</TooltipTrigger>
          <TooltipContent>
            <p>{author}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </span>
  );
};

export { MessageAvatar };
