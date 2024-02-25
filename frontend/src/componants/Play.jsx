import React, { useState, useEffect } from 'react';
import { Box, Flex, Text, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@chakra-ui/react';
import background from '../assets/background.jpg'; 
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Play = () => {
  const { username } = useParams();
  const initialDeck = ['😼', '🙅‍♂️', '🔀', '💣', '😼']; // Initial deck of 5 cards
  const [deck, setDeck] = useState(initialDeck);
  const [remainingCards, setRemainingCards] = useState(5);
  const [defuseCount, setDefuseCount] = useState(0); // Initial defuse card count
  const [revealedCard, setRevealedCard] = useState(null); // State to track revealed card
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [shufflePending, setShufflePending] = useState(false); // Flag to track if shuffle animation is pending
  const [isModalOpen, setIsModalOpen] = useState(false);

  const drawCard = () => {
    if (remainingCards > 0) {
      let probabilities = ['😼', '🙅‍♂️', '💣', '😼']; 
      if (remainingCards > 1) probabilities.push('🔀'); 
      const randomIndex = Math.floor(Math.random() * probabilities.length);
      const drawnCard = probabilities[randomIndex];
      const updatedDeck = deck.filter((_, index) => index !== randomIndex); // Remove drawn card from deck
      return { drawnCard, updatedDeck };
    }
    return null; 
  };

  const handleCardClick = () => {
    if (remainingCards > 0 && !gameOver && !shufflePending) {
      const { drawnCard, updatedDeck } = drawCard();
      if (drawnCard) {
        setDeck(updatedDeck);
        setRemainingCards(remainingCards - 1);
        setRevealedCard(drawnCard);

        setTimeout(() => {
          setRevealedCard(null);
          if (drawnCard === '💣') {
            if (defuseCount > 0) {
              toast.success('Bomb defused!');
              setDefuseCount(defuseCount - 1);
            } else {
              toast.error('Bomb exploded! You lost.');
              setGameOver(true);
            }
          } else if (drawnCard === '🔀') {
            toast.info('Deck shuffled!');
            shuffleDeck(); 
          } else if (drawnCard === '🙅‍♂️') {
            setDefuseCount(defuseCount + 1);
            toast.success(`Defuse card obtained! Defuse count: ${defuseCount + 1}`);
          }
        }, 1000);
      }
    }
  };

  const shuffleDeck = () => {
    setShufflePending(true); 
    setTimeout(() => {
      setDeck(initialDeck);
      setRemainingCards(5);
      setShufflePending(false); 
    }, 200); 
  };

  useEffect(() => {
   if(!gameOver){
    if (remainingCards === 0 && !shufflePending) {
        setTimeout(() => {
          setGameWon(true);
          handleModalOpen(); 
        }, 1000);
      }
   }
  }, [remainingCards, gameOver, shufflePending]);

  const handleRestart = () => {
    setDeck(initialDeck);
    setRemainingCards(5);
    setDefuseCount(0);
    setRevealedCard(null);
    setGameOver(false);
    setGameWon(false);
    handleModalClose();
  };

  const increaseScore = async () => {
    try {
      const response = await axios.post(`http://localhost:3000/won/${username}`);
    } catch (error) {
      console.log(error)
    }
  }

  if (gameWon === true) {
    increaseScore();
  }

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <Box
      bgImage={`url(${background})`} 
      bgSize="cover"
      bgPosition="center"
      bgRepeat="no-repeat"
      h="100vh"
    >
     
      {!username && (
        <Box position="absolute" top="10px" left="10px">
          <Link to="/login">
            <Button colorScheme="blue">Register/Login</Button>
          </Link>
        </Box>
      )}

      <Flex align="center" h="100%">
        {revealedCard && (
          <Card emoji={revealedCard} onClick={() => setRevealedCard(null)} />
        )}
        {Array.from({ length: remainingCards }).map((_, index) => (
          <Card key={index} onClick={handleCardClick} />
        ))}
      </Flex>
    
      {gameOver && (
        <Box
          position="fixed"
          top="50%"
          left="30%"
          transform="translate(-50%, -50%)"
        >
          <Button onClick={handleRestart} color="red">Restart</Button>
        </Box>
      )}
      <ToastContainer />
      <Modal isOpen={isModalOpen} onClose={handleModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>You won!</ModalHeader>
          <ModalBody>
            <Text fontSize="3xl">Congratulations! 🎉</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleRestart}>
              Play Again
            </Button>
            <Button variant="ghost" onClick={handleModalClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

const Card = ({ emoji, onClick }) => {
  const handleClick = () => {
    onClick();
  };

  return (
    <Box
      bg="white"
      borderRadius="md"
      boxShadow="md"
      p={4}
      w="150px"
      h="200px"
      m={4}
      textAlign="center"
      cursor="pointer"
      onClick={handleClick}
    >
      <Flex justify="center" align="center" h="100%">
        <Text fontSize="3xl">{emoji ? emoji : '?'}</Text>
      </Flex>
    </Box>
  );
};

export default Play;
