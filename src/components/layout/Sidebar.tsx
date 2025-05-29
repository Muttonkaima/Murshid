'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import { 
  FiHome, 
  FiMessageSquare, 
  FiTool, 
  FiAward, 
  FiSettings, 
  FiBookOpen, 
  FiLogOut, 
  FiChevronDown, 
  FiChevronUp, 
  FiMenu, 
  FiX,
  FiBell,
  FiUser,
  FiChevronRight,
  FiLayers
} from 'react-icons/fi';

interface Subject {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  isVisible: boolean;
  order: number;
}

const Sidebar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  // Automatically open the dropdown if we're on a subject page
  useEffect(() => {
    if (pathname.startsWith('/subjects')) {
      setOpenDropdown('Subjects');
    } else {
      setOpenDropdown(null);
    }
  }, [pathname]);

  useEffect(() => {
    // Load subjects from the JSON file
    const loadSubjects = async () => {
      try {
        // Using require to import JSON directly in the frontend
        const data = await import('@/data/10/STATE/subjects/subjects.json');
        const visibleSubjects = data.subjects
          .filter((subject: Subject) => subject.isVisible && subject.isActive)
          .sort((a: Subject, b: Subject) => a.order - b.order);
        setSubjects(visibleSubjects);
      } catch (error) {
        console.error('Failed to load subjects:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSubjects();
  }, []);

  const navItems = [
    { name: 'Home', icon: <FiHome size={20} />, href: '/dashboard' },
    { 
      name: 'Subjects', 
      icon: <FiBookOpen size={20} />, 
      dropdown: true,
      items: subjects.map(subject => ({
        name: subject.name,
        href: `/subjects/${subject.slug}`
      })),
      href: '/subjects'
    },
    { name: 'Fundamentals', icon: <FiLayers size={20} />, href: '/fundamentals' },
    { name: 'Chat With Murshid', icon: <FiMessageSquare size={20} />, href: '/chat' },
    { name: 'AI Tools', icon: <FiTool size={20} />, href: '/ai-tools' },
    { name: 'Results', icon: <FiAward size={20} />, href: '/results' },
    { name: 'Tutorial', icon: <FiBookOpen size={20} />, href: '/tutorial' },
    { name: 'Settings', icon: <FiSettings size={20} />, href: '/settings' },
  ];

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const isActive = (href: string) => {
    // Check if the current pathname matches the href or is a child route
    const isActive = pathname === href || 
                   (pathname.startsWith(href) && href !== '/') ||
                   pathname === `${href}/`;
    return isActive ? 'bg-[var(--primary-color)] bg-opacity-10 text-white' : 'text-gray-600 hover:bg-gray-100';
  };

  // Check if a subject is active
  const isSubjectActive = (subjectHref: string) => {
    return pathname === subjectHref || 
           pathname.startsWith(`${subjectHref}/`);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md cursor-pointer text-[var(--primary-color)]"
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out z-40 w-64 bg-white border-r border-gray-200 flex flex-col`}
        style={{ height: '100vh' }}
      >
        <div className="p-0.5 border-b border-gray-200 flex justify-center">
          <img 
            src="/images/icon.png" 
            alt="Murshid Logo" 
            className="h-16 w-auto object-contain"
          />
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => (
              <li key={item.name}>
                {item.dropdown ? (
                  <div>
                    <Link
                      href={item.href}
                    >
                    <button
                      onClick={() => toggleDropdown(item.name)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg ${isActive(item.href || '')} transition-colors cursor-pointer`}
                    >
                      <div className="flex items-center space-x-3">
                        <span>{item.icon}</span>
                        <span>{item.name}</span>
                      </div>
                      {openDropdown === item.name ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                    </Link>
                    {openDropdown === item.name && (
                      <ul className="mt-1 ml-10 space-y-1">   
                        {loading ? (
                          <li className="px-4 py-2 text-sm text-gray-500">Loading subjects...</li>
                        ) : item.items && item.items.length === 0 ? (
                          <li className="px-4 py-2 text-sm text-gray-500">No subjects available</li>
                        ) : (
                          item.items?.map((subItem) => (
                            <li key={subItem.href}>
                              <Link
                                href={subItem.href}
                                className={`block px-4 py-2 text-sm rounded-lg transition-colors ${
                                  isSubjectActive(subItem.href)
                                    ? 'bg-[var(--primary-color)]/20 text-[var(--primary-color)] font-medium'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                {subItem.name}
                               
                              </Link>
                            </li>
                          ))
                        )}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href || '#'}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${isActive(item.href || '')} transition-colors`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          >
            <FiLogOut size={20} />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
