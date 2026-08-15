import { useState } from 'react';
import Layout, { type Page } from '@/components/Layout';
import ToastHost from '@/components/Toast';
import Dashboard from '@/pages/Dashboard';
import BooksPage from '@/pages/Books';
import MembersPage from '@/pages/Members';
import CirculationPage from '@/pages/Circulation';

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');

  return (
    <>
      <Layout current={page} onNavigate={setPage}>
        {page === 'dashboard' && <Dashboard />}
        {page === 'books' && <BooksPage />}
        {page === 'members' && <MembersPage />}
        {page === 'circulation' && <CirculationPage />}
      </Layout>
      <ToastHost />
    </>
  );
}
