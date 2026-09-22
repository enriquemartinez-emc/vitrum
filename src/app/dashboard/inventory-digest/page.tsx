import { SiteHeader } from "@/components/site-header"
import { InventoryDigestPanel } from "@/features/reports/components/inventory-digest-panel"
import { computeShortageDigest } from "@/features/reports/shortage-digest"

export default async function InventoryDigestPage() {
  const items = await computeShortageDigest()

  return (
    <>
      <SiteHeader title="Reorder Digest" />
      <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
        <p className="text-sm text-muted-foreground">
          What pending quotes would come up short on glass if approved right now.
        </p>
        <InventoryDigestPanel items={items} />
      </div>
    </>
  )
}
