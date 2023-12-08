import {
  createNativeStackNavigator,
  NativeStackNavigationProp
} from '@react-navigation/native-stack'
import { SignUp } from '@screens/SignUp'
import { SignIn } from '@screens/Signin'

//Definindo as tipagens para cada rota específica

type AuthRoutes = {
  signIn: undefined
  signUp: undefined
}

//Tipagem para ser exportada para cada rota a ser utilizada
//Propriedades de rotas de navegação de autenticação
//Para isso usamos o NativeStackNavigationProp, uma propriedade do react navigation
//Para criar uma tipagem específica de navegação

export type AuthNavigatorRoutesProps = NativeStackNavigationProp<AuthRoutes>

const { Navigator, Screen } = createNativeStackNavigator<AuthRoutes>()

export function AuthRoutes() {
  return (
    <Navigator screenOptions={{ headerShown: false }}>
      <Screen name="signIn" component={SignIn} />
      <Screen name="signUp" component={SignUp} />
    </Navigator>
  )
}
