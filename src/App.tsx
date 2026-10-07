import React from 'react';
import { FoodSystemProvider, useFoodSystem } from './context/FoodSystemContext';
import { Header } from './components/Header';
import { PDVScreen } from './components/PDVScreen';
import { MesasScreen } from './components/MesasScreen';
import { CaixaScreen } from './components/CaixaScreen';
import { EstoqueScreen } from './components/EstoqueScreen';
import { KDSScreen } from './components/KDSScreen';
import { FichasScreen } from './components/FichasScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { NetworkConfigScreen } from './components/NetworkConfigScreen';
import { SyncQueueScreen } from './components/SyncQueueScreen';
import { InstrucoesScreen } from './components/InstrucoesScreen';
import { CloudLoginScreen } from './components/Cloud/CloudLoginScreen';
import { CloudRemoteDashboard } from './components/Cloud/CloudRemoteDashboard';
import { OfflineNoticeBanner } from './components/Network/OfflineNoticeBanner';
import { WifiFlightToast } from './components/Network/WifiFlightToast';
import { ReceiptModal } from './components/ReceiptModal';
import { ToastContainer } from './components/ToastContainer';
import { TabletFrame } from './components/TabletFrame';
import { CustomerContainer } from './components/CustomerMenu/CustomerContainer';
import { DigitalOrderAlertModal } from './components/DigitalOrderAlertModal';
import { QRCodeModal } from './components/QRCodeModal';

const MainAppContent: React.FC = () => {
  const { activeScreen, interfaceMode } = useFoodSystem();

  // If mobile customer mode is active, show the customer smartphone experience!
  if (interfaceMode === 'mobile_customer') {
    return (
      <div className="w-full h-screen bg-[#070a12] overflow-hidden">
        <CustomerContainer />
        <WifiFlightToast />
        <ToastContainer />
      </div>
    );
  }

  // If cloud login mode is active
  if (interfaceMode === 'cloud_login') {
    return (
      <div className="w-full h-screen bg-[#070a12] overflow-hidden">
        <CloudLoginScreen />
        <ToastContainer />
      </div>
    );
  }

  // If cloud remote dashboard mode is active
  if (interfaceMode === 'cloud_remote') {
    return (
      <div className="w-full h-screen bg-[#070a12] overflow-hidden">
        <CloudRemoteDashboard />
        <WifiFlightToast />
        <ToastContainer />
      </div>
    );
  }

  // Restaurant Tablet Mode
  return (
    <TabletFrame>
      <div className="w-full h-full flex flex-col bg-[#0b101c] text-slate-100 overflow-hidden font-sans">
        <Header />
        <OfflineNoticeBanner />
        
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {activeScreen === 'pdv' && <PDVScreen />}
          {activeScreen === 'mesas' && <MesasScreen />}
          {activeScreen === 'caixa' && <CaixaScreen />}
          {activeScreen === 'estoque' && <EstoqueScreen />}
          {activeScreen === 'kds' && <KDSScreen />}
          {activeScreen === 'fichas' && <FichasScreen />}
          {activeScreen === 'dashboard' && <DashboardScreen />}
          {activeScreen === 'rede' && <NetworkConfigScreen />}
          {activeScreen === 'sync_queue' && <SyncQueueScreen />}
          {activeScreen === 'instrucoes' && <InstrucoesScreen />}
        </main>

        <DigitalOrderAlertModal />
        <QRCodeModal />
        <ReceiptModal />
        <WifiFlightToast />
        <ToastContainer />
      </div>
    </TabletFrame>
  );
};

export default function App() {
  return (
    <FoodSystemProvider>
      <MainAppContent />
    </FoodSystemProvider>
  );
}
