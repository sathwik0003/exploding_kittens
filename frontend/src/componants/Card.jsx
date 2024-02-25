import React from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';

const Card = () => {
  return (
    <Box
      bg="white"
      borderRadius="md"
      boxShadow="md"
      p={4}
      w="150px"
      h="200px"
      m={4}
      marginTop="23vw"
      textAlign="center"
    >
      <Flex justify="center" align="center" h="100%">
        <Text fontWeight="bold">Card</Text>
      </Flex>
    </Box>
  );
};

export default Card;
