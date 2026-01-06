import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useDispatch, useSelector } from 'react-redux';
import './App.css';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Checkout from './components/main/Checkout';
import Header from './components/Header';
import { Provider } from 'react-redux';
import store from './redux/store';
import { setUser } from './redux/actions/userActions';
import { loadMealPlanFromDatabase } from './services/mealPlan';


const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_HERE';


const ProtectedRoute = ({ children }) => {
  const user = useSelector((state) => state.user.user);
  const storedUserRaw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  let storedUser = null;
  try {
    storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;
  } catch {
    storedUser = null;
  }

  const isAuthenticated =
    (user && (user.email || user.username)) ||
    (storedToken && storedUser && (storedUser.email || storedUser.username));
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <>
      <Header />
      {children}
    </>
  );
};


const PublicRoute = ({ children }) => {
  const user = useSelector((state) => state.user.user);
  const storedUserRaw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  let storedUser = null;
  try {
    storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;
  } catch {
    storedUser = null;
  }

  const isAuthenticated =
    (user && (user.email || user.username)) ||
    (storedToken && storedUser && (storedUser.email || storedUser.username));
  
  if (isAuthenticated) {
    return <Navigate to="/checkout" replace />;
  }
  
  return children;
};

function AuthBootstrap() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const userRaw = localStorage.getItem('user');
    if (!token || !userRaw) return;

    const hasReduxUser = user && (user.email || user.username);
    if (hasReduxUser) return;

    try {
      const parsedUser = JSON.parse(userRaw);
      if (!parsedUser) return;
      dispatch(setUser(parsedUser));
      
      loadMealPlanFromDatabase(dispatch).then((hasPlan) => {
        localStorage.setItem('hasMealPlan', hasPlan ? 'true' : 'false');
      });
    } catch {
      
    }
  }, [dispatch, user]);

  return null;
}

function AppRoutes() {
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <PublicRoute>
            <SignIn />
          </PublicRoute>
        } 
      />
      <Route 
        path="/signup" 
        element={
          <PublicRoute>
            <SignUp />
          </PublicRoute>
        } 
      />
      <Route 
        path="/checkout" 
        element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        } 
      />
      {/* Add more routes as needed */}
    </Routes>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        <Router>
          <div className="App">
            <AuthBootstrap />
            <AppRoutes />
          </div>
        </Router>
      </Provider>
    </GoogleOAuthProvider>
  );
}

export default App;
