import React from 'react'
import { useParams } from 'react-router-dom'
import products from '../data/products'
import './ProductDetail.css'

export default function ProductDetail(){
  const { id } = useParams()
  const p = products.find(x => x.id === id)
  if(!p) return <p>Product not found</p>

  return (
    <div className="product-page ev-container">
      <div className="product-main">
        <div className="product-media" />
        <div className="product-info">
          <h1>{p.name}</h1>
          <p className="short">{p.short}</p>
          <div className="price">${p.price}</div>
          <p className="desc">{p.description}</p>
          <div className="actions">
            <button className="btn primary">Rent now</button>
            <button className="btn">Add to wishlist</button>
          </div>
        </div>
      </div>
    </div>
  )
}
