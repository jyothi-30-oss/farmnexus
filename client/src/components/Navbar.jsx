import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Sprout, 
  PlusCircle, 
  ListOrdered, 
  Inbox, 
  ShoppingBag, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Globe,
  Search,
  CheckCircle2
} from 'lucide-react';

export const Navbar = ({ currentTab, setCurrentTab }) => {
  const { user, isFarmer, isBuyer, logout } = useAuth();
  const { language, setLanguage, openLanguageSelection, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const handleTabClick = (tab) => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div 
            onClick={() => handleTabClick('home')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-farm-600 text-white flex items-center justify-center shadow-md shadow-farm-600/20 group-hover:bg-farm-700 transition">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-black text-farm-900 tracking-tight flex items-center gap-1.5">
                FarmNexus
              </span>
              <span className="block text-[10px] text-gray-500 font-medium tracking-wide">
                {t('tagline')}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          {user && (
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              <button
                onClick={() => handleTabClick('home')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                  currentTab === 'home'
                    ? 'bg-farm-50 text-farm-800'
                    : 'text-gray-600 hover:text-farm-700 hover:bg-gray-50'
                }`}
              >
                {t('navHome')}
              </button>

              {/* Farmer Navigation */}
              {isFarmer && (
                <>
                  <button
                    onClick={() => handleTabClick('sell-crops')}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                      currentTab === 'sell-crops'
                        ? 'bg-farm-50 text-farm-800'
                        : 'text-gray-600 hover:text-farm-700 hover:bg-gray-50'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" />
                    {t('navSellCrops')}
                  </button>

                  <button
                    onClick={() => handleTabClick('my-listings')}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                      currentTab === 'my-listings'
                        ? 'bg-farm-50 text-farm-800'
                        : 'text-gray-600 hover:text-farm-700 hover:bg-gray-50'
                    }`}
                  >
                    <ListOrdered className="w-4 h-4" />
                    {t('navMyListings')}
                  </button>

                  <button
                    onClick={() => handleTabClick('buyer-requests')}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                      currentTab === 'buyer-requests'
                        ? 'bg-farm-50 text-farm-800'
                        : 'text-gray-600 hover:text-farm-700 hover:bg-gray-50'
                    }`}
                  >
                    <Inbox className="w-4 h-4" />
                    {t('navBuyerRequests')}
                  </button>

                  <button
                    onClick={() => handleTabClick('my-orders')}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                      currentTab === 'my-orders'
                        ? 'bg-farm-50 text-farm-800'
                        : 'text-gray-600 hover:text-farm-700 hover:bg-gray-50'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    {t('navMyOrders')}
                  </button>
                </>
              )}



              <button
                onClick={() => handleTabClick('profile')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                  currentTab === 'profile'
                    ? 'bg-farm-50 text-farm-800'
                    : 'text-gray-600 hover:text-farm-700 hover:bg-gray-50'
                }`}
              >
                <User className="w-4 h-4" />
                {t('navProfile')}
              </button>
            </nav>
          )}

          {/* Right Controls: Language Selector & User Profile */}
          <div className="flex items-center gap-3">
            {/* Language Switcher Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-farm-400 bg-white text-xs font-semibold text-gray-700 shadow-2xs transition"
                title="Change language"
              >
                <Globe className="w-3.5 h-3.5 text-farm-600" />
                <span className="uppercase">{language}</span>
              </button>

              {langDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-in fade-in slide-in-from-top-1"
                  onMouseLeave={() => setLangDropdownOpen(false)}
                >
                  <button
                    onClick={() => { setLanguage('en'); setLangDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between hover:bg-farm-50 ${
                      language === 'en' ? 'text-farm-700 font-bold bg-farm-50/50' : 'text-gray-700'
                    }`}
                  >
                    <span>English</span>
                    {language === 'en' && <CheckCircle2 className="w-3.5 h-3.5 text-farm-600" />}
                  </button>
                  <button
                    onClick={() => { setLanguage('te'); setLangDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between hover:bg-farm-50 ${
                      language === 'te' ? 'text-farm-700 font-bold bg-farm-50/50' : 'text-gray-700'
                    }`}
                  >
                    <span>తెలుగు (Telugu)</span>
                    {language === 'te' && <CheckCircle2 className="w-3.5 h-3.5 text-farm-600" />}
                  </button>
                  <button
                    onClick={() => { setLanguage('hi'); setLangDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between hover:bg-farm-50 ${
                      language === 'hi' ? 'text-farm-700 font-bold bg-farm-50/50' : 'text-gray-700'
                    }`}
                  >
                    <span>हिंदी (Hindi)</span>
                    {language === 'hi' && <CheckCircle2 className="w-3.5 h-3.5 text-farm-600" />}
                  </button>
                </div>
              )}
            </div>

            {/* User Info & Logout */}
            {user ? (
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-gray-200">
                <div className="text-right">
                  <span className="block text-xs font-bold text-gray-900 leading-tight">
                    {user.name}
                  </span>
                  <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    isFarmer 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {isFarmer ? t('farmerRole') : t('buyerRole')}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title={t('navLogout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : null}

            {/* Mobile Hamburger Button */}
            {user && (
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && user && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pt-2 pb-4 space-y-1">
          <div className="py-2 mb-2 border-b border-gray-100 flex items-center justify-between">
            <div>
              <span className="font-bold text-sm text-gray-900">{user.name}</span>
              <span className="block text-xs text-gray-500">{user.phone}</span>
            </div>
            <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
              isFarmer ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {isFarmer ? t('farmerRole') : t('buyerRole')}
            </span>
          </div>

          <button
            onClick={() => handleTabClick('home')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${
              currentTab === 'home' ? 'bg-farm-100 text-farm-900' : 'text-gray-700'
            }`}
          >
            {t('navHome')}
          </button>

          {isFarmer && (
            <>
              <button
                onClick={() => handleTabClick('sell-crops')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${
                  currentTab === 'sell-crops' ? 'bg-farm-100 text-farm-900' : 'text-gray-700'
                }`}
              >
                {t('navSellCrops')}
              </button>

              <button
                onClick={() => handleTabClick('my-listings')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${
                  currentTab === 'my-listings' ? 'bg-farm-100 text-farm-900' : 'text-gray-700'
                }`}
              >
                {t('navMyListings')}
              </button>

              <button
                onClick={() => handleTabClick('buyer-requests')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${
                  currentTab === 'buyer-requests' ? 'bg-farm-100 text-farm-900' : 'text-gray-700'
                }`}
              >
                {t('navBuyerRequests')}
              </button>

              <button
                onClick={() => handleTabClick('my-orders')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${
                  currentTab === 'my-orders' ? 'bg-farm-100 text-farm-900' : 'text-gray-700'
                }`}
              >
                {t('navMyOrders')}
              </button>
            </>
          )}



          <button
            onClick={() => handleTabClick('profile')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${
              currentTab === 'profile' ? 'bg-farm-100 text-farm-900' : 'text-gray-700'
            }`}
          >
            {t('navProfile')}
          </button>

          <button
            onClick={() => { logout(); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 pt-3 border-t border-gray-100 mt-2"
          >
            <LogOut className="w-4 h-4" />
            {t('navLogout')}
          </button>
        </div>
      )}
    </header>
  );
};
