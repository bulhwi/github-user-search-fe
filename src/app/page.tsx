import { Container, Typography } from '@mui/material'

export default function Home() {
  return (
    <Container maxWidth="xl" className="py-8">
      <Typography variant="h3" component="h1" gutterBottom>
        GitHub User Search
      </Typography>
      <Typography variant="body1">
        Search GitHub users with advanced filters
      </Typography>
    </Container>
  )
}