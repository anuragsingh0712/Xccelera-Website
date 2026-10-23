import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TrainerPortal } from './TrainerPortal';

test('renders without crashing', () => {
  render(
    <MemoryRouter>
      <TrainerPortal />
    </MemoryRouter>,
  );
});
