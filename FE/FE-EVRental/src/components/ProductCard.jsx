import React from 'react'
import { Link } from 'react-router-dom'
import './ProductCard.css'

export default function ProductCard({ p }) {
  return (
    <article className="product-card">
      <div 
        className="product-thumb" 
        style={p.image ? { backgroundImage: `url(${p.image})` } : {}}
      />
      <div className="product-body">
        <h3>{p.name}</h3>
        <p className="short">{p.short}</p>
        <div className="price">
          {p.priceUnit.includes("VND") 
            ? `${p.price.toLocaleString()} VND` 
            : `$${p.price}`} 
          <span className="price-unit">{p.priceUnit.replace("VND ", "")}</span>
        </div>
        <div className="actions">
          <Link to={`/products/${p.id}`} className="btn">Xem chi tiết</Link>
          <button className="btn primary">Thuê ngay</button>
        </div>
      </div>
    </article>
  )
}
