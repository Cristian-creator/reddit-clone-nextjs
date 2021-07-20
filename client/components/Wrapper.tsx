import { Box } from '@material-ui/core';
// import * as React from 'react'

export type WrapperVariant = 'small' | 'regular'; 

interface WrapperProps {
    variant?: 'small' | 'regular'
}

export const Wrapper: React.FC<WrapperProps> =({ children, variant = 'regular' }) => {
    return (
        <Box 
        //   mt="100px" 
          marginX="auto" 
          maxWidth={variant === 'regular' ? "800px" : "400px"} 
          width="100%"
          >
              {children}
        </Box>
    ) 
}