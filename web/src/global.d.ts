declare global {
  interface Window {
    __MSAL__?: { instance: any; accounts: any[] };
    __MSAL_SCOPE__?: string;
  }
}
export {};
