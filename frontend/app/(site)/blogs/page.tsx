import { permanentRedirect } from 'next/navigation';

export default function BlogsPage() {
  permanentRedirect('/blog');
}