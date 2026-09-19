import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useLanguage } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LanguageSelectorModal } from './components/LanguageSelectorModal';

// Auth pages
import { LoginPage } from './pages/Auth/LoginPage';
import { FarmerRegisterPage } from './pages/Auth/FarmerRegisterPage';
import { BuyerRegisterPage } from './pages/Auth/BuyerRegisterPage';

// Farmer pages
import { FarmerDashboard } from './pages/Farmer/FarmerDashboard';
import { SellCropsPage } from './pages/Farmer/SellCropsPage';
import { FarmerListingsPage } from './pages/Farmer/FarmerListingsPage';
import { FarmerRequestsPage } from './pages/Farmer/FarmerRequestsPage';
import { FarmerOrdersPage } from './pages/Farmer/FarmerOrdersPage';

// Buyer pages
import { BuyerDashboard } from './pages/Buyer/BuyerDashboard';
import { BrowseCropsPage } from './pages/Buyer/BrowseCropsPage';
import { BuyerOrdersPage } from './pages/Buyer/BuyerOrdersPage';

// Shared
import { ProfilePage } from './pages/Shared/ProfilePage';

export function App() {
  const { user, loading, isFarmer, isBuyer } = useAuth();
  const { hasChosenLanguage } = useLanguage();

  const [authView, setAuthView] = useState('login'); // 'login' | 'register-farmer' | 'register-buyer'
  const [currentTab, setCurrentTab] = useState('home');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-farm-200 border-t-farm-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-gray-700">Loading FarmNexus...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 overflow-x-hidden selection:bg-farm-500 selection:text-white">
      {/* 1. Language Selection Screen at the beginning */}
      {!hasChosenLanguage && <LanguageSelectorModal />}

      {/* 2. Unauthenticated Flow */}
      {!user ? (
        <div className="flex-1 flex flex-col">
          <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
            {authView === 'login' && (
              <LoginPage
                onNavigateRegisterFarmer={() => setAuthView('register-farmer')}
                onNavigateRegisterBuyer={() => setAuthView('register-buyer')}
              />
            )}
            {authView === 'register-farmer' && (
              <FarmerRegisterPage
                onNavigateLogin={() => setAuthView('login')}
                onNavigateRegisterBuyer={() => setAuthView('register-buyer')}
              />
            )}
            {authView === 'register-buyer' && (
              <BuyerRegisterPage
                onNavigateLogin={() => setAuthView('login')}
                onNavigateRegisterFarmer={() => setAuthView('register-farmer')}
              />
            )}
          </main>
          <Footer />
        </div>
      ) : (
        /* 3. Authenticated Flow (Farmer or Buyer) */
        <div className="flex-1 flex flex-col">
          <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

          <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {/* FARMER VIEWS */}
            {isFarmer && (
              <>
                {currentTab === 'home' && (
                  <FarmerDashboard onNavigate={(tab) => setCurrentTab(tab)} />
                )}
                {currentTab === 'sell-crops' && (
                  <SellCropsPage
                    onBack={() => setCurrentTab('home')}
                    onNavigateListings={() => setCurrentTab('my-listings')}
                  />
                )}
                {currentTab === 'my-listings' && (
                  <FarmerListingsPage
                    onNavigateSell={() => setCurrentTab('sell-crops')}
                  />
                )}
                {currentTab === 'buyer-requests' && (
                  <FarmerRequestsPage
                    onNavigateOrders={() => setCurrentTab('my-orders')}
                  />
                )}
                {currentTab === 'my-orders' && <FarmerOrdersPage />}
                {currentTab === 'profile' && <ProfilePage />}
              </>
            )}

            {/* BUYER VIEWS */}
            {isBuyer && (
              <>
                {currentTab === 'home' && (
                  <BuyerDashboard onNavigate={(tab) => setCurrentTab(tab)} />
                )}
                {currentTab === 'browse-crops' && (
                  <BrowseCropsPage
                    onNavigateOrders={() => setCurrentTab('my-orders')}
                  />
                )}
                {currentTab === 'my-orders' && (
                  <BuyerOrdersPage
                    onNavigateBrowse={() => setCurrentTab('browse-crops')}
                  />
                )}
                {currentTab === 'profile' && <ProfilePage />}
              </>
            )}
          </main>

          <Footer />
        </div>
      )}
    </div>
  );
}
export default App;
