import React from 'react'
import { PlayersPageView } from '@/views/PlayersPageView'
import { usePlayersPage } from '@/hooks/usePlayersPage'

export default function PlayersPage() {
  const logic = usePlayersPage()
  return <PlayersPageView {...logic} darkMode={true} />
}
