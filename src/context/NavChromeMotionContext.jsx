import React, { createContext, useContext } from 'react';

export const NavChromeMotionContext = createContext({
  skipIntroFade: false,
  viewMode: 'v2',
});

export function useNavChromeMotion() {
  return useContext(NavChromeMotionContext);
}
