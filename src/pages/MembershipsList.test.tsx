import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MembershipsList } from './MembershipsList';

test('renders without crashing', () => {
  render(
    <MemoryRouter>
      <MembershipsList />
    </MemoryRouter>,
  );
});
