import { Center, ICenterProps, Heading, IHeadingProps } from 'native-base'

type Props = {
  title: string
}
export function ScreenHeader({ title, ...rest }: Props) {
  return (
    <Center bg="gray.600" pb={6} pt={16} {...rest}>
      <Heading fontFamily="heading" color="gray.100" fontSize="xl">
        {title}
      </Heading>
    </Center>
  )
}
