export const twinNames = {
  drillrig1: 'Drill Rig',
  pipeline1: 'Pipeline',
  wellhead1: 'Wellhead',
  compressor1: 'Compressor',
  retail1: 'Retail Station',
  refinery1: 'Refinery',
  turbine1: 'Turbine',
  transformer1: 'Transformer',
};

export const streamMap = {
  upstream: ['drillrig1', 'wellhead1'],
  midstream: ['pipeline1', 'compressor1'],
  downstream: ['retail1', 'refinery1'],
  power: ['turbine1', 'transformer1'],
};

export const streamTitles = {
  upstream: 'Upstream',
  midstream: 'Midstream',
  downstream: 'Downstream',
  power: 'Power Generation',
};

export const streamDescriptions = {
  upstream: 'Exploration and production assets including drilling rigs and wellheads. Monitor drilling operations, well pressure, and production metrics in real-time.',
  midstream: 'Transportation and processing infrastructure including pipelines and compressors. Track flow rates, pressure levels, and transportation efficiency.',
  downstream: 'Refining and retail distribution operations. Monitor refinery processes, fuel inventory levels, and retail sales performance.',
  power: 'Generation and transmission assets including gas turbines and transformers. Track power generation, voltage levels, and electrical system health.',
};


