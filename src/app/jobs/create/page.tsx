import { redirect } from 'next/navigation'

export default function RedirectToNewWizard() {
  redirect('/dashboard/my-jobs/new')
}