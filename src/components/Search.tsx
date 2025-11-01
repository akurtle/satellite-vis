import * as React from 'react';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Autocomplete from '@mui/material/Autocomplete';
import { Box, Typography } from '@mui/material';

type Positions = { name: string; lat: number; lon: number; heightKm: number; }

type Props = {
    data: Positions[];
    onSelect?: (sat:Positions)=> void;
}


export default function SearchBar({ data, onSelect }: Props) {
  return (
    <Box sx={{ width: 300 }}>
      <Autocomplete
        options={data}
        getOptionLabel={(option) => option.name}
        onChange={(_, value) => {
          if (value) onSelect?.(value); 
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search Satellite"
            variant="outlined"
            size="small"
          />
        )}
        renderOption={(props, option) => (
          <Box component="li" {...props} key={option.name}>
            <Typography fontWeight={500}>{option.name}</Typography>
            <Typography variant="body2" color="text.secondary" ml={1}>
              ({option.lat.toFixed(1)}, {option.lon.toFixed(1)})
            </Typography>
          </Box>
        )}
      />
    </Box>
  );
}

