import React from 'react';
import LeaderBoard from '../componants/LeaderBoard';
import { Flex } from '@chakra-ui/react';
import Play from '../componants/Play';

const Home = () => {
  return (
    <div style={{ position: 'relative' }}>
      <Play />
      <div style={{ position: 'absolute', top: 0, right: 0 }}>
        <LeaderBoard />
      </div>
    </div>
  );
};

export default Home;
