import { RouterProvider } from 'react-router';
import { router } from './routes';
import { UserProvider } from './context/UserContext';
import { SimulationProvider } from './context/SimulationContext';

export default function App() {
  return (
    <UserProvider>
      <SimulationProvider>
        <RouterProvider router={router} />
      </SimulationProvider>
    </UserProvider>
  );
}