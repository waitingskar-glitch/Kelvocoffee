import { useCart } from '@/context/cartContext'
import { preorderNote } from '@/config/site'
import { Button } from './ui/Button'
import { BellIcon, CheckIcon } from './ui/icons'
import { Spinner } from './ui/Spinner'
import type { Product, ProductVariant } from '@/types/shopify'

interface Props {
  product: Product
  variant: ProductVariant | undefined
  size?: 'sm' | 'md' | 'lg'
  variantStyle?: 'primary' | 'onDark'
  fullWidth?: boolean
  /** Opens the notify/preorder modal when the variant cannot be bought. */
  onRequestNotify: (product: Product, variant?: ProductVariant) => void
}

/**
 * The single add-to-cart control used across the page.
 *
 * Swaps to a notify/preorder action whenever Shopify says the variant is not
 * purchasable, so unavailable products still capture demand.
 */
export function AddToCartButton({
  product,
  variant,
  size = 'md',
  variantStyle = 'primary',
  fullWidth = true,
  onRequestNotify,
}: Props) {
  const { addItem, pendingVariantIds, confirmedVariantIds } = useCart()

  const unavailable = !variant || !variant.availableForSale
  const isPreorder = Boolean(variant?.isPreorder)
  const isPending = variant ? pendingVariantIds.has(variant.id) : false
  const isConfirmed = variant ? confirmedVariantIds.has(variant.id) : false

  if (unavailable) {
    return (
      <Button
        size={size}
        fullWidth={fullWidth}
        variant={variantStyle === 'onDark' ? 'onDarkOutline' : 'secondary'}
        onClick={() => onRequestNotify(product, variant)}
      >
        <BellIcon className="size-4" />
        Notify me
      </Button>
    )
  }

  return (
    <Button
      size={size}
      fullWidth={fullWidth}
      variant={variantStyle === 'onDark' ? 'onDark' : 'primary'}
      disabled={isPending}
      onClick={() => void addItem(variant.id, 1, isPreorder ? preorderNote() : undefined)}
    >
      {isPending ? (
        <>
          <Spinner />
          Adding…
        </>
      ) : isConfirmed ? (
        <>
          <CheckIcon className="size-4" />
          Added
        </>
      ) : isPreorder ? (
        'Preorder'
      ) : (
        'Add to cart'
      )}
    </Button>
  )
}
