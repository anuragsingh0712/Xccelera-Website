import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AttendanceTracking } from './AttendanceTracking';

test('renders without crashing', () => {
  render(
    <MemoryRouter>
      <AttendanceTracking />
    </MemoryRouter>,
  );
});
