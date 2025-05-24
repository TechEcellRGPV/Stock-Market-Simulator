import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SheetContext = React.createContext({
  open: false,
  setOpen: () => {},
})

const Sheet = ({ children }) => {
  const [open, setOpen] = React.useState(false)

  return (
    <SheetContext.Provider value={{ open, setOpen }}>
      {children}
    </SheetContext.Provider>
  )
}

const SheetTrigger = ({ children, asChild }) => {
  const { setOpen } = React.useContext(SheetContext)
  
  if (asChild) {
    return React.cloneElement(children, {
      onClick: () => setOpen(true),
    })
  }

  return (
    <button onClick={() => setOpen(true)}>
      {children}
    </button>
  )
}

const SheetContent = ({ children, side = "right", className = "" }) => {
  const { open, setOpen } = React.useContext(SheetContext)

  const variants = {
    right: {
      hidden: { x: "100%" },
      visible: { x: 0 },
    },
    left: {
      hidden: { x: "-100%" },
      visible: { x: 0 },
    },
    top: {
      hidden: { y: "-100%" },
      visible: { y: 0 },
    },
    bottom: {
      hidden: { y: "100%" },
      visible: { y: 0 },
    },
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.div
            className={`fixed z-50 bg-white shadow-lg ${className}`}
            style={{
              [side]: 0,
              top: side === "left" || side === "right" ? 0 : "auto",
              bottom: side === "top" ? "auto" : 0,
              width: side === "left" || side === "right" ? "auto" : "100%",
              height: side === "top" || side === "bottom" ? "auto" : "100%",
            }}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={variants[side]}
            transition={{ type: "spring", damping: 20 }}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export { Sheet, SheetTrigger, SheetContent } 