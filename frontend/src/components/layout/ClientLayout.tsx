'use client';

import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { JwtProviderWithNavigate } from '@/components/auth/JwtProvider';
import { UserProvider } from '@/contexts/UserContext';
import { theme } from '@/theme';
import Navbar from './Navbar';
import Footer from './Footer';
import { Box } from '@mui/material';

interface ClientLayoutProps {
  children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <JwtProviderWithNavigate>
        <UserProvider>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: '100vh',
            }}
          >
            <Navbar />
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                width: '100%',
              }}
            >
              {children}
            </Box>
            <Footer />
          </Box>
        </UserProvider>
      </JwtProviderWithNavigate>
    </ThemeProvider>
  );
};

export default ClientLayout;