"use client";

import { useState, useEffect } from "react";
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  TextField, 
  Button, 
  Divider, 
  Avatar, 
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Tabs,
  Tab,
  ListItemIcon
} from "@mui/material";
import { useJwtAuth } from "@/components/auth/JwtProvider";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { useUser } from '@/contexts/UserContext';

interface SavedPolicy {
  id: string;
  title: string;
  level: string;
  state: string;
  status: string;
}

interface SavedRepresentative {
  id: string;
  name: string;
  position: string;
  party: string;
  imageUrl: string;
}

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  savedPolicies: SavedPolicy[];
  savedRepresentatives: SavedRepresentative[];
  quizResults: {
    date: string;
    score: number;
  }[];
}

// Mock user profile data
const mockUserProfile: UserProfile = {
  firstName: "Alex",
  lastName: "Johnson",
  email: "alex.johnson@example.com",
  phone: "555-123-4567",
  address: {
    street: "123 Main St",
    city: "Anytown",
    state: "CA",
    zipCode: "12345"
  },
  notificationPreferences: {
    email: true,
    sms: false,
    push: true
  },
  savedPolicies: [
    {
      id: "1",
      title: "Clean Energy Act",
      level: "Federal",
      state: "",
      status: "Proposed"
    },
    {
      id: "3",
      title: "Healthcare Access Expansion",
      level: "Federal",
      state: "",
      status: "In Committee"
    }
  ],
  savedRepresentatives: [
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
    }
  ],
  quizResults: [
    {
      date: "2023-11-15",
      score: 72
    },
    {
      date: "2023-10-02",
      score: 68
    }
  ]
};

