import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TreePine } from 'lucide-react'

interface AuthCardProps {
  title: string
  description: string
  children: React.ReactNode
}

export default function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
            <TreePine className="w-7 h-7 text-primary-foreground" />
          </div>
        </div>
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="font-heading text-2xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </div>
    </div>
  )
}
