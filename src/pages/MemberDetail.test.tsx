import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { MemberDetail } from './MemberDetail';

test('renders new member form without crashing', () => {
  render(
    <MemoryRouter initialEntries={['/members/new']}>
      <Routes>
        <Route path="/members/:id" element={<MemberDetail />} />
      </Routes>
    </MemoryRouter>,
  );
});
