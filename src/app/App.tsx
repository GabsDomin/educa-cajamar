import { useState, useEffect } from 'react';
import { HomePage } from './pages/HomePage';
import { ActivitiesPage } from './pages/ActivitiesPage';
import { InstitutionsPage } from './pages/InstitutionsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AdminPage } from './pages/AdminPage';

type Page = 'home' | 'activities' | 'institutions' | 'analytics' | 'admin';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  useEffect(() => {
    const handleNavigation = (event: MouseEvent) => {
      const target = event.target as HTMLAnchorElement;
      if (target.tagName === 'A' && target.href) {
        event.preventDefault();
        const href = target.getAttribute('href') || '/';

        if (href === '/') setCurrentPage('home');
        else if (href === '/atividades') setCurrentPage('activities');
        else if (href === '/instituicoes') setCurrentPage('institutions');
        else if (href === '/analitico') setCurrentPage('analytics');
        else if (href === '/admin') setCurrentPage('admin');
      }
    };

    document.addEventListener('click', handleNavigation as any);
    return () => {
      document.removeEventListener('click', handleNavigation as any);
    };
  }, []);

  return (
    <div className="size-full">
      {currentPage === 'home' && <HomePage />}
      {currentPage === 'activities' && <ActivitiesPage />}
      {currentPage === 'institutions' && <InstitutionsPage />}
      {currentPage === 'analytics' && <AnalyticsPage />}
      {currentPage === 'admin' && <AdminPage />}
    </div>
  );
}