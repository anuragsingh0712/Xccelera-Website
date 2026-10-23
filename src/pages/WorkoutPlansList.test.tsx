import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { WorkoutPlansList } from './WorkoutPlansList';

test('renders without crashing', () => {
  render(
    <MemoryRouter>
      <WorkoutPlansList />
    </MemoryRouter>,
  );
});
