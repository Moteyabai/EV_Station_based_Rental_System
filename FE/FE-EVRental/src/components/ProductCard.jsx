import React from 'react'
import { Link } from 'react-router-dom'
import './ProductCard.css'

export default function ProductCard({ p }) {
  return (
    <article className="product-card">
      <div className="product-thumb"/>
      <div className="product-body">
        <h3>{p.name}</h3>
        <p className="short">{p.short}</p>
        <div className="price">${p.price}</div>
        <div className="actions">
          <Link to={`/products/${p.id}`} className="btn">View</Link>
          <button className="btn primary">Rent</button>
        </div>
      </div>
    </article>
  )
}
