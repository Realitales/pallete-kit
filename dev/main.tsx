import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import '../src/styles/index.css'
import './sandbox.css'

const root = document.getElementById('root')
if (!root) throw new Error('Missing #root element')

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
