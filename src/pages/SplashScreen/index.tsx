import React from 'react';
import { Image } from 'react-native';

import { Container, BackgroundImage, Title } from './styles';

import Background from '../../assets/home-background.png';
import Logo from '../../assets/logo-splash.png';

const SplashScreen: React.FC = () => {
  return (
    <BackgroundImage
      source={Background}
      imageStyle={{
        width: 313,
        height: 427,
      }}
    >
      <Container>
        <Image source={Logo} />
        <Title>Carregando...</Title>
      </Container>
    </BackgroundImage>
  );
};

export default SplashScreen;
