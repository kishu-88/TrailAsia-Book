import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import RequireTraveller from './components/RequireTraveller';
import HomePage from './pages/HomePage';
import DestinationsPage from './pages/DestinationsPage';
import DestinationPage from './pages/DestinationPage';
import EnquirySentPage from './pages/EnquirySentPage';
import SignInPage from './pages/SignInPage';
import ActivatePage from './pages/ActivatePage';
import MyTripsPage from './pages/MyTripsPage';
import TripDetailPage from './pages/TripDetailPage';
import SafetyPage from './pages/SafetyPage';
import AboutPage from './pages/AboutPage';
import OurStoryPage from './pages/OurStoryPage';
import TeamPage from './pages/TeamPage';
import WhyUsPage from './pages/WhyUsPage';
import SustainabilityPage from './pages/SustainabilityPage';
import ContactPage from './pages/ContactPage';
import FaqPage from './pages/FaqPage';
import TermsPrivacyPage from './pages/TermsPrivacyPage';

export default function App() {
  return (
    <>
      <NavBar />
      <div className="shell">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/destinations" element={<DestinationsPage />} />
          <Route path="/destinations/:id" element={<DestinationPage />} />
          <Route path="/enquiry-sent" element={<EnquirySentPage />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/activate" element={<ActivatePage />} />
          <Route
            path="/trips"
            element={
              <RequireTraveller>
                <MyTripsPage />
              </RequireTraveller>
            }
          />
          {/* Where a document notification's `link` points — a traveller can have
              more than one trip, so there's no single detail page to land on;
              the trip list is the closest "your stuff" landing spot. */}
          <Route
            path="/my-trip"
            element={
              <RequireTraveller>
                <MyTripsPage />
              </RequireTraveller>
            }
          />
          <Route
            path="/trips/:id"
            element={
              <RequireTraveller>
                <TripDetailPage />
              </RequireTraveller>
            }
          />
          {/* SOS and location sharing. Its own page so the nav can reach it in
              one tap from anywhere, rather than trips -> a trip -> scroll. */}
          <Route
            path="/safety"
            element={
              <RequireTraveller>
                <SafetyPage />
              </RequireTraveller>
            }
          />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/about/our-story" element={<OurStoryPage />} />
          <Route path="/about/team" element={<TeamPage />} />
          <Route path="/about/why-us" element={<WhyUsPage />} />
          <Route path="/about/sustainability" element={<SustainabilityPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/terms" element={<TermsPrivacyPage />} />
        </Routes>
      </div>
      <Footer />
    </>
  );
}
