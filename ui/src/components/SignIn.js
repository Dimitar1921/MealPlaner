import React, { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

import { setUser } from '../redux/actions/userActions';
import { authAPI } from '../services/api';
import { loadMealPlanFromDatabase } from '../services/mealPlan';

const defaultTheme = createTheme();



export default function SignIn() {

    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const dispatch = useDispatch();
    const handleSubmit = async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const email = data.get('email');
        const password = data.get('password');

       
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        
        if (!password || password.length === 0) {
            setError("Password is required.");
            return;
        }

        setError("");
        setLoading(true);

        try {
            const response = await authAPI.login({ email, password });
            
            if (response.success) {
                
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                
                
                dispatch(setUser(response.data.user));
                
                
                const hasMealPlan = await loadMealPlanFromDatabase(dispatch);
                localStorage.setItem('hasMealPlan', hasMealPlan ? 'true' : 'false');
                
                navigate('/checkout');
            } else {
                setError(response.message || "Login failed. Please check your credentials.");
            }
        } catch (error) {
            console.error('Login error:', error);
            setError(error.response?.data?.message || "An error occurred. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const decoded = jwtDecode(credentialResponse.credential);
            const { email, name, picture, sub } = decoded;
            
            setLoading(true);
            setError("");

            const response = await authAPI.googleAuth({
                email,
                name,
                picture,
                googleId: sub
            });

            if (response.success) {
                
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                
                
                dispatch(setUser(response.data.user));
                
                
                const hasMealPlan = await loadMealPlanFromDatabase(dispatch);
                localStorage.setItem('hasMealPlan', hasMealPlan ? 'true' : 'false');
                
                navigate('/checkout');
            } else {
                setError(response.message || "Google login failed. Please try again.");
            }
        } catch (error) {
            console.error('Error with Google authentication:', error);
            setError(error.response?.data?.message || "Google login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleError = () => {
        setError("Google login was unsuccessful. Please try again.");
    };

    return (
        <ThemeProvider theme={defaultTheme}>
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Sign in
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                        />
                        <FormControlLabel
                            control={<Checkbox value="remember" color="primary" />}
                            label="Remember me"
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                        {error && <Typography color="error" sx={{ mt: 1, mb: 1 }}>{error}</Typography>}
                        
                        <Divider sx={{ my: 2 }}>OR</Divider>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                                useOneTap
                            />
                        </Box>
                        <Grid container>
                            
                            <Grid item>
                                <Link component={RouterLink} to="/signup" variant="body2">
                                    {"Don't have an account? Sign Up"}
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Container>
        </ThemeProvider>
    );
}
