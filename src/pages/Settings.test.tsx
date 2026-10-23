import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Settings } from './Settings';

test('renders without crashing', () => {
  render(
    <MemoryRouter>
      <Settings />
    </MemoryRouter>,
  );
});
