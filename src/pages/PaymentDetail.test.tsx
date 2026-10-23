import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PaymentDetail } from './PaymentDetail';

test('renders new payment form without crashing', () => {
  render(
    <MemoryRouter initialEntries={['/payments/new']}>
      <Routes>
        <Route path="/payments/:id" element={<PaymentDetail />} />
      </Routes>
    </MemoryRouter>,
  );
});
