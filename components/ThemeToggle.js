'use client';

import { useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';

import WeatherSunnyIcon from '@/public/images/icons/weather-sunny.svg';
import WeatherNightIcon from '@/public/images/icons/weather-night.svg';

// The active theme is only known on the client; render as "not pressed" until mounted
// so the server HTML and the first client render match.
const subscribe = () => () => {};
const useMounted = () => useSyncExternalStore(subscribe, () => true, () => false);

// Two choices (light / dark) that start from the OS preference. Picking the same value as
// the OS stores "system", so the site keeps following OS changes until the user diverges.
export default function ThemeToggle() {
  const { resolvedTheme, systemTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const isDark = mounted && resolvedTheme === 'dark';

  const toggle = () => {
    const next = isDark ? 'light' : 'dark';
    setTheme(next === systemTheme ? 'system' : next);
  };

  return (
    <Button variant="outline" size="icon" onClick={toggle} aria-label="Dark mode" aria-pressed={isDark}>
      {/* Icons follow the `dark` class via CSS, so they are correct before hydration too. */}
      <WeatherSunnyIcon className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <WeatherNightIcon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
