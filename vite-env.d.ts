// Fixed: Removed vite/client reference that was not found
// Declaring process.env to support API_KEY access
declare const process: {
  env: {
    API_KEY: string;
    [key: string]: string | undefined;
  }
};
