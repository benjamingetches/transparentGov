'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Button,
  Avatar,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Pagination,
  Alert,
  SelectChangeEvent
} from '@mui/material';
import Navbar from '@/components/layout/Navbar';
import { useJwtAuth } from '@/components/auth/JwtProvider';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LanguageIcon from '@mui/icons-material/Language';
import TwitterIcon from '@mui/icons-material/Twitter';
import FacebookIcon from '@mui/icons-material/Facebook';
import { useRouter } from 'next/navigation';

// Mock data for initial development
const MOCK_REPRESENTATIVES = [
  {
    id: '1',
    name: 'Jane Smith',
    title: 'Senator',
    party: 'Democratic',
    state: 'California',
    level: 'federal',
    termStart: '2021-01-03T00:00:00Z',
    termEnd: '2027-01-03T00:00:00Z',
    biography: 'Jane Smith has served as a Senator since 2021. She previously served as a State Representative and has a background in environmental law.',
    photoURL: 'https://placehold.co/150',
    contactInfo: {
      email: 'jane.smith@senate.gov',
      phone: '(202) 555-0123',
      website: 'https://smith.senate.gov',
      officeAddress: '123 Senate Office Building, Washington DC 20510'
    },
    socialMedia: {
      twitter: '@SenJaneSmith',
      facebook: 'SenatorJaneSmith'
    },
    committees: [
      { name: 'Environment and Public Works', position: 'Chair' },
      { name: 'Budget', position: 'Member' }
    ],
    politicalStances: [
      { issue: 'Climate Change', stance: 5, description: 'Strongly supports climate action' },
      { issue: 'Healthcare', stance: 4, description: 'Supports universal healthcare' },
      { issue: 'Immigration', stance: 3, description: 'Moderate stance on immigration reform' }
    ]
  },
  {
    id: '2',
    name: 'John Doe',
    title: 'Representative',
    party: 'Republican',
    state: 'Texas',
    district: '5',
    level: 'federal',
    termStart: '2023-01-03T00:00:00Z',
    termEnd: '2025-01-03T00:00:00Z',
    biography: 'John Doe was elected to the House of Representatives in 2022. He has a background in business and served in the military.',
    photoURL: 'https://placehold.co/150',
    contactInfo: {
      email: 'john.doe@house.gov',
      phone: '(202) 555-0456',
      website: 'https://doe.house.gov',
      officeAddress: '456 House Office Building, Washington DC 20515'
    },
    socialMedia: {
      twitter: '@RepJohnDoe',
      facebook: 'RepresentativeJohnDoe'
    },
    committees: [
      { name: 'Armed Services', position: 'Member' },
      { name: 'Small Business', position: 'Member' }
    ],
    politicalStances: [
      { issue: 'Taxes', stance: 1, description: 'Strongly supports tax cuts' },
      { issue: 'Defense', stance: 5, description: 'Strongly supports military funding' },
      { issue: 'Healthcare', stance: 2, description: 'Opposes government healthcare programs' }
    ]
  },
  {
    id: '3',
    name: 'Maria Rodriguez',
    title: 'Governor',
    party: 'Independent',
    state: 'New York',
    level: 'state',
    termStart: '2022-01-01T00:00:00Z',
    termEnd: '2026-01-01T00:00:00Z',
    biography: 'Maria Rodriguez was elected Governor in 2021. She previously served as Mayor of a major city and has a background in public administration.',
    photoURL: 'https://placehold.co/150',
    contactInfo: {
      email: 'governor@ny.gov',
      phone: '(518) 555-0789',
      website: 'https://governor.ny.gov',
      officeAddress: 'State Capitol, Albany, NY 12224'
    },
    socialMedia: {
      twitter: '@GovRodriguez',
      facebook: 'GovernorRodriguez'
    },
    committees: [],
    politicalStances: [
      { issue: 'Education', stance: 4, description: 'Strongly supports education funding' },
      { issue: 'Infrastructure', stance: 5, description: 'Prioritizes infrastructure investment' },
      { issue: 'Budget', stance: 3, description: 'Moderate approach to state budget' }
    ]
  }
];

