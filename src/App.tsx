import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { Sidebar, TabType } from './components/layout/Sidebar';
import { TopNavbar } from './components/layout/TopNavbar';
import { DashboardView } from './components/dashboard/DashboardView';
import { RoomsView } from './components/rooms/RoomsView';
import { StudentsView } from './components/students/StudentsView';
import { PaymentsView } from './components/payments/PaymentsView';
import { ExpensesView } from './components/expenses/ExpensesView';
import { ComplaintsView } from './components/complaints/ComplaintsView';
import { VisitorsView } from './components/visitors/VisitorsView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { StaySyncAIModal } from './components/ai/StaySyncAIModal';
import { AuthView } from './components/auth/AuthView';

// Inner App with data & auth context
const MainApp: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals triggerable from anywhere
  const [recordPaymentTargetId, setRecordPaymentTargetId] = useState<string | undefined>(undefined);

  if (!isAuthenticated) {
    return <AuthView />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'ai') {
            setIsAIModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        isOpenMobile={isMobileMenuOpen}
        setIsOpenMobile={setIsMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0 min-h-screen">
        {/* Top Navbar */}
        <TopNavbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenAdmitStudent={() => setActiveTab('students')}
          onOpenRecordPayment={() => {
            setRecordPaymentTargetId(undefined);
            setActiveTab('payments');
          }}
          onOpenAddExpense={() => setActiveTab('expenses')}
          onOpenAddComplaint={() => setActiveTab('complaints')}
          onOpenAddVisitor={() => setActiveTab('visitors')}
          onOpenAddRoom={() => setActiveTab('rooms')}
          onOpenAI={() => setIsAIModalOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={(q) => {
            setSearchQuery(q);
            if (q.trim() && activeTab !== 'students') {
              setActiveTab('students');
            }
          }}
        />

        {/* View Router */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              setActiveTab={setActiveTab}
              onOpenRecordPayment={(payId) => {
                setRecordPaymentTargetId(payId);
                setActiveTab('payments');
              }}
              onOpenAdmitStudent={() => setActiveTab('students')}
              onOpenAddExpense={() => setActiveTab('expenses')}
              onOpenAddComplaint={() => setActiveTab('complaints')}
              onOpenAI={() => setIsAIModalOpen(true)}
            />
          )}

          {activeTab === 'rooms' && (
            <RoomsView
              onOpenAdmitStudent={(roomId, bedId) => {
                setActiveTab('students');
              }}
            />
          )}

          {activeTab === 'students' && (
            <StudentsView
              initialSearchQuery={searchQuery}
              onOpenRecordPayment={() => setActiveTab('payments')}
              onPrintReceipt={(payId) => {
                setRecordPaymentTargetId(payId);
                setActiveTab('payments');
              }}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentsView
              initialPaymentIdToRecord={recordPaymentTargetId}
              onPrintReceiptRequested={(payId) => {
                setRecordPaymentTargetId(payId);
              }}
            />
          )}

          {activeTab === 'expenses' && <ExpensesView />}

          {activeTab === 'complaints' && <ComplaintsView />}

          {activeTab === 'visitors' && <VisitorsView />}

          {activeTab === 'reports' && <ReportsView />}

          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global StaySync AI Assistant Modal */}
      <StaySyncAIModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onNavigateToTab={(tab) => {
          setActiveTab(tab);
          setIsAIModalOpen(false);
        }}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <MainApp />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
