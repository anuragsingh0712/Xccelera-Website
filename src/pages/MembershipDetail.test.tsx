import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { MembershipDetail } from './MembershipDetail';

test('renders new membership form without crashing', () => {
  render(
    <MemoryRouter initialEntries={['/memberships/new']}>
      <Routes>
        <Route path="/memberships/:id" element={<MembershipDetail />} />
      </Routes>
    </MemoryRouter>,
  );
});