export default function RepresentativesPage() {
  const { isAuthenticated } = useJwtAuth();
  const router = useRouter();
  const [representatives, setRepresentatives] = useState(MOCK_REPRESENTATIVES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    level: '',
    state: '',
    party: '',
    search: ''
  });

  // In a real app, this would fetch from the API
  useEffect(() => {
    const fetchRepresentatives = async () => {
      setLoading(true);
      try {
        // For now, just filter the mock data
        const filteredReps = MOCK_REPRESENTATIVES.filter(rep => {
          const matchesLevel = !filters.level || rep.level === filters.level;
          const matchesState = !filters.state || rep.state === filters.state;
          const matchesParty = !filters.party || rep.party === filters.party;
          const matchesSearch = !filters.search || 
            rep.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            rep.title.toLowerCase().includes(filters.search.toLowerCase());
          
          return matchesLevel && matchesState && matchesParty && matchesSearch;
        });
        
        // Simulate API delay
        setTimeout(() => {
          setRepresentatives(filteredReps);
          setTotalPages(Math.ceil(filteredReps.length / 10));
          setLoading(false);
        }, 500);
      } catch (err) {
        console.error('Error fetching representatives:', err);
        setError('Failed to fetch representatives. Please try again later.');
        setLoading(false);
      }
    };

    fetchRepresentatives();
  }, [filters]);

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name as string]: value
    }));
    setPage(1);
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name as string]: value
    }));
    setPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleViewRepresentative = (id: string) => {
    router.push(`/representatives/${id}`);
  };

  const getPartyColor = (party: string) => {
    switch (party.toLowerCase()) {
      case 'democratic':
        return '#2196f3'; // Blue
      case 'republican':
        return '#f44336'; // Red
      case 'independent':
        return '#4caf50'; // Green
      default:
        return '#9e9e9e'; // Grey
    }
  };

  return (
    <div className="page-container">
      <Navbar />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Government Representatives
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Find and learn about your elected officials at the federal, state, and local levels.
        </Typography>

        {/* Filters */}
        <Box sx={{ mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
          <Typography variant="h6" gutterBottom>
            Filter Representatives
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel id="level-label">Level</InputLabel>
                <Select
                  labelId="level-label"
                  name="level"
                  value={filters.level}
                  onChange={handleSelectChange}
                  label="Level"
                >
                  <MenuItem value="">All Levels</MenuItem>
                  <MenuItem value="federal">Federal</MenuItem>
                  <MenuItem value="state">State</MenuItem>
                  <MenuItem value="local">Local</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel id="state-label">State</InputLabel>
                <Select
                  labelId="state-label"
                  name="state"
                  value={filters.state}
                  onChange={handleSelectChange}
                  label="State"
                >
                  <MenuItem value="">All States</MenuItem>
                  <MenuItem value="California">California</MenuItem>
                  <MenuItem value="New York">New York</MenuItem>
                  <MenuItem value="Texas">Texas</MenuItem>
                  {/* Add more states as needed */}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel id="party-label">Party</InputLabel>
                <Select
                  labelId="party-label"
                  name="party"
                  value={filters.party}
                  onChange={handleSelectChange}
                  label="Party"
                >
                  <MenuItem value="">All Parties</MenuItem>
                  <MenuItem value="Democratic">Democratic</MenuItem>
                  <MenuItem value="Republican">Republican</MenuItem>
                  <MenuItem value="Independent">Independent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                name="search"
                label="Search"
                variant="outlined"
                size="small"
                value={filters.search}
                onChange={handleFilterChange}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Loading indicator */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Representatives grid */}
            {representatives.length > 0 ? (
              <>
                <Grid container spacing={3}>
                  {representatives
                    .slice((page - 1) * 10, page * 10)
                    .map((rep) => (
                      <Grid item xs={12} md={6} key={rep.id}>
                        <Card sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, height: '100%' }}>
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            p: 2, 
                            bgcolor: 'background.paper',
                            borderRight: { sm: 1 },
                            borderBottom: { xs: 1, sm: 0 },
                            borderColor: 'divider',
                            width: { xs: '100%', sm: '30%' }
                          }}>
                            <Avatar 
                              src={rep.photoURL} 
                              alt={rep.name}
                              sx={{ width: 120, height: 120, mb: 2 }}
                            />
                            <Typography variant="h6" align="center" gutterBottom>
                              {rep.name}
                            </Typography>
                            <Typography variant="body2" align="center" gutterBottom>
                              {rep.title}
                              {rep.district && ` - District ${rep.district}`}
                            </Typography>
                            <Chip 
                              label={rep.party} 
                              sx={{ 
                                bgcolor: getPartyColor(rep.party),
                                color: 'white',
                                fontWeight: 'bold',
                                mb: 1
                              }} 
                            />
                            <Typography variant="body2" align="center">
                              {rep.state}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            p: 2,
                            width: { xs: '100%', sm: '70%' }
                          }}>
                            <Typography variant="body2" paragraph>
                              {rep.biography}
                            </Typography>
                            
                            <Typography variant="subtitle2" gutterBottom>
                              Contact Information
                            </Typography>
                            <List dense>
                              {rep.contactInfo.email && (
                                <ListItem disablePadding>
                                  <ListItemIcon sx={{ minWidth: 36 }}>
                                    <EmailIcon fontSize="small" />
                                  </ListItemIcon>
                                  <ListItemText primary={rep.contactInfo.email} />
                                </ListItem>
                              )}
                              {rep.contactInfo.phone && (
                                <ListItem disablePadding>
                                  <ListItemIcon sx={{ minWidth: 36 }}>
                                    <PhoneIcon fontSize="small" />
                                  </ListItemIcon>
                                  <ListItemText primary={rep.contactInfo.phone} />
                                </ListItem>
                              )}
                              {rep.contactInfo.website && (
                                <ListItem disablePadding>
                                  <ListItemIcon sx={{ minWidth: 36 }}>
                                    <LanguageIcon fontSize="small" />
                                  </ListItemIcon>
                                  <ListItemText primary={rep.contactInfo.website} />
                                </ListItem>
                              )}
                            </List>
                            
                            {rep.committees.length > 0 && (
                              <>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="subtitle2" gutterBottom>
                                  Committees
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                                  {rep.committees.map((committee, index) => (
                                    <Chip 
                                      key={index} 
                                      label={`${committee.name} (${committee.position})`} 
                                      size="small" 
                                      variant="outlined"
                                    />
                                  ))}
                                </Box>
                              </>
                            )}
                            
                            <Box sx={{ mt: 'auto' }}>
                              <CardActions>
                                <Button size="small" color="primary" onClick={() => handleViewRepresentative(rep.id)}>
                                  View Profile
                                </Button>
                                <Button size="small">
                                  Voting Record
                                </Button>
                              </CardActions>
                            </Box>
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                </Grid>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination 
                    count={totalPages} 
                    page={page} 
                    onChange={handlePageChange} 
                    color="primary" 
                  />
                </Box>
              </>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6">
                  No representatives found matching your filters.
                </Typography>
                <Button 
                  variant="outlined" 
                  sx={{ mt: 2 }}
                  onClick={() => setFilters({ level: '', state: '', party: '', search: '' })}
                >
                  Clear Filters
                </Button>
              </Box>
            )}
          </>
        )}
      </Container>
    </div>
  );
} 