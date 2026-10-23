import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MemberPortal } from './MemberPortal';

test('renders without crashing', () => {
  render(
    <MemoryRouter>
      <MemberPortal />
    </MemoryRouter>,
  );
});
