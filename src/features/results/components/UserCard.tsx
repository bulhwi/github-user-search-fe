'use client'

import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Link as MuiLink,
} from '@mui/material'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import BusinessIcon from '@mui/icons-material/Business'
import PeopleIcon from '@mui/icons-material/People'
import FolderIcon from '@mui/icons-material/Folder'
import { UserAvatar } from './UserAvatar'
import { formatNumber } from '@/shared/utils/formatNumber'
import type { GitHubUser } from '@/types'

export interface UserCardProps {
  user: GitHubUser
  className?: string
}

export function UserCard({ user, className }: UserCardProps) {
  const accountTypeColor = user.type === 'User' ? 'primary' : 'secondary'

  return (
    <Card className={className} sx={{ height: '100%' }} data-testid="user-card">
      <CardContent>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <UserAvatar
            src={user.avatar_url}
            alt={user.login}
            size={64}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <MuiLink
              href={user.html_url}
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              color="inherit"
            >
              <Typography variant="h6" noWrap>
                {user.name || user.login}
              </Typography>
            </MuiLink>
            <Typography variant="body2" color="text.secondary" noWrap>
              @{user.login}
            </Typography>
          </Box>
          <Chip
            label={user.type}
            color={accountTypeColor}
            size="small"
            sx={{ height: 24 }}
          />
        </Box>

        {user.bio && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {user.bio}
          </Typography>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {user.location && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LocationOnIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {user.location}
              </Typography>
            </Box>
          )}

          {user.company && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <BusinessIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {user.company}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <PeopleIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {formatNumber(user.followers)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <FolderIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {formatNumber(user.public_repos)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}
