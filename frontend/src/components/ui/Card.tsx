import { FC, PropsWithChildren } from 'react';
import clsx from 'clsx';

type TCardProps = {
  className?: string;
};

export const Card: FC<PropsWithChildren<TCardProps>> = ({ children, className }) => {
  return <div className={clsx('relative h-full overflow-hidden rounded-3xl', className)}>{children}</div>;
};
