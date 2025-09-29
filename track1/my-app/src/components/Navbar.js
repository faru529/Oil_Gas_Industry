import React from 'react';
import { AppBar, Toolbar, Typography, Button, Menu, MenuItem, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useNavigate } from 'react-router-dom';
import { streamMap, twinNames } from './twinMeta';

function Navbar() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }} component={Link} to="/dashboard" style={{ color: 'inherit', textDecoration: 'none' }}>
          Digital Twin Dashboard
        </Typography>
        <Button color="inherit" component={Link} to="/dashboard">Dashboard</Button>
        <Button color="inherit" component={Link} to="/alerts">Alerts</Button>
        <IconButton color="inherit" onClick={handleOpen} sx={{ ml: 1 }}>
          <MenuIcon />
        </IconButton>
        <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
          {Object.entries(streamMap).map(([stream, twins]) => (
            <div key={stream}>
              <MenuItem disabled>{stream.charAt(0).toUpperCase() + stream.slice(1)}</MenuItem>
              {twins.map(t => (
                <MenuItem key={t} onClick={() => { handleClose(); navigate(`/twin/${t}`); }}>
                  {twinNames[t] || t}
                </MenuItem>
              ))}
            </div>
          ))}
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
