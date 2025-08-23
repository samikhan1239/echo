"use client"

import * as React from "react"

import { ConvexProvider, ConvexReactClient} from "convex/react"
import {Provider } from "jotai";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL || "")

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConvexProvider client = {convex}>
   <Provider>
      {children}
      </Provider>
      </ConvexProvider>
 
  )
}
