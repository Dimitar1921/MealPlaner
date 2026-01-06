import * as React from 'react';
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
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { setUser } from '../redux/actions/userActions';
import { authAPI } from '../services/api';
import { loadMealPlanFromDatabase } from '../services/mealPlan';

const defaultTheme = createTheme();

// Meal-plan loading is centralized in `ui/src/services/mealPlan.js`

export default function SignUp() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [error, setError] = React.useState("");
    const [loading, setLoading] = React.useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        
        const email = data.get('email');
        const password = data.get('password');
        const firstName = data.get('firstName');
        const lastName = data.get('lastName');

        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        const confirmPassword = data.get('confirmPassword');

        if (!password || password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (!firstName || firstName.trim().length === 0) {
            setError("First name is required.");
            return;
        }

        
        const username = email.split('@')[0]; 

        setError("");
        setLoading(true);

        try {
            const response = await authAPI.register({
                email,
                username,
                password,
                firstName,
                lastName
            });

            if (response.success) {
                
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                
                
                dispatch(setUser(response.data.user));
                
                
                const hasMealPlan = await loadMealPlanFromDatabase(dispatch);
                
                
                localStorage.setItem('hasMealPlan', hasMealPlan ? 'true' : 'false');
                
                navigate('/checkout');
            } else {
                setError(response.message || "Registration failed. Please try again.");
            }
        } catch (error) {
            console.error('Registration error:', error);
            setError(error.response?.data?.message || "An error occurred. Please try again later.");
        } finally {
            setLoading(false);
        }
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
                        Sign up
                    </Typography>
                    {error && (
                        <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
                            {error}
                        </Typography>
                    )}
                    <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    autoComplete="given-name"
                                    name="firstName"
                                    required
                                    fullWidth
                                    id="firstName"
                                    label="First Name"
                                    autoFocus
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    id="lastName"
                                    label="Last Name"
                                    name="lastName"
                                    autoComplete="family-name"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    id="email"
                                    label="Email Address"
                                    name="email"
                                    autoComplete="email"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type="password"
                                    id="password"
                                    autoComplete="new-password"
                                    helperText="Password must be at least 6 characters"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    name="confirmPassword"
                                    label="Confirm Password"
                                    type="password"
                                    id="confirmPassword"
                                    autoComplete="new-password"
                                />
                            </Grid>
                           
                        </Grid>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading}
                        >
                            {loading ? 'Signing up...' : 'Sign Up'}
                        </Button>
                        <Grid container justifyContent="flex-end">
                            <Grid item>
                                <Link component={RouterLink} to="/" variant="body2">
                                    Already have an account? Sign in
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Container>
        </ThemeProvider>
    );
}