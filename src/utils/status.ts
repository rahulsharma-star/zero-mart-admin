export function statusColor(status: string): string {
  switch (status) {
    case 'delivered':
      return 'green';
    case 'cancelled':
    case 'failed_delivery':
      return 'red';
    case 'out_for_delivery':
      return 'geekblue';
    case 'picked_up':
      return 'cyan';
    case 'assigned':
      return 'purple';
    case 'ready_for_pickup':
      return 'gold';
    case 'preparing':
      return 'lime';
    case 'confirmed':
      return 'blue';
    case 'rescheduled':
      return 'volcano';
    default:
      return 'orange'; // placed
  }
}

export const ORDER_STATUSES = [
  'placed',
  'confirmed',
  'preparing',
  'ready_for_pickup',
  'assigned',
  'picked_up',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'failed_delivery',
  'rescheduled',
];
