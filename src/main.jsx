import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const isDev = import.meta.env.DEV;
const isCoordsRoute = isDev && typeof window !== 'undefined' && window.location.pathname === '/coords';

async function bootstrap() {
  let RootComponent = App;
  if (isCoordsRoute) {
    const mod = await import('./dev/CoordPicker.jsx');
    RootComponent = mod.default;
  }
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <RootComponent />
    </StrictMode>,
  );
}

bootstrap();
