import React from 'react';
import { createRoot } from 'react-dom/client';

// Load the ThemeBuilder output (Fluent 2 base + overrides)
import 'mcpx-kendobridge/dist/scss/index.scss';

import App from './App';

createRoot(document.getElementById('root')!).render(<App />);
