import React from 'react';
import SuccessIcon from 'react-native-vector-icons/Feather';
import { Container, SuccessText } from './styles';

const OrderFinished: React.FC = () => {
  return (
    <Container>
      <SuccessIcon name="thumbs-up" size={48} color="#39B100" />
      <SuccessText>Pedido Confirmado!</SuccessText>
    </Container>
  );
};

export default OrderFinished;
