import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Dashboard } from './Dashboard';

test('renders without crashing', () => {
  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>,
  );
});
