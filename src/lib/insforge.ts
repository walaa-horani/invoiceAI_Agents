import { createClient } from '@insforge/sdk';

export const insforge = createClient({
  baseUrl: 'https://8fxhgim5.us-east.insforge.app',
  anonKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMTI0NTV9.w9_8tPEsYp417saRMs8HD_cyeVuH69xZz12uCdD_vLI',
});
