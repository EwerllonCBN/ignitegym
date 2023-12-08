import { Button } from '@components/Button'
import { Input } from '@components/Input'
import { ScreenHeader } from '@components/ScreenHeader'
import { UserPhoto } from '@components/UserPhoto'
import {
  Center,
  ScrollView,
  Text,
  VStack,
  Skeleton,
  Divider,
  Heading,
  KeyboardAvoidingView,
  useToast
} from 'native-base'
import { useState } from 'react'
import { Alert, Platform, TouchableOpacity } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'
import { Controller, useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useAuth } from '@hooks/useAuth'
import { api } from '@services/api'
import { AppError } from '@utils/appError'
import defaultUserPhotoImg from '@assets/userPhotoDefault.png'

const PHOTO_SIZE = 33

type FormDataProps = {
  name: string
  email?: string | undefined
  old_password?: string
  password?: string | null | undefined
  password_confirm?: string | null | undefined
}

const profileScheme = yup.object({
  name: yup
    .string()
    .required('Informe um nome.')
    .max(20, 'O nome deve ter no máximo 20 caracteres.'),
  old_password: yup.string(),
  password: yup
    .string()
    .min(8, 'A senha deve ter no mínimo 8 caracteres.')
    .nullable()
    .transform(value => (!!value ? value : null)),
  password_confirm: yup
    .string()
    .nullable()
    .transform(value => (!!value ? value : null))
    .oneOf([yup.ref('password')], 'As senhas não coincidem.')
    .when('password', {
      is: (Field: string) => Field,
      then: schema =>
        schema
          .nullable()
          .transform(value => (!!value ? value : null))
          .required('Confirme sua senha.')
    })
})

export function Profile() {
  const [isUpdating, setIsUpdating] = useState(false)
  const [photoIsLoading, setPhotoIsLoading] = useState(false)

  const { user, updateUserProfile } = useAuth()

  const toast = useToast()
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<FormDataProps>({
    defaultValues: {
      name: user.name,
      email: user.email
    },
    resolver: yupResolver(profileScheme)
  })

  async function handleUserPhotoSelect() {
    setPhotoIsLoading(true)
    try {
      const photoSelected = await ImagePicker.launchImageLibraryAsync({
        //Com a propriedade MediaTypeOptions do ImagePicker
        //Podemos definir o tipo de conteudo que iremos acessar
        //Na galeria do usuário, se é All, videos ou imagens
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        //A qualidade do conteudo podemos definir com um tipo number
        quality: 1,
        //O aspecto da imagem, no nosso caso, 4x4
        aspect: [4, 4],
        //Habilitar a opção do usuário habilitar a imagem ao selecionar ela
        allowsEditing: true
      })
      //Se o usuario não selecionar nenhuma imagem, Cancela.
      if (photoSelected.canceled) {
        return
      }

      //Se foi de fato selecionado a imagem, utilizamos o File System
      //para buscar pelas informações da imagem e usar o tamanho
      //Para validar se o tamanho dela é = > 5MB
      if (photoSelected.assets[0].uri) {
        const photoInfo = await FileSystem.getInfoAsync(
          photoSelected.assets[0].uri
        )

        if (photoInfo.exists && photoInfo.size / 1024 / 1024 > 5) {
          //Utilizamos o Toast do native base como forma alternativa
          //de gerar alertas customizados para o usuário
          return toast.show({
            title: 'Essa imagem é muito grante. Escolha uma de até 5MB',
            placement: 'top',
            bgColor: 'red.500'
          })
        }

        //Por fim, atualizamos o estado setUserPhoto onde a imagem esta
        //Na uri
        const fileExtension = photoSelected.assets[0].uri.split('.').pop()

        const photoFile = {
          name: `${user.name}.${fileExtension}`.toLowerCase(),
          uri: photoSelected.assets[0].uri,
          type: `${photoSelected.assets[0].type}/${fileExtension}`
        } as any

        const userPhotoUploadForm = new FormData()

        userPhotoUploadForm.append('avatar', photoFile)

        const avatarUpdatedResponse = await api.patch(
          '/users/avatar',
          userPhotoUploadForm,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        )

        const userUpdated = user

        userUpdated.avatar = avatarUpdatedResponse.data.avatar

        updateUserProfile(userUpdated)

        toast.show({
          title: 'Foto atualizada!',
          placement: 'top',
          bgColor: 'green.500'
        })

        console.log(userUpdated)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setPhotoIsLoading(false)
    }
  }

  async function handleProfileUpdate(data: FormDataProps) {
    try {
      setIsUpdating(true)

      const userUpdated = user
      userUpdated.name = data.name

      await api.put('/users', data)

      await updateUserProfile(userUpdated)

      toast.show({
        title: 'Perfil atualizado com sucesso.',
        placement: 'top',
        bgColor: 'green.500'
      })
    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError
        ? error.message
        : 'Não foi possível atualizar os dados'

      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500'
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <VStack flex={1}>
      <ScreenHeader title="Perfil" />
      <KeyboardAvoidingView
        flex={1}
        enabled={Platform.OS === 'ios' ? true : false}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 36 }}>
          <Center mt={6} px={10}>
            {photoIsLoading ? (
              <Skeleton
                w={PHOTO_SIZE}
                h={PHOTO_SIZE}
                rounded="full"
                startColor="gray.600"
                endColor="gray.400"
              />
            ) : (
              <UserPhoto
                source={
                  user.avatar
                    ? { uri: `${api.defaults.baseURL}/avatar/${user.avatar}` }
                    : defaultUserPhotoImg
                }
                size={33}
              />
            )}
            <TouchableOpacity onPress={handleUserPhotoSelect}>
              <Text
                color="green.500"
                fontWeight="bold"
                fontSize="md"
                mt={2}
                mb={8}
              >
                Alterar foto
              </Text>
            </TouchableOpacity>

            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder="Nome"
                  bg="gray.600"
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
                  bg="gray.600"
                  onChangeText={onChange}
                  value={value}
                  isDisabled
                />
              )}
            />

            <Divider
              _light={{
                bg: 'gray.500'
              }}
              _dark={{
                bg: 'gray.300'
              }}
              mt={6}
            />

            <Heading
              fontFamily="heading"
              color="gray.200"
              fontSize="md"
              mb={2}
              alignSelf="flex-start"
              mt={4}
            >
              Alterar senha
            </Heading>

            <Controller
              control={control}
              name="old_password"
              render={({ field: { onChange } }) => (
                <Input
                  placeholder="Senha antiga"
                  bg="gray.600"
                  secureTextEntry
                  textContentType="none"
                  onChangeText={onChange}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange } }) => (
                <Input
                  placeholder="Nova Senha"
                  bg="gray.600"
                  secureTextEntry
                  textContentType="none"
                  onChangeText={onChange}
                  errorMessage={errors.password?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password_confirm"
              render={({ field: { onChange } }) => (
                <Input
                  placeholder="Confirme nova senha"
                  bg="gray.600"
                  secureTextEntry
                  onChangeText={onChange}
                  errorMessage={errors.password_confirm?.message}
                />
              )}
            />

            <Button
              isLoading={isUpdating}
              onPress={handleSubmit(handleProfileUpdate)}
              title="Atualizar"
              mt={4}
            />
          </Center>
        </ScrollView>
      </KeyboardAvoidingView>
    </VStack>
  )
}
