import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Paper,
} from "@mui/material";

type Satellite = {
  name: string;
  lat: number;
  lon: number;
  heightKm: number;
  country?: string;
  active?: boolean;
};

type Props = {
  data: Satellite[];
  onFilterChange?: (filtered: Satellite[]) => void;
};

export default function SatelliteFilters({ data, onFilterChange }: Props) {
  const [search, setSearch] = useState("");
  const [altitude, setAltitude] = useState<number[]>([0, 2000]);
  const [country, setCountry] = useState<string>("All");
  const [showActiveOnly, setShowActiveOnly] = useState(false);

    
  const countries = Array.from(new Set(data.map((d) => d.country).filter(Boolean)));

  useEffect(() => {
    const filtered = data.filter((sat) => {
      const matchName = sat.name.toLowerCase().includes(search.toLowerCase());
      const matchAlt = sat.heightKm >= altitude[0] && sat.heightKm <= altitude[1];
    //   const matchCountry = country === "All" || sat.country === country;
    //   const matchActive = !showActiveOnly || sat.active;
      return matchName && matchAlt ;
    });
    onFilterChange?.(filtered);
  }, [search, altitude, country, showActiveOnly, data]);

  return (
    <Paper sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2, width: 320 }}>
      <Typography variant="h6">Filters</Typography>

      {/* Name search */}
      <TextField
        label="Search by name"
        variant="outlined"
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        fullWidth
      />

      {/* Altitude range */}
      <Box>
        <Typography gutterBottom>Altitude range (km)</Typography>
        <Slider
          value={altitude}
          onChange={(_, newValue) => setAltitude(newValue as number[])}
          valueLabelDisplay="auto"
          min={0}
          max={2000}
          step={50}
        />
      </Box>

      {/* Country dropdown */}
      <FormControl fullWidth size="small">
        <InputLabel>Country</InputLabel>
        <Select value={country} onChange={(e) => setCountry(e.target.value)}>
          <MenuItem value="All">All</MenuItem>
          {countries.map((c, i) => (
            <MenuItem key={i} value={c!}>
              {c}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Active checkbox */}
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={showActiveOnly}
              onChange={(e) => setShowActiveOnly(e.target.checked)}
            />
          }
          label="Active satellites only"
        />
      </FormGroup>
    </Paper>
  );
}
