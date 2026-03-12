'use client';

import { useTheme } from './ThemeProvider';

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-[#2A47F6] backdrop-blur-md border-b border-ah-gray/50 dark:border-[#2A47F6] shadow-sm dark:shadow-md dark:shadow-black/20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo + Title */}
          <div className="flex items-center gap-3 sm:gap-12">
            <img
              src="/logo.png"
              alt="Air Hive Logo"
              className={`h-9 sm:h-12 w-auto ${theme === 'dark' ? 'brightness-0 invert' : ''}`}
            />
            <div>
              <h1 className="text-lg sm:text-3xl font-bold text-ah-navy dark:text-white tracking-tight">
                Inventario del Claustro
              </h1>
              <p className="text-sm text-ah-charcoal/50 dark:text-white/70 hidden sm:block">
                Gestión de piezas de arte
              </p>
            </div>
          </div>

          {/* Right side: theme toggle + user */}
          <div className="flex items-center gap-2 sm:gap-5">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="theme-toggle w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-gray-100 dark:bg-white/15 hover:bg-gray-200 dark:hover:bg-white/25 border border-transparent dark:border-white/20 cursor-pointer transition-colors"
              title={theme === 'light' ? 'Cambiar a modo noche' : 'Cambiar a modo día'}
            >
              <img
                src={theme === 'light' ? '/luna.png' : '/sol.png'}
                alt={theme === 'light' ? 'Modo noche' : 'Modo día'}
                className={`w-5 h-5 sm:w-7 sm:h-7 object-contain ${theme === 'dark' ? 'brightness-0 invert' : ''}`}
              />
            </button>

            {/* User avatar + name */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-ah-navy dark:text-white leading-tight">
                  Dr. Carlos Alberto Jiménez Ramírez
                </p>
              </div>
              <img
                src="/doctor.jpeg"
                alt="Dr. Carlos Alberto Jiménez Ramírez"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover object-top border-2 border-ah-gray/50 dark:border-white/40 shadow-sm"
                style={{ objectPosition: '50% 20%' }}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
