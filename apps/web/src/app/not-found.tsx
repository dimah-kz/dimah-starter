import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { buttonVariants } from "@repo/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card"
import { cn } from "cn"
import { HomeIcon } from "lucide-react"

export default async function NotFound() {
  const t = await getTranslations("common")

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("notFound.title")}</CardTitle>
          <CardDescription>{t("notFound.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/" className={cn(buttonVariants())}>
            <HomeIcon data-icon="inline-start" />
            {t("goHome")}
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
