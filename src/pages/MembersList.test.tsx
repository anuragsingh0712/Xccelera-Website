import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MembersList } from './MembersList';

test('renders without crashing', () => {
  render(
    <MemoryRouter>
      <MembersList />
    </MemoryRouter>,
  );
});
