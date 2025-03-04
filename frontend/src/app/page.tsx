"use client";

import { useState, useEffect } from "react";
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  Button, 
  Card, 
  CardContent, 
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  Snackbar
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useJwtAuth } from "@/components/auth/JwtProvider";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import DescriptionIcon from "@mui/icons-material/Description";
import PeopleIcon from "@mui/icons-material/People";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import NotificationsIcon from "@mui/icons-material/Notifications";

interface RecentPolicy {
  id: string;
  title: string;
  summary: string;
  level: string;
  date: string;
}

interface RecentRepresentative {
  id: string;
  name: string;
  position: string;
  party: string;
  imageUrl: string;
}

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading, login } = useJwtAuth();
  const [recentPolicies, setRecentPolicies] = useState<RecentPolicy[]>([]);
  const [recentRepresentatives, setRecentRepresentatives] = useState<RecentRepresentative[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [showAuthError, setShowAuthError] = useState(false);

  // Check for authentication errors in URL
  useEffect(() => {
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    if (error) {
      console.error('Authentication error:', error, errorDescription);
      setAuthError(errorDescription || 'Authentication failed. Please try again.');
      setShowAuthError(true);
    }
  }, [searchParams]);

  useEffect(() => {
    // In a real app, this would be an API call
    // For now, we'll use mock data
    const fetchHomeData = () => {
      setLoading(true);
      try {
        // Simulate API call
        setTimeout(() => {
          setRecentPolicies([
            {
              id: "1",
              title: "Clean Energy Act",
              summary: "Promotes renewable energy sources and reduces carbon emissions through tax incentives and regulations.",
              level: "Federal",
              date: "2023-10-15"
            },
            {
              id: "2",
              title: "Education Funding Reform",
              summary: "Increases funding for public schools and introduces new allocation formulas based on student needs.",
              level: "State",
              date: "2023-09-22"
            },
            {
              id: "3",
              title: "Healthcare Access Expansion",
              summary: "Expands Medicaid eligibility and introduces subsidies for low-income individuals to access healthcare services.",
              level: "Federal",
              date: "2023-11-05"
            }
          ]);
          
          setRecentRepresentatives([
            {
              id: "1",
              name: "Jane Smith",
              position: "Senator",
              party: "Democratic",
              imageUrl: "https://placehold.co/150"
            },
            {
              id: "2",
              name: "John Doe",
              position: "Representative",
              party: "Republican",
              imageUrl: "https://placehold.co/150"
            },
            {
              id: "3",
              name: "Emily Johnson",
              position: "Governor",
              party: "Democratic",
              imageUrl: "https://placehold.co/150"
            }
          ]);
          
          setLoading(false);
          setError("");
        }, 1000);
      } catch (err) {
        setError("Failed to load home data. Please try again later.");
        console.error(err);
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleLogin = () => {
    // Add debug logging
    console.log('HomePage - Login button clicked');
    console.log('HomePage - Authentication state:', { isAuthenticated, isLoading });
    
    // If already authenticated, redirect to profile
    if (isAuthenticated) {
      console.log('HomePage - User is already authenticated, redirecting to profile');
      router.push('/profile');
      return;
    }
    
    // Redirect to login page
    router.push('/login');
  };

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Auth Error Snackbar */}
      <Snackbar 
        open={showAuthError} 
        autoHideDuration={6000} 
        onClose={() => setShowAuthError(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowAuthError(false)} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {authError}
        </Alert>
      </Snackbar>

      {/* Hero Section */}
      <Box 
        sx={{ 
          py: 6, 
          textAlign: 'center',
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(https://images.unsplash.com/photo-1523292562811-8fa7962a78c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: 2,
          color: 'white',
          mb: 6
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          GovTrack
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}>
          Track government policies, see how representatives vote, and compare your political views with elected officials.
        </Typography>
        {!isLoading && !isAuthenticated && (
          <Button 
            variant="contained" 
            color="primary" 
            size="large" 
            onClick={handleLogin}
            sx={{ 
              mt: 3, 
              mb: 2,
              py: 1.5,
              px: 4,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1.1rem',
              fontWeight: 600,
              boxShadow: 3
            }}
          >
            Get Started
          </Button>
        )}
        <Button 
          variant="outlined" 
          size="large"
          onClick={() => handleNavigate('/policies')}
          sx={{ color: 'white', borderColor: 'white' }}
        >
          Explore Policies
        </Button>
      </Box>

      {/* Features Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom textAlign="center" sx={{ mb: 4 }}>
          Features
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationOnIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h6" component="h3">
                  Location-Based Policies
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ mb: 2, flexGrow: 1 }}>
                See policies relevant to your location at the local, state, and federal levels.
              </Typography>
              <Button 
                variant="outlined" 
                onClick={() => handleNavigate('/policies')}
              >
                View Policies
              </Button>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h6" component="h3">
                  Representative Tracking
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ mb: 2, flexGrow: 1 }}>
                Track your representatives and see how they vote on policies that matter to you.
              </Typography>
              <Button 
                variant="outlined" 
                onClick={() => handleNavigate('/representatives')}
              >
                View Representatives
              </Button>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <HowToVoteIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h6" component="h3">
                  Political Alignment Quiz
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ mb: 2, flexGrow: 1 }}>
                Take our quiz to see how your political views align with elected officials.
              </Typography>
              <Button 
                variant="outlined" 
                onClick={() => handleNavigate('/quiz')}
              >
                Take Quiz
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Recent Content Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom textAlign="center" sx={{ mb: 4 }}>
          Recent Updates
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
        ) : (
          <Grid container spacing={4}>
            {/* Recent Policies */}
            <Grid item xs={12} md={6}>
              <Typography variant="h5" component="h3" gutterBottom>
                Recent Policies
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {recentPolicies.map((policy) => (
                <Card key={policy.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" component="div">
                      {policy.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {policy.level} • {new Date(policy.date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2">
                      {policy.summary}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => handleNavigate(`/policies/${policy.id}`)}>
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              ))}
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Button 
                  variant="contained" 
                  onClick={() => handleNavigate('/policies')}
                >
                  View All Policies
                </Button>
              </Box>
            </Grid>
            
            {/* Recent Representatives */}
            <Grid item xs={12} md={6}>
              <Typography variant="h5" component="h3" gutterBottom>
                Featured Representatives
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {recentRepresentatives.map((rep) => (
                <Card key={rep.id} sx={{ mb: 2 }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box 
                      component="img"
                      src={rep.imageUrl}
                      alt={rep.name}
                      sx={{ width: 60, height: 60, borderRadius: '50%', mr: 2 }}
                    />
                    <Box>
                      <Typography variant="h6" component="div">
                        {rep.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {rep.position} • {rep.party}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => handleNavigate(`/representatives/${rep.id}`)}>
                      View Profile
                    </Button>
                  </CardActions>
                </Card>
              ))}
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Button 
                  variant="contained" 
                  onClick={() => handleNavigate('/representatives')}
                >
                  View All Representatives
                </Button>
              </Box>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* How It Works Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom textAlign="center" sx={{ mb: 4 }}>
          How It Works
        </Typography>
        <Paper sx={{ p: 4 }}>
          <List>
            <ListItem>
              <ListItemIcon>
                <LocationOnIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Set Your Location" 
                secondary="Enter your address to see policies and representatives relevant to your area."
              />
            </ListItem>
            <Divider component="li" />
            <ListItem>
              <ListItemIcon>
                <DescriptionIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Browse Policies" 
                secondary="View current and upcoming policies with simplified, unbiased explanations."
              />
            </ListItem>
            <Divider component="li" />
            <ListItem>
              <ListItemIcon>
                <PeopleIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Track Representatives" 
                secondary="See how your elected officials vote on policies and their political stances."
              />
            </ListItem>
            <Divider component="li" />
            <ListItem>
              <ListItemIcon>
                <HowToVoteIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Take the Quiz" 
                secondary="Answer questions about your political views and see how they align with representatives."
              />
            </ListItem>
            <Divider component="li" />
            <ListItem>
              <ListItemIcon>
                <BookmarkIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Save and Track" 
                secondary="Save policies and representatives to your profile for easy access and tracking."
              />
            </ListItem>
            <Divider component="li" />
            <ListItem>
              <ListItemIcon>
                <NotificationsIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Get Notifications" 
                secondary="Receive updates when new policies are proposed or when votes occur."
              />
            </ListItem>
          </List>
        </Paper>
      </Box>

      {/* Call to Action */}
      <Box 
        sx={{ 
          py: 6, 
          textAlign: 'center',
          bgcolor: 'primary.main',
          color: 'white',
          borderRadius: 2
        }}
      >
        <Typography variant="h4" component="h2" gutterBottom>
          Ready to Get Started?
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
          Sign up today to track policies, representatives, and stay informed about the issues that matter to you.
        </Typography>
        {!isLoading && !isAuthenticated ? (
          <Button 
            variant="contained" 
            size="large" 
            onClick={handleLogin}
            sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
          >
            Sign Up Now
          </Button>
        ) : (
          <Button 
            variant="contained" 
            size="large" 
            onClick={() => handleNavigate('/policies')}
            sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
          >
            Explore Policies
          </Button>
        )}
      </Box>
    </Container>
  );
} 