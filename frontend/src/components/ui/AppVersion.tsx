import { useVersion } from '@/hooks';

export const AppVersion = () => {
  const { uiVersion, apiVersion } = useVersion();

  return (
    <div className="text-3xs pb-1.5 text-center font-semibold text-gray-200">
      Version: UI v{uiVersion}
      {apiVersion ? `, API v${apiVersion}` : null}
    </div>
  );
};
