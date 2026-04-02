import { Outlet } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import { useIsMobile } from '../hooks/use-mobile';

export default function Layout() {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      <main className={isMobile ? 'pb-16' : ''}>
        <Outlet />
      </main>
      {isMobile && <BottomNavigation />}
    </div>
  );
}
