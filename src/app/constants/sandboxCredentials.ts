export interface SandboxCredentials {
  merchantId: string;
  apiKey: string;
  rsaPublicKey: string;
}

export const SANDBOX_CREDENTIALS: SandboxCredentials = {
  merchantId: 'testingsandbox',
  apiKey: '61deae82-e801-453d-a536-88ffd0ed1892',
  rsaPublicKey: `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC8Ihqf041nltcKP/YN5FWez8I/
vwWuBrEzsT+0xi1Rl+/b7eMJIblu0Ivy6Gx83XlH5n6Sr6DBSldB+EPE3kTY+Fsg
dMH80WVN2wVa25wn0WK9G5p3g/0QE0ECWMS5Ce1bNoFkW5ooUOJKUHKx1uacSVTp
OPu7OYfzKBObYYh3xwIDAQAB
-----END PUBLIC KEY-----`,
};
