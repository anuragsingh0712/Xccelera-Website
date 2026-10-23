import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TrainersList } from './TrainersList';

test('renders without crashing', () => {
  render(
    <MemoryRouter>
      <TrainersList />
    </MemoryRouter>,
  );
});
