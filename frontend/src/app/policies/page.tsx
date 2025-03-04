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
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  CircularProgress,
  Pagination,
  Alert,
  SelectChangeEvent
} from '@mui/material';
import Navbar from '@/components/layout/Navbar';
import { useJwtAuth } from '@/components/auth/JwtProvider';
import axios from 'axios';
import { useRouter } from "next/navigation";

// Mock data for initial development
const MOCK_POLICIES = [
  {
    id: '1',
    title: 'Clean Energy Act',
    description: 'Legislation to promote renewable energy sources and reduce carbon emissions.',
    simplifiedDesc: 'This law helps create more solar and wind power while reducing pollution from coal and oil.',
    status: 'passed',
    level: 'federal',
    jurisdiction: { country: 'USA', state: 'All' },
    introducedDate: '2023-05-15T00:00:00Z',
    tags: ['environment', 'energy', 'climate']
  },
  {
    id: '2',
    title: 'Education Funding Reform',
    description: 'Comprehensive reform of public education funding mechanisms at the state level.',
    simplifiedDesc: 'This changes how schools get money to make sure all students have equal resources regardless of where they live.',
    status: 'proposed',
    level: 'state',
    jurisdiction: { country: 'USA', state: 'California' },
    introducedDate: '2023-08-22T00:00:00Z',
    tags: ['education', 'budget', 'equity']
  },
  {
    id: '3',
    title: 'Public Transportation Expansion',
    description: 'Local ordinance to expand bus routes and increase service frequency in metropolitan areas.',
    simplifiedDesc: 'This adds more bus routes and makes buses come more often to help people get around the city without cars.',
    status: 'passed',
    level: 'local',
    jurisdiction: { country: 'USA', state: 'New York', city: 'New York City' },
    introducedDate: '2023-10-05T00:00:00Z',
    tags: ['transportation', 'urban', 'infrastructure']
  }
];

export default function PoliciesPage() {
  const { getAccessToken } = useJwtAuth();
  const [policies, setPolicies] = useState(MOCK_POLICIES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    level: '',
    state: '',
    status: '',
    search: ''
  });
  const router = useRouter();

  // In a real app, this would fetch from the API
  useEffect(() => {
    const fetchPolicies = async () => {
      // This is where you would fetch real data from your API
      // For now, we're using mock data
      setLoading(true);
      try {
        // Simulating API call
        // const token = await getAccessToken();
        // const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/policies`, {
        //   headers: {
        //     Authorization: `Bearer ${token}`
        //   },
        //   params: filters
        // });
        // setPolicies(response.data);
        
        // For now, just filter the mock data
        const filteredPolicies = MOCK_POLICIES.filter(policy => {
          const matchesLevel = !filters.level || policy.level === filters.level;
          const matchesState = !filters.state || policy.jurisdiction.state === filters.state;
          const matchesStatus = !filters.status || policy.status === filters.status;
          const matchesSearch = !filters.search || 
            policy.title.toLowerCase().includes(filters.search.toLowerCase()) ||
            policy.description.toLowerCase().includes(filters.search.toLowerCase());
          
          return matchesLevel && matchesState && matchesStatus && matchesSearch;
        });
        
        // Simulate API delay
        setTimeout(() => {
          setPolicies(filteredPolicies);
          setTotalPages(Math.ceil(filteredPolicies.length / 10));
          setLoading(false);
        }, 500);
      } catch (err) {
        console.error('Error fetching policies:', err);
        setError('Failed to fetch policies. Please try again later.');
        setLoading(false);
      }
    };

    fetchPolicies();
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

  const handleViewPolicy = (id: string) => {
    router.push(`/policies/${id}`);
  };

  return (
    <div className="page-container">
      <Navbar />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Government Policies
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Browse and search for policies at the federal, state, and local levels.
        </Typography>

        {/* Filters */}
        <Box sx={{ mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
          <Typography variant="h6" gutterBottom>
            Filter Policies
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
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  name="status"
                  value={filters.status}
                  onChange={handleSelectChange}
                  label="Status"
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="proposed">Proposed</MenuItem>
                  <MenuItem value="passed">Passed</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
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

        {/* Error message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Loading indicator */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Policies grid */}
            {policies.length > 0 ? (
              <Grid container spacing={3}>
                {policies
                  .slice((page - 1) * 10, page * 10)
                  .map((policy) => (
                    <Grid item xs={12} key={policy.id}>
                      <Card>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="h5" component="h2">
                              {policy.title}
                            </Typography>
                            <Chip 
                              label={policy.status.charAt(0).toUpperCase() + policy.status.slice(1)} 
                              color={policy.status === 'passed' ? 'success' : policy.status === 'proposed' ? 'primary' : 'error'} 
                              size="small" 
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {policy.description}
                          </Typography>
                          <Typography variant="body1" paragraph>
                            <strong>Simplified Explanation:</strong> {policy.simplifiedDesc}
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                            {policy.tags.map((tag) => (
                              <Chip key={tag} label={tag} size="small" />
                            ))}
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Level: {policy.level.charAt(0).toUpperCase() + policy.level.slice(1)} | 
                            Jurisdiction: {policy.jurisdiction.state}{policy.jurisdiction.city ? `, ${policy.jurisdiction.city}` : ''} | 
                            Introduced: {new Date(policy.introducedDate).toLocaleDateString()}
                          </Typography>
                        </CardContent>
                        <CardActions>
                          <Button size="small" color="primary" onClick={() => handleViewPolicy(policy.id)}>
                            View Details
                          </Button>
                          <Button size="small">
                            View Voting Record
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6">
                  No policies found matching your filters.
                </Typography>
                <Button 
                  variant="outlined" 
                  sx={{ mt: 2 }}
                  onClick={() => setFilters({ level: '', state: '', status: '', search: '' })}
                >
                  Clear Filters
                </Button>
              </Box>
            )}

            {/* Pagination */}
            {policies.length > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination 
                  count={totalPages} 
                  page={page} 
                  onChange={handlePageChange} 
                  color="primary" 
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </div>
  );
} 