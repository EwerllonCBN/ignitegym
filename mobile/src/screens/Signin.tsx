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

import LogoSvg from '@assets/logo.svg'
import BackgroundImg from '@assets/background.png'
import { Input } from '@components/Input'
import { Button } from '@components/Button'
import { Platform } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { AuthNavigatorRoutesProps } from '@routes/auth.routes'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useAuth } from '@hooks/useAuth'
import { AppError } from '@utils/appError'
import { useState } from 'react'
type FormData = {
  email: string
  password: string
}

const signinScheme = yup.object({
  email: yup.string().required('Informe o e-mail').email('E-mail inválido'),
  password: yup.string().required('Informe a senha')
})
export function SignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({ resolver: yupResolver(signinScheme) })
  const { signIn } = useAuth()
  //Definindo as tipagens das nossas rotas no momento que a gentes estiver utilizando ela
  const navigation = useNavigation<AuthNavigatorRoutesProps>()
  const toast = useToast()
  function handleNewAccount() {
    navigation.navigate('signUp')
  }

  async function handleSignIn({ email, password }: FormData) {
    //Trabalhando no tratamento de excessão no método de signin
    try {
      setIsLoading(true)
      await signIn(email, password)
    } catch (error) {
      //Verificando se é uma instancia do nosso AppError
      //Se for, ele se torna um Booleano

      const title =
        error instanceof AppError
          ? error.message
          : 'Não foi possível entrar. Tente novamente mais tarde'

      setIsLoading(false)
      console.log('erro', error)
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
            source={BackgroundImg}
            alt="Pessoas treinando"
            resizeMode="contain"
            position="absolute"
            defaultSource={BackgroundImg}
          />
          <Center my={20}>
            <LogoSvg />

            <Text color="gray.100" fontSize="sm">
              Treine sua mente e seu corpo
            </Text>
          </Center>

          <Center>
            <Heading fontFamily="heading" color="gray.100" fontSize="xl" mb={6}>
              Acesse sua conta
            </Heading>

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder="E-mail"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                  onSubmitEditing={handleSubmit(handleSignIn)}
                  errorMessage={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <Input
                  onChangeText={onChange}
                  value={value}
                  placeholder="Senha"
                  secureTextEntry
                  onSubmitEditing={handleSubmit(handleSignIn)}
                  errorMessage={errors.password?.message}
                />
              )}
            />

            <Button
              isLoading={isLoading}
              onPress={handleSubmit(handleSignIn)}
              title="Acessar"
            />
          </Center>

          <Center mt={10} mb={5}>
            <Text color="gray.100" fontSize="sm" mb={3} fontFamily="body">
              Ainda não tem acesso?
            </Text>
            <Button
              variant="outline"
              title="Criar conta"
              onPress={handleNewAccount}
            />
          </Center>
        </VStack>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
