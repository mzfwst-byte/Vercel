'use client'

import dynamic from 'next/dynamic'

const Map = dynamic(() => import('./map-client'), {
  ssr: false
})

export default function Page() {
  return <Map />
}
