import { CircleAlert, Inbox, LoaderCircle } from 'lucide-react'

export function LoadingState({ label = 'Loading…' }) {
  return <div className="screen-state"><LoaderCircle className="spinner" size={28} /><p>{label}</p></div>
}

export function ErrorState({ message = 'We could not load this section.' }) {
  return <div className="screen-state"><CircleAlert size={28} /><p>{message}</p></div>
}

export function EmptyState({ message = 'Nothing here yet.' }) {
  return <div className="screen-state"><Inbox size={28} /><p>{message}</p></div>
}