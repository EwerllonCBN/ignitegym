import { Avatar, IAvatarProps } from 'native-base'

type Props = IAvatarProps & {
  size: number
}

export function UserPhoto({ size, ...rest }: Props) {
  return (
    <Avatar
      h={size}
      w={size}
      rounded="full"
      borderWidth={2}
      borderColor="gray.400"
      {...rest}
    />
  )
}