const states = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { user: jwtUser, isAuthenticated, isLoading: authLoading } = useJwtAuth();
  const { user: appUser, isLoading: userLoading, error: userError, createOrGetUser } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const router = useRouter();

  // Add detailed logging for debugging
  useEffect(() => {
    console.log('ProfilePage - Auth0 state:', { 
      isAuthenticated, 
      authLoading, 
      auth0User: jwtUser ? {
        sub: jwtUser.sub,
        email: jwtUser.email,
        name: jwtUser.name
      } : null 
    });
    console.log('ProfilePage - App user state:', { 
      appUser, 
      userLoading, 
      userError 
    });
  }, [isAuthenticated, authLoading, jwtUser, appUser, userLoading, userError]);

  // Effect to handle authentication and user creation
  useEffect(() => {
    if (authLoading) {
      console.log('ProfilePage - Auth0 is still loading');
      return;
    }

    if (!isAuthenticated) {
      console.log('ProfilePage - User is not authenticated');
      setLoading(false);
      return;
    }

    if (!appUser && !userLoading) {
      console.log('ProfilePage - No app user found, creating one');
      createOrGetUser().then(user => {
        console.log('ProfilePage - User created or retrieved:', user);
      }).catch(err => {
        console.error('ProfilePage - Error creating user:', err);
        setError(`Error creating user: ${err instanceof Error ? err.message : 'Unknown error'}`);
      });
    }
  }, [isAuthenticated, authLoading, appUser, userLoading, createOrGetUser]);

  // Effect to load profile data once we have an app user
  useEffect(() => {
    // In a real app, this would be an API call to get the user's profile
    // For now, we'll use mock data
    const fetchProfile = () => {
      console.log('ProfilePage - Fetching profile');
      setLoading(true);
      
      // Add a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        if (loading) {
          console.error('ProfilePage - Profile loading timeout');
          setError("Loading profile timed out. Please refresh the page.");
          setLoading(false);
        }
      }, 5000); // 5 second timeout
      
      try {
        // Simulate API call
        setTimeout(() => {
          // Use app user data to customize the mock profile
          const customizedProfile = {
            ...mockUserProfile,
            firstName: appUser?.name?.split(' ')[0] || mockUserProfile.firstName,
            lastName: appUser?.name?.split(' ')[1] || mockUserProfile.lastName,
            email: appUser?.email || mockUserProfile.email,
          };
          
          console.log('ProfilePage - Profile loaded:', customizedProfile);
          setProfile(customizedProfile);
          setEditedProfile(customizedProfile);
          setError("");
          setLoading(false);
          clearTimeout(timeoutId); // Clear the timeout if successful
        }, 1000);
      } catch (err) {
        clearTimeout(timeoutId); // Clear the timeout if there's an error
        console.error('ProfilePage - Error loading profile:', err);
        setError("Failed to load profile. Please try again later.");
        setLoading(false);
      }
    };

    if (appUser) {
      console.log('ProfilePage - App user found, fetching profile:', appUser);
      fetchProfile();
    } else if (!authLoading && !userLoading && !isAuthenticated) {
      console.log('ProfilePage - User not authenticated, not fetching profile');
      setLoading(false);
    }
  }, [appUser, authLoading, userLoading, isAuthenticated, loading]);

  // Show error if there's a user error
  useEffect(() => {
    if (userError) {
      console.error('ProfilePage - User error:', userError);
      setError(`Error loading user: ${userError}`);
    }
  }, [userError]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Handle nested properties
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setEditedProfile(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      }));
    } else {
      setEditedProfile(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    
    // Handle nested properties
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setEditedProfile(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      }));
    } else {
      setEditedProfile(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSaveProfile = () => {
    setLoading(true);
    
    // In a real app, this would be an API call to update the user's profile
    // For now, we'll simulate it
    try {
      // Simulate API call
      setTimeout(() => {
        setProfile(editedProfile as UserProfile);
        setIsEditing(false);
        setError("");
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError("Failed to update profile. Please try again later.");
      console.error(err);
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedProfile(profile as UserProfile);
    setIsEditing(false);
  };

  const handleRemoveSavedPolicy = (id: string) => {
    if (!profile) return;
    
    const updatedPolicies = profile.savedPolicies.filter(policy => policy.id !== id);
    setProfile({
      ...profile,
      savedPolicies: updatedPolicies
    });
  };

  const handleRemoveSavedRepresentative = (id: string) => {
    if (!profile) return;
    
    const updatedRepresentatives = profile.savedRepresentatives.filter(rep => rep.id !== id);
    setProfile({
      ...profile,
      savedRepresentatives: updatedRepresentatives
    });
  };

  const getPartyColor = (party: string) => {
    switch (party) {
      case "Democratic":
        return "primary";
      case "Republican":
        return "error";
      case "Independent":
        return "success";
      default:
        return "default";
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleUpdateLocation = () => {
    // In a real app, this would open a dialog to update location
    console.log('Update location');
  };

  // Update the login button to force re-authentication
  const handleForceLogin = () => {
    router.push('/login');
  };

  if (authLoading || loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!isAuthenticated && !authLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Please log in to view your profile
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          You need to be logged in to access your profile. Please click the button below to log in.
        </Typography>
        <Button 
          variant="contained" 
          size="large" 
          onClick={handleForceLogin}
          sx={{ mt: 2 }}
        >
          Log In
        </Button>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          {error}
        </Alert>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">
          Profile not found. Please try again later.
        </Alert>
      </Container>
    );
  }

  return (
    <div className="page-container">
      <Navbar />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar 
                src={jwtUser?.picture} 
                alt={jwtUser?.name || 'User'} 
                sx={{ width: 120, height: 120, mb: 2 }}
              />
              <Typography variant="h5" gutterBottom>
                {jwtUser?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <EmailIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                {jwtUser?.email}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationOnIcon fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {profile.address.city}, {profile.address.state}
                </Typography>
              </Box>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={handleUpdateLocation}
                sx={{ mb: 2 }}
              >
                Update Location
              </Button>
            </Grid>
            
            <Grid item xs={12} md={9}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
                  <Tab label="Saved Items" />
                  <Tab label="Notifications" />
                  <Tab label="Settings" />
                </Tabs>
              </Box>
              
              <TabPanel value={tabValue} index={0}>
                <Typography variant="h6" gutterBottom>
                  Saved Policies
                </Typography>
                <List>
                  {profile.savedPolicies.map((policy) => (
                    <ListItem 
                      key={policy.id}
                      button
                      onClick={() => router.push(`/policies/${policy.id}`)}
                    >
                      <ListItemIcon>
                        <BookmarkIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary={policy.title} 
                        secondary={
                          <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                            <Chip label={policy.level} size="small" color="primary" variant="outlined" />
                            {policy.state && <Chip label={policy.state} size="small" color="secondary" variant="outlined" />}
                            <Chip 
                              label={policy.status} 
                              size="small" 
                              color={
                                policy.status === "Passed" || policy.status === "Implemented" 
                                  ? "success" 
                                  : policy.status === "Failed" 
                                    ? "error" 
                                    : "warning"
                              } 
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="h6" gutterBottom>
                  Saved Representatives
                </Typography>
                <List>
                  {profile.savedRepresentatives.map((rep) => (
                    <ListItem 
                      key={rep.id}
                      button
                      onClick={() => router.push(`/representatives/${rep.id}`)}
                    >
                      <ListItemIcon>
                        <BookmarkIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary={rep.name} 
                        secondary={
                          <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                            <Chip 
                              label={rep.party} 
                              size="small" 
                              color={getPartyColor(rep.party) as any}
                            />
                            <Chip label={rep.position} size="small" variant="outlined" />
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </TabPanel>
              
              <TabPanel value={tabValue} index={1}>
                <Typography variant="h6" gutterBottom>
                  Notifications
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <NotificationsIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="New policy in your area" 
                      secondary="The Clean Water Act was recently proposed in your state." 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <NotificationsIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Your representative voted" 
                      secondary="Jane Smith voted YES on the Education Funding Reform." 
                    />
                  </ListItem>
                </List>
              </TabPanel>
              
              <TabPanel value={tabValue} index={2}>
                <Typography variant="h6" gutterBottom>
                  Account Settings
                </Typography>
                <List>
                  <ListItem button>
                    <ListItemIcon>
                      <SettingsIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Notification Preferences" 
                      secondary="Manage how and when you receive notifications" 
                    />
                  </ListItem>
                  <ListItem button>
                    <ListItemIcon>
                      <SettingsIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Privacy Settings" 
                      secondary="Manage your privacy and data sharing preferences" 
                    />
                  </ListItem>
                </List>
              </TabPanel>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </div>
  );
} 