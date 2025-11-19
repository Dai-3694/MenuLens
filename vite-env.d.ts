// Fix for "Cannot find type definition file for 'vite/client'"
// /// <reference types="vite/client" />

declare var process: {
  env: {
    API_KEY: string;
    [key: string]: string | undefined;
  }
};