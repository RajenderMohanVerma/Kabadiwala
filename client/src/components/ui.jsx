import { forwardRef } from 'react'

export const Button = forwardRef(function Button({ variant = 'primary', className = '', ...props }, ref) {
  return <button ref={ref} className={`button ${variant} ${className}`} {...props} />
})

export function Card({ children, className = '' }) {
  return <section className={`panel ${className}`}>{children}</section>
}

export function Badge({ children, tone = 'default' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}
