import React from 'react'
import ProductCard from './ProductCard'
import './ProductList.css'

export default function ProductList({ products }) {
  return (
    <div className="product-grid">
      {products.map((p) => (
        <ProductCard key={p.id} p={p} />
      ))}
    </div>
  )
}
