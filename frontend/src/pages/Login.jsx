import React, { useState } from 'react';
import { Box, Flex, Text, Input, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton } from '@chakra-ui/react';
import background from '../assets/background.jpg'; 
import axios from 'axios';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isLoginSuccess, setIsLoginSuccess] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registrationError, setRegistrationError] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:3000/login', { username, password });
      if (response.status === 200) {
        setIsLoginSuccess(true);
        window.location.href = `/Home/${username}`;
      } else {
        setLoginError('Incorrect username or password');
        setIsModalOpen(true);
      }
    } catch (error) {
      setIsModalOpen(true);
    }
  };

  const handleRegister = async () => {
    try {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        setRegistrationError('Invalid email format');
        return;
      }

      const response = await axios.get('http://localhost:3000/users');
      const existingUsers = response.data.map(user => user.username);
      if (existingUsers.includes(username)) {
        setRegistrationError('Username already exists');
        return;
      }

      const registrationResponse = await axios.post('http://localhost:3000/user', { username, password, email });
      if (registrationResponse.status === 200) {
        setIsLoginSuccess(true);
        window.location.href = `/Home/${username}`;
      } else {
        setIsModalOpen(true);
      }
    } catch (error) {
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsRegisterModalOpen(false);
    setRegistrationError('');
    setLoginError('');
  };

  const handleRetryLogin = () => {
    setIsModalOpen(false);
    setUsername('');
    setPassword('');
    setLoginError('');
  };

  return (
    <Box
      bgImage={`url(${background})`}
      bgSize="cover"
      bgPosition="center"
      bgRepeat="no-repeat"
      h="100vh"
    >
      <Flex justify="center" align="center" h="100%">
        <Box
          bg="white"
          borderRadius="md"
          boxShadow="md"
          p={6}
          w="300px"
        >
          <Text fontSize="2xl" textAlign="center" mb={4}>Login</Text>
          <Input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            mb={4}
            isInvalid={!!loginError}
            errorBorderColor="crimson"
          />
          <Text color="crimson" fontSize="sm" mb={2}>{loginError}</Text>
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            mb={4}
            isInvalid={!!loginError}
            errorBorderColor="crimson"
          />
          <Button colorScheme="blue" onClick={handleLogin} w="100%">Login</Button>
          <Button colorScheme="teal" onClick={() => setIsRegisterModalOpen(true)} mt={4} w="100%">Register</Button>
        </Box>
      </Flex>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Login Failed</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="lg" mb={4}>{loginError || 'An error occurred. Please try again.'}</Text>
            <Button colorScheme="blue" onClick={handleRetryLogin} w="100%">Retry</Button>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={handleCloseModal}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isRegisterModalOpen} onClose={handleCloseModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Register</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              mb={4}
              isInvalid={!!registrationError}
              errorBorderColor="crimson"
            />
            <Text color="crimson" fontSize="sm" mb={2}>{registrationError}</Text>
            <Input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              mb={4}
            />
            <Input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              mb={4}
            />
            <Button colorScheme="blue" onClick={handleRegister} w="100%">Register</Button>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={handleCloseModal}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {isLoginSuccess && (
        <Box
          position="fixed"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          textAlign="center"
        >
          <Text fontSize="xl">Login successful!</Text>
        </Box>
      )}
    </Box>
  );
};

export default Login;
