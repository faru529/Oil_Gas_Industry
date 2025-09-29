import React from 'react';
import { Construction, Water, DeviceHub, Compress, LocalGasStation, Factory, WindPower, FlashOn } from '@mui/icons-material';

function TwinIcons({ twin }) {
  const iconMap = {
    drillrig1: <Construction fontSize="small" />,
    pipeline1: <Water fontSize="small" />,
    wellhead1: <DeviceHub fontSize="small" />,
    compressor1: <Compress fontSize="small" />,
    retail1: <LocalGasStation fontSize="small" />,
    refinery1: <Factory fontSize="small" />,
    turbine1: <WindPower fontSize="small" />,
    transformer1: <FlashOn fontSize="small" />,
  };

  return iconMap[twin] || null;
}

export default TwinIcons;
