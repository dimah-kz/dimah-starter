import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { Button } from "@repo/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card"
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
          <Button render={<Link href="/" />} nativeButton={false}>
            <HomeIcon data-icon="inline-start" />
            {t("goHome")}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
