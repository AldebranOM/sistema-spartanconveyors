import React from 'react';
import { Typography, Box } from '@mui/material';

const Test = () => {
  return (
    <Box>
      <Typography variant="h4" color="primary">
        ¡Página de prueba!
      </Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        Si ves esto, la navegación está funcionando correctamente.
      </Typography>
    </Box>
  );
};

export default Test;