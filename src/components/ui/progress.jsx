import React from 'react'

const Progress = React.forwardRef(({ value, max = 100, className, ...props }, ref) => {
  const percentage = Math.min(Math.max(value, 0), max)

  return (
    <div
      ref={ref}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={percentage}
      className={`relative h-2 w-full overflow-hidden rounded-full ${className}`}
      style={props.style}
    >
      <div
        className="h-full transition-all duration-300 ease-in-out"
        style={{
          width: `${percentage}%`,
          backgroundColor: props.style?.['--progress-color']
        }}
      />
    </div>
  )
})
Progress.displayName = "Progress"

export { Progress } 