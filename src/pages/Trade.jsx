import React from 'react'
import TradeForm from '../../trade company components/TradeForm'

function Trade() {
  return (
      <main className="min-h-screen  py-10 "  style={{
        background: 'linear-gradient(to bottom right, #FFFFFF, #F2EFBB)',
      }}>
          <h2 style={{
            backgroundImage: 'linear-gradient(to right, #82AA57, #618943)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }} className="text-3xl font-extrabold mb-4 bg-clip-text text-transparent text-center">New Trade</h2>
      <TradeForm />
    </main>
    
  )
}

export default Trade
