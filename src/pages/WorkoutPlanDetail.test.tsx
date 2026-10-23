import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { WorkoutPlanDetail } from './WorkoutPlanDetail';

test('renders new workout plan form without crashing', () => {
  render(
    <MemoryRouter initialEntries={['/workout-plans/new']}>
      <Routes>
        <Route path="/workout-plans/:id" element={<WorkoutPlanDetail />} />
      </Routes>
    </MemoryRouter>,
  );
});
