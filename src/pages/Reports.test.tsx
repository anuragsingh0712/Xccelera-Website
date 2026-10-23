import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Reports } from './Reports';

test('renders without crashing', () => {
  render(
    <MemoryRouter>
      <Reports />
    </MemoryRouter>,
  );
});
