import { Mail, Phone } from 'lucide-react'
import { company } from '@/lib/company'

export function PhoneLink({ phone, className = '' }: { phone: (typeof company.phones)[number]; className?: string }) {
  return (
    <a href={`tel:${phone.tel}`} className={`inline-flex items-center gap-2 ${className}`}>
      <Phone className="size-4 shrink-0" aria-hidden />
      {phone.display}
    </a>
  )
}

export function MailLink({ className = '' }: { className?: string }) {
  return (
    <a href={`mailto:${company.email}`} className={`inline-flex items-center gap-2 ${className}`}>
      <Mail className="size-4 shrink-0" aria-hidden />
      {company.email}
    </a>
  )
}
