import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const customConfig = defineConfig({
  theme: {
    tokens: {
      colors: {
        smblue: { value: '#0030FF' },
      },
    },
  },
});

export const system = createSystem(defaultConfig, customConfig);
