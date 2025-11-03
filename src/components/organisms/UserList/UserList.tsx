'use client'

import { Grid, Typography, Box, CircularProgress } from '@mui/material'
import { UserCard } from '@/components/organisms/UserCard'
import type { GitHubUser, LoadingState } from '@/types'

export interface UserListProps {
  users: GitHubUser[]
  loading: LoadingState
  error: string | null
  className?: string
}

export function UserList({ users, loading, error, className }: UserListProps) {
  if (loading === 'loading' && users.length === 0) {
    return (
      <Box
        className={className}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box className={className} sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="error" gutterBottom>
          Error
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {error}
        </Typography>
      </Box>
    )
  }

  if (users.length === 0) {
    return (
      <Box className={className} sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No results found
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Try adjusting your search query or filters
        </Typography>
      </Box>
    )
  }

  return (
    <Box className={className}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Found {users.length} users
      </Typography>
      <Grid container spacing={3}>
        {users.map((user) => (
          <Grid item key={user.id} xs={12} sm={6} md={4} lg={3}>
            <UserCard user={user} />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
