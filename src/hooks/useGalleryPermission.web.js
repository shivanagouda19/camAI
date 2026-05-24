import { useCallback, useState } from 'react';

export default function useGalleryPermission() {
  const [permission, setPermission] = useState({
    granted: true,
    canAskAgain: true,
    expires: 'never',
    status: 'granted',
  });

  const requestPermission = useCallback(async () => {
    setPermission(currentPermission => ({
      ...currentPermission,
      granted: true,
      status: 'granted',
    }));

    return permission;
  }, [permission]);

  return [permission, requestPermission];
}
