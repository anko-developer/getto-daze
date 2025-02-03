import MessengerCont from '@/components/messenger/MessengerCont';
import MessengerHeader from '@/components/messenger/MessengerHeader';
import { memo } from 'react';

export default memo(function Messenger() {
  return (
    <>
      <MessengerHeader />
      <MessengerCont />
    </>
  );
});
