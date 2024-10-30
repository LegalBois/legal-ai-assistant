import clsx from 'clsx';
import React from 'react';
import cross from '@/assets/cross.svg';
import info from '@/assets/info.svg';

type THeaderProps = {
  className?: string;
};

export const Topbar: React.FC<THeaderProps> = ({ className }) => {


  return (
    <div className={clsx('shadow-blue-shadow header z-20 w-full border-b border-blue-300 bg-blue-900', className)}>
      <div className="flex w-full items-center justify-between py-1">
        <button type="button" className="cursor-pointer p-2.5">
          <img src={cross} alt="Delete context" width="24" height="18" />
        </button>
        <figure className="border-primary-gradient relative my-0.5 inline-flex overflow-clip rounded-full border-2">
          <img src="images/avatar.png" alt="Avatar" width="48" height="48" />
        </figure>
        <button type="button" className="cursor-pointer p-2.5">
          <img src={info} alt="Show info" width="32" height="32" />
        </button>
      </div>
    </div>
  );
};
