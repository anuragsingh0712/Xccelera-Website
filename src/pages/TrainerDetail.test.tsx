import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { TrainerDetail } from './TrainerDetail';

test('renders new trainer form without crashing', () => {
  render(
    <MemoryRouter initialEntries={['/trainers/new']}>
      <Routes>
        <Route path="/trainers/:id" element={<TrainerDetail />} />
      </Routes>
    </MemoryRouter>,
  );
});
