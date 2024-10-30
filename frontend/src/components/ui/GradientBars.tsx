import { FC } from 'react';
import clsx from 'clsx';

export type TGradientAnimationState = 'static' | 'intensive';

type TGradientBarsProps = {
  state?: TGradientAnimationState;
};

type TBarsProps = {
  className?: string;
};

const getClassesByIntenseWithDelay = (isIntensive: boolean, elementIndex: number = 0) => {
  const barColor = isIntensive ? 'bg-bar-intensive' : 'bg-bar-static';
  const animationDuration = isIntensive ? 'animate-intensive' : 'animate-static';

  let animationDurationClass = 'animation-delay-0';
  switch (elementIndex) {
    case 1:
      animationDurationClass = isIntensive ? 'animation-delay-300' : 'animation-delay-1200';
      break;
    case 2:
      animationDurationClass = isIntensive ? 'animation-delay-600' : 'animation-delay-300';
      break;
    case 3:
      animationDurationClass = isIntensive ? 'animation-delay-900' : 'animation-delay-600';
      break;
    case 4:
      animationDurationClass = isIntensive ? 'animation-delay-0' : 'animation-delay-900';
      break;
    case 5:
      animationDurationClass = isIntensive ? 'animation-delay-0' : 'animation-delay-1500';
      break;
    default:
      break;
  }
  return `${barColor} ${animationDuration} ${animationDurationClass}`;
};

const isIntensiveState = (state: string) => state === 'intensive';

const Bar: FC<TBarsProps> = ({ className }) => {
  return <span className={clsx(`w-animated-bar rounded-animated-bar -ml-7 h-full blur-lg`, className)}></span>;
};

export const GradientBars: FC<TGradientBarsProps> = ({ state = 'intensive' }) => {
  const barHeightClass = isIntensiveState(state) ? 'h-animated-bar-intensive' : 'h-animated-bar';
  const bars = Array.from({ length: 6 });

  return (
    <div className={`flex ${barHeightClass} absolute -bottom-20 -left-7 items-center justify-center`}>
      {bars.map((_, index) => {
        const barClassName = getClassesByIntenseWithDelay(isIntensiveState(state), index);
        return <Bar key={index} className={barClassName} />;
      })}
    </div>
  );
};
