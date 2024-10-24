import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { InjectionToken, PLATFORM_ID, Provider } from '@angular/core';

export const IS_BROWSER = new InjectionToken<boolean>('isBrowser');
export const IS_SERVER = new InjectionToken<boolean>('isServer');

export function providePlatformDetection(): Provider {
  return [
    {
      provide: IS_BROWSER,
      useFactory: (platformId: object) => isPlatformBrowser(platformId),
      deps: [PLATFORM_ID],
    },
    {
      provide: IS_SERVER,
      useFactory: (platformId: object) => isPlatformServer(platformId),
      deps: [PLATFORM_ID],
    },
  ];
}
