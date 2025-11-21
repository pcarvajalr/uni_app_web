import { useState } from 'react';
import { Capacitor } from '@capacitor/core';

export interface PlatformInfo {
  isNative: boolean;
  isWeb: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  platform: string;
}

/**
 * Hook para detectar la plataforma actual
 * @returns Información sobre la plataforma actual
 */
export function usePlatform(): PlatformInfo {
  const [platformInfo] = useState<PlatformInfo>(() => {
    const platform = Capacitor.getPlatform();
    const isNative = Capacitor.isNativePlatform();

    return {
      isNative,
      isWeb: !isNative,
      isIOS: platform === 'ios',
      isAndroid: platform === 'android',
      platform,
    };
  });

  return platformInfo;
}
