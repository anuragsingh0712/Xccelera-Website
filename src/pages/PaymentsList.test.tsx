import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PaymentsList } from './PaymentsList';

test('renders without crashing', () => {
  render(
    <MemoryRouter>
      <PaymentsList />
    </MemoryRouter>,
  );
});
