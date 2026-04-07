import { IStarter } from '@chainlit/react-client';

import { Button } from '@/components/ui/button';

import {
  getStarterId,
  resolveStarterIconUrl,
  useStarterAction
} from './useStarter';

interface StarterProps {
  starter: IStarter;
}

export default function Starter({ starter }: StarterProps) {
  const { apiClient, disabled, onSubmit } = useStarterAction(starter);

  return (
    <Button
      id={getStarterId(starter.label)}
      variant="outline"
      className="w-fit justify-start rounded-3xl"
      disabled={disabled}
      onClick={onSubmit}
    >
      <div className="flex gap-2">
        {starter.icon ? (
          <img
            className="h-5 w-5 rounded-md"
            src={resolveStarterIconUrl(apiClient, starter.icon)}
            alt={starter.label}
          />
        ) : null}
        <p className="text-sm text-muted-foreground truncate">
          {starter.label}
        </p>
      </div>
    </Button>
  );
}
