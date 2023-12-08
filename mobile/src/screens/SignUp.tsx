import { useState } from 'react'
import {
  Center,
  Heading,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  VStack,
  useToast
} from 'native-base'

import { api } from '@services/api'

import LogoSvg from '@assets/logo.svg'
import BackgroundImg from '@assets/background.png'
import { Input } from '@components/Input'
import { Button } from '@components/Button'
import { Platform } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { AppError } from '@utils/appError'
import { useAuth } from '@hooks/useAuth'

type FormDataProps = {
  name: string
  email: string
  password: string
  password_confirm: string
}

const signUpSchema = yup.object({
  name: yup.string().required('Informe o nome.'),
  email: yup.string().required('Informe o e-mail.').email('E-mail inválido.'),
  password: yup
    .string()
    .required('Senha é obrigatória.')
    .min(8, 'A senha deve ter no mínimo 8 caracteres.'),
  password_confirm: yup
    .string()
    .required('Confirme sua senha.')
    .oneOf([yup.ref('password')], 'As senhas não coincidem.')
})

export function SignUp() {
  const [isLoading, setIsLoading] = useState(false)
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<FormDataProps>({
    resolver: yupResolver(signUpSchema)
  })
  const toast = useToast()
  const { signIn } = useAuth()
  const navigation = useNavigation()

  function handleGoBack() {
    navigation.goBack()
  }

  async function handleSignUp({ email, name, password }: FormDataProps) {
    //MANEIRA 1 DE FAZER REQUISIÇÃO COM O FETCH
    // try {
    //   await fetch('http://192.168.0.8:3333/users', {
    //     method: 'POST',
    //     headers: {
    //       Accept: 'application/json',
    //       'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({ name, email, password })
    //   })
    //     .then(response => response.json())
    //     .then(data => console.log(data))
    // } catch (error) {
    //   console.log(error)
    // }

    //MANEIRA 2 DE FAZER REQUISIÇÃO COM O AXIOS E TRATANDO O ERRO

    try {
      setIsLoading(true)
      await api.post('/users', { name, email, password })
      await signIn(email, password)
    } catch (error) {
      //Verificando se é uma instancia do nosso AppError
      //Se for, significa que este é um erro tratado
      const isAppError = error instanceof AppError

      const title = isAppError
        ? error.message
        : 'Não foi possível criar conta. Tente novamente mais tarde!'

      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500'
      })
    }
  }

  return (
    <KeyboardAvoidingView
      flex={1}
      enabled={Platform.OS === 'ios' ? true : false}
      behavior="padding"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <VStack flex={1} flexDir="column" justifyContent="space-between" px={5}>
          <Image
            //DefaultSource define por padrão uma imagem a ser carregada
            //Ao renderizar a página, isso ajuda no carregamento mais rápido da imagem
            source={BackgroundImg}
            alt="Pessoas treinando"
            resizeMode="contain"
            position="absolute"
            defaultSource={BackgroundImg}
          />
          <Center my={10}>
            <LogoSvg />

            <Text color="gray.100" fontSize="sm">
              Treine sua mente e seu corpo
            </Text>
          </Center>
          <Center>
            <Heading color="gray.100" fontSize="xl" mb={5} fontFamily="heading">
              Crie sua conta
            </Heading>

            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder="Nome"
                  onChangeText={onChange}
                  value={value}
                  errorMessage={errors.name?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder="E-mail"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onChangeText={onChange}
                  value={value}
                  errorMessage={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder="Senha"
                  secureTextEntry
                  onChangeText={onChange}
                  value={value}
                  autoCorrect={false}
                  errorMessage={errors.password?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="password_confirm"
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder="Confirme sua senha"
                  secureTextEntry
                  onChangeText={onChange}
                  value={value}
                  onSubmitEditing={handleSubmit(handleSignUp)}
                  returnKeyType="send"
                  autoCorrect={false}
                  errorMessage={errors.password_confirm?.message}
                />
              )}
            />
          </Center>
          <VStack w="full">
            <Button
              title="Criar e acessar"
              onPress={handleSubmit(handleSignUp)}
              mb={5}
              isLoading={isLoading}
            />
            <Button
              variant="outline"
              title="Voltar para o login"
              mb={5}
              onPress={handleGoBack}
            />
          </VStack>
        </VStack>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
