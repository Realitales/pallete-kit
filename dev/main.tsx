import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { router } from './router'
import '@lib/styles/index.css'
import './sandbox.css'

const root = document.getElementById('root')
if (!root) throw new Error('Missing #root element')

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
