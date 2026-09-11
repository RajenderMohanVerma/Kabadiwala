import { CircleAlert, Inbox, LoaderCircle } from 'lucide-react'

export function LoadingState({ label = 'Loading…' }) {
  return (
    <div className="fb-state">
      <div className="fb-spinner"><LoaderCircle size={32} /></div>
      <p>{label}</p>
    </div>
  )
}

export function ErrorState({ message = 'We could not load this section.' }) {
  return (
    <div className="fb-state fb-state--error">
      <div className="fb-icon"><CircleAlert size={28} /></div>
      <p>{message}</p>
    </div>
  )
}

export function EmptyState({ message = 'Nothing here yet.' }) {
  return (
    <div className="fb-state fb-state--empty">
      <div className="fb-icon"><Inbox size={28} /></div>
      <p>{message}</p>
    </div>
  )
}