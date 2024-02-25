import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Thead, Tbody, Tr, Th, Td, Flex, Heading, Image, Icon, useColorMode } from '@chakra-ui/react';
import { AiOutlineCrown } from 'react-icons/ai';
import crown from '../assets/crown.jpg'

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const { colorMode } = useColorMode();

  useEffect(() => {
    fetchLeaderboard();

    const intervalId = setInterval(fetchLeaderboard, 4000);

    return () => clearInterval(intervalId);
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get('http://localhost:3000/leaderboard');
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Flex justify="center" align="center" mb={6}>
        <Heading color={colorMode === 'light' ? 'blue.500' : 'gray.500'} mr={4}>Leaderboard</Heading>
        <Image src={crown} alt="Crown" w={8} h={8} />
      </Flex>
      <Table variant="striped" colorScheme={colorMode === 'light' ? 'blue' : 'gray'} style={{ width: '100%', borderCollapse: 'collapse' }}>
        <Thead>
          <Tr>
            <Th>Rank</Th>
            <Th>Username</Th>
            <Th>Points</Th>
          </Tr>
        </Thead>
        <Tbody>
          {leaderboard.map((entry, index) => (
            <Tr key={index} bg={index % 2 === 0 ? colorMode === 'light' ? 'blue.50' : 'gray.50' : 'gray.50'}>
              <Td>
                {index === 0 && <Icon as={AiOutlineCrown} color="yellow.500" />}
                {index + 1}
              </Td>
              <Td>{entry.username}</Td>
              <Td>{entry.score}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </div>
  );
};

export default Leaderboard;
