
import { register } from 'workbox-window';

if ('serviceWorker' in navigator) {
  register('/sw.js');
}
