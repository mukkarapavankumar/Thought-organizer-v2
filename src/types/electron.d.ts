export interface ElectronAPI {
  getAppPath: () => Promise<string>;
  getUserDataPath: () => Promise<string>;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
} 