import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useLayoutEffect,
} from 'react';
import { Alert, Image } from 'react-native';

import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import formatValue from '../../utils/formatValue';

import api from '../../services/api';

import {
  Container,
  Header,
  ScrollContainer,
  FoodsContainer,
  Food,
  FoodImageContainer,
  FoodContent,
  FoodTitle,
  FoodDescription,
  FoodPricing,
  AdditionalsContainer,
  Title,
  TotalContainer,
  AdittionalItem,
  AdittionalItemText,
  AdittionalQuantity,
  PriceButtonContainer,
  TotalPrice,
  QuantityContainer,
  FinishOrderButton,
  ButtonText,
  IconContainer,
} from './styles';
import SplashScreen from '../SplashScreen';

interface Params {
  id: number;
}

interface Extra {
  id: number;
  name: string;
  value: number;
  quantity: number;
}

interface Food {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  formattedPrice: string;
  extras: Extra[];
}

const FoodDetails: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [food, setFood] = useState({} as Food);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [foodQuantity, setFoodQuantity] = useState(1);

  const navigation = useNavigation();
  const route = useRoute();

  const routeParams = route.params as Params;
  const { id: foodId } = routeParams;

  useEffect(() => {
    async function loadIsFavorite(): Promise<void> {
      try {
        const response = await api.get(`favorites/${foodId}`);
        setIsFavorite(!!response.data);
      } catch {
        setIsFavorite(false);
      }
    }
    loadIsFavorite();
  }, [foodId]);

  useEffect(() => {
    async function loadFood(): Promise<void> {
      try {
        const response = await api.get(`foods/${foodId}`);
        const foods = response.data as Food;
        setFood({
          ...response.data,
          formattedPrice: formatValue(response.data.price),
        });
        setExtras(
          foods.extras.map((extra: Omit<Extra, 'quantity'>) => ({
            ...extra,
            quantity: 0,
          })),
        );
      } catch (error) {
        Alert.alert('Não foi possível carregar o prato');
      } finally {
        setIsLoading(false);
      }
    }

    loadFood();
  }, [foodId, routeParams]);

  function handleIncrementExtra(id: number): void {
    setExtras(
      extras.map(extra =>
        extra.id === id ? { ...extra, quantity: extra.quantity + 1 } : extra,
      ),
    );
  }

  function handleDecrementExtra(id: number): void {
    const findExtra = extras.find(extra => extra.id === id);
    if (!findExtra || findExtra.quantity === 0) return;
    setExtras(
      extras.map(extra =>
        extra.id === id ? { ...extra, quantity: extra.quantity - 1 } : extra,
      ),
    );
  }

  function handleIncrementFood(): void {
    setFoodQuantity(foodQuantity + 1);
  }

  function handleDecrementFood(): void {
    if (foodQuantity === 1) return;
    setFoodQuantity(foodQuantity - 1);
  }

  const toggleFavorite = useCallback(async () => {
    if (isFavorite) {
      await api.delete(`favorites/${food.id}`);
    } else {
      await api.post(`favorites/`, food);
    }
    setIsFavorite(!isFavorite);
  }, [food, isFavorite]);

  const cartTotal = useMemo(() => {
    let total = food.price * foodQuantity;

    total += extras.reduce((acc, extra) => {
      const { quantity, value } = extra;
      return acc + quantity * value;
    }, 0);

    return formatValue(total);
  }, [extras, food, foodQuantity]);

  async function handleFinishOrder(): Promise<void> {
    try {
      const {
        id: product_id,
        name,
        description,
        price,
        image_url: thumbnail_url,
      } = food;
      const extrasFiltered = extras.filter(extra => extra.quantity > 0);
      await api.post('orders', {
        product_id,
        name,
        description,
        price,
        thumbnail_url,
        extras: extrasFiltered,
      });

      navigation.goBack();
    } catch (error) {
      Alert.alert('Não foi possível finalizar o pedido');
    }
  }

  // Calculate the correct icon name
  const favoriteIconName = useMemo(
    () => (isFavorite ? 'favorite' : 'favorite-border'),
    [isFavorite],
  );

  useLayoutEffect(() => {
    // Add the favorite icon on the right of the header bar
    navigation.setOptions({
      headerRight: () => (
        <MaterialIcon
          name={favoriteIconName}
          size={24}
          color="#FFB84D"
          onPress={() => toggleFavorite()}
        />
      ),
    });
  }, [navigation, favoriteIconName, toggleFavorite]);

  return (
    <>
      {isLoading ? (
        <SplashScreen />
      ) : (
        <Container>
          <Header />

          <ScrollContainer>
            <FoodsContainer>
              <Food>
                <FoodImageContainer>
                  <Image
                    style={{ width: 327, height: 183 }}
                    source={{
                      uri: food.image_url,
                    }}
                  />
                </FoodImageContainer>
                <FoodContent>
                  <FoodTitle>{food.name}</FoodTitle>
                  <FoodDescription>{food.description}</FoodDescription>
                  <FoodPricing>{food.formattedPrice}</FoodPricing>
                </FoodContent>
              </Food>
            </FoodsContainer>
            <AdditionalsContainer>
              <Title>Adicionais</Title>
              {extras.map(extra => (
                <AdittionalItem key={extra.id}>
                  <AdittionalItemText>{extra.name}</AdittionalItemText>
                  <AdittionalQuantity>
                    <Icon
                      size={15}
                      color="#6C6C80"
                      name="minus"
                      onPress={() => handleDecrementExtra(extra.id)}
                      testID={`decrement-extra-${extra.id}`}
                    />
                    <AdittionalItemText testID={`extra-quantity-${extra.id}`}>
                      {extra.quantity}
                    </AdittionalItemText>
                    <Icon
                      size={15}
                      color="#6C6C80"
                      name="plus"
                      onPress={() => handleIncrementExtra(extra.id)}
                      testID={`increment-extra-${extra.id}`}
                    />
                  </AdittionalQuantity>
                </AdittionalItem>
              ))}
            </AdditionalsContainer>
            <TotalContainer>
              <Title>Total do pedido</Title>
              <PriceButtonContainer>
                <TotalPrice testID="cart-total">{cartTotal}</TotalPrice>
                <QuantityContainer>
                  <Icon
                    size={15}
                    color="#6C6C80"
                    name="minus"
                    onPress={handleDecrementFood}
                    testID="decrement-food"
                  />
                  <AdittionalItemText testID="food-quantity">
                    {foodQuantity}
                  </AdittionalItemText>
                  <Icon
                    size={15}
                    color="#6C6C80"
                    name="plus"
                    onPress={handleIncrementFood}
                    testID="increment-food"
                  />
                </QuantityContainer>
              </PriceButtonContainer>

              <FinishOrderButton onPress={() => handleFinishOrder()}>
                <ButtonText>Confirmar pedido</ButtonText>
                <IconContainer>
                  <Icon name="check-square" size={24} color="#fff" />
                </IconContainer>
              </FinishOrderButton>
            </TotalContainer>
          </ScrollContainer>
        </Container>
      )}
    </>
  );
};

export default FoodDetails;
