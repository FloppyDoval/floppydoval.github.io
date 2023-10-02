import * as React from 'react'

//Importing `ChakraProvider` component
import { ChakraProvider } from '@chakra-ui/react'

function App() {
  // Wrapping ChakraProvider at the root of my app
  return (
    <ChakraProvider>
      <TheRestOfYourApplication />
    </ChakraProvider>
  )
}