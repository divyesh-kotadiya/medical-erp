import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

interface Tab {
  href: string;
  label: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  className?: string;
  variant?: 'default' | 'pills';
}

const FancyTabs = ({ tabs, className = '', variant = 'default' }: TabsProps) => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`flex border-b border-gray-200 dark:border-gray-800 mb-6 w-full ${className}`}>
        {tabs.map((tab) => (
          <div key={tab.href} className="px-5 py-4 text-gray-400">
            {tab.label}
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'pills') {
    return (
      <div className={`flex space-x-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg mb-6 ${className}`}>
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          return (
            <Link key={tab.href} href={tab.href} prefetch={false}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-4 py-2 flex items-center gap-2 rounded-md transition-all ${
                  isActive
                    ? 'bg-white dark:bg-gray-900 shadow-sm text-blue-600 font-semibold'
                    : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span>{tab.label}</span>

                {tab.count !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      isActive
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </motion.button>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`flex border-b border-gray-200 dark:border-gray-800 mb-6 w-full ${className}`}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        const Icon = tab.icon;

        return (
          <Link key={tab.href} href={tab.href} prefetch={false} className="relative group">
            <button
              className={`px-5 py-4 flex items-center gap-2 transition-all duration-200 ${
                isActive
                  ? 'text-primary font-semibold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {Icon && <Icon className="w-4 h-4" />}
              <span>{tab.label}</span>

              {tab.count !== undefined && (
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>

            {isActive && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                layoutId="tabIndicator"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </Link>
        );
      })}
    </div>
  );
};

export default FancyTabs;
