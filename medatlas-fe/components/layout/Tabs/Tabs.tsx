import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

interface Tab {
  href: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  className?: string;
}

const Tabs = ({ tabs, className = '' }: TabsProps) => {
  const pathname = usePathname();

  return (
    <div
      className={`flex border-b border-gray-200 dark:border-gray-800 mb-6 overflow-x-auto ${className}`}
    >
      <div className="flex space-x-1">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;

          return (
            <Link key={tab.href} href={tab.href} className="relative">
              <button
                className={`px-4 py-3 flex items-center gap-2 transition-all duration-200 relative group ${
                  isActive
                    ? 'text-blue-600 font-semibold'
                    : 'text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400'
                }`}
              >
                {tab.icon && <span className="text-lg">{tab.icon}</span>}
                <span className="whitespace-nowrap">{tab.label}</span>

                {tab.count !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      isActive
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}

                {/* Active indicator bar */}
                {isActive && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                    layoutId="activeTab"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}

                {/* Hover effect */}
                {!isActive && (
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Tabs;
