'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import type { ReviewerSuggestion } from '@/types'

interface Props {
  articleId: string
  eventId: string
  onSelect: (evaluatorId: string) => void
}

export function ReviewerSuggestionsPanel({ articleId, eventId, onSelect }: Props) {
  const [suggestions, setSuggestions] = useState<ReviewerSuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const data = await api.get<{ suggestions: ReviewerSuggestion[] }>(
          `/articles/${articleId}/reviewer-suggestions?eventId=${eventId}`
        )
        setSuggestions(data.suggestions ?? [])
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e)
        setError(msg)
      } finally {
        setLoading(false)
      }
    }

    loadSuggestions()
  }, [articleId, eventId])

  if (loading) return <p className="text-sm text-muted-foreground">Calculando sugestões de avaliadores...</p>
  if (error) return <p className="text-sm text-destructive">Erro ao carregar sugestões: {error}</p>
  if (suggestions.length === 0) return <p className="text-sm text-muted-foreground">Nenhum avaliador disponível para sugestão.</p>

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Avaliadores Sugeridos por IA</p>
      {suggestions.map((s) => (
        <div
          key={s.evaluatorId}
          className="flex items-center justify-between rounded border p-3 gap-2"
        >
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-sm font-medium truncate">{s.name}</span>
            <span className="text-xs text-muted-foreground truncate">{s.email}</span>
            {s.hasConflict && (
              <span className="text-xs text-destructive">
                ⚠ {s.conflictReason}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={s.score > 0.7 ? 'default' : 'secondary'}>
              {Math.round(s.score * 100)}%
            </Badge>
            <Button
              size="sm"
              variant={s.hasConflict ? 'outline' : 'default'}
              disabled={s.hasConflict}
              onClick={() => onSelect(s.evaluatorId)}
            >
              Selecionar
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
