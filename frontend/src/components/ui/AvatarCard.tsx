import React from 'react';
import { Card, GradientBars, TGradientAnimationState } from '@/components/ui';

type TAvatarCardProps = {
  animation?: TGradientAnimationState;
  children?: React.ReactNode;
};

export const AvatarCard: React.FC<TAvatarCardProps> = ({ children, animation = 'static' }) => {
  return (
    <Card className="grow">
      <img src="images/avatar-portrait.png" alt="Avatar" className="h-full w-full object-cover brightness-110" />
      <div className="from-primary-500/80 absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t to-transparent">
        <GradientBars state={animation} />
      </div>
      <div className="absolute inset-0 flex items-end p-4 text-white">{children}</div>
    </Card>
  );
};
