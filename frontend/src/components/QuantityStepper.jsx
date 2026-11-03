import Icon from './Icon'

export default function QuantityStepper({
  value,
  onDecrease,
  onIncrease,
  max,
  variant, // 'cart' renders "N in cart" label
  small = false,
}) {
  return (
    <div
      className={`stepper${variant === 'cart' ? ' stepper--cart' : ''}`}
      style={small ? { height: 'var(--control-sm)' } : undefined}
    >
      <button
        type="button"
        className="stepper__btn"
        onClick={onDecrease}
        aria-label="Decrease quantity"
      >
        <Icon name="minus" size={16} />
      </button>
      <span className="stepper__value">
        {variant === 'cart' ? `${value} in cart` : value}
      </span>
      <button
        type="button"
        className="stepper__btn"
        onClick={onIncrease}
        disabled={max != null && value >= max}
        aria-label="Increase quantity"
      >
        <Icon name="plus" size={16} />
      </button>
    </div>
  )
}
