import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { AdminOverview } from './Overview';
import { AdminBookings } from './BookingsNew';
import { AdminStaff } from './Staff';
import { AdminRefunds } from './Refunds';
import { AdminReviewModeration } from './ReviewModeration';
import { AdminPromoCodes } from './PromoCodes';
import { AdminReports } from './Reports';
import { AdminInventory } from './Inventory';
import { AdminInquiries } from './Inquiries';
import { AdminAuditLogs } from './AuditLogs';
import { AdminEmailTemplates } from './EmailTemplates';
import { AdminAnalytics } from './Analytics';

const AdminDashboard: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('overview');

  const renderPage = () => {
    switch (currentPage) {
      case 'overview':
        return <AdminOverview />;
      case 'bookings':
        return <AdminBookings />;
      case 'staff':
        return <AdminStaff />;
      case 'reviews':
        return <AdminReviewModeration />;
      case 'promo':
        return <AdminPromoCodes />;
      case 'reports':
        return <AdminReports />;
      case 'refunds':
        return <AdminRefunds />;
      case 'analytics':
        return <AdminAnalytics />;
      case 'inventory':
        return <AdminInventory />;
      case 'inquiries':
        return <AdminInquiries />;
      case 'audit':
        return <AdminAuditLogs />;
      case 'templates':
        return <AdminEmailTemplates />;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <AdminLayout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </AdminLayout>
  );
};

export default AdminDashboard;
