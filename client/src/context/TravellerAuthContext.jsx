import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  refreshTravellerSession,
  travellerLogin as apiLogin,
  travellerActivate as apiActivate,
  travellerLogout as apiLogout,
} from '../api';

const TravellerAuthContext = createContext(null);

/**
 * Mounted around the whole app (not just `/trips/*`) because the public
 * pages also need to know whether someone is signed in, to route "view my
 * trips" correctly. Boots by calling /auth/traveller/refresh once — if the
 * traveller refresh cookie is still good, that's a sign-in with no form.
 */
export function TravellerAuthProvider({ children }) {
  const [traveller, setTraveller] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    let cancelled = false;
    refreshTravellerSession().then((result) => {
      if (!cancelled) {
        setTraveller(result);
        setBooting(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const result = await apiLogin(email, password);
    setTraveller(result);
    return result;
  }, []);

  const activate = useCallback(async (token, password) => {
    const result = await apiActivate(token, password);
    setTraveller(result);
    return result;
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setTraveller(null);
  }, []);

  return (
    <TravellerAuthContext.Provider value={{ traveller, booting, login, activate, logout }}>
      {children}
    </TravellerAuthContext.Provider>
  );
}

export function useTravellerAuth() {
  const context = useContext(TravellerAuthContext);
  if (!context) throw new Error('useTravellerAuth must be used inside a TravellerAuthProvider.');
  return context;
}
