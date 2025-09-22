import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import products from '../data/products'
import './ProductDetail.css'

export default function ProductDetail(){
  const { id } = useParams()
  const p = products.find(x => x.id === id)
  const [activeImage, setActiveImage] = useState(0)
  
  if(!p) return <p>Product not found</p>

  return (
    <div className="product-page ev-container">
      <div className="product-main">
        <div className="product-media">
          <div 
            className="product-image" 
            style={p.images && p.images.length > 0 ? { backgroundImage: `url(${p.images[activeImage]})` } : {}}
          />
          {p.images && p.images.length > 0 && (
            <div className="product-thumbnails">
              {p.images.map((img, index) => (
                <div 
                  key={index}
                  className={`product-thumbnail ${activeImage === index ? 'active' : ''}`}
                  style={{ backgroundImage: `url(${img})` }}
                  onClick={() => setActiveImage(index)}
                />
              ))}
            </div>
          )}
        </div>
        <div className="product-info">
          <h1>{p.name}</h1>
          <p className="short">{p.short}</p>
          <div className="price">${p.price} <span className="price-unit">{p.priceUnit}</span></div>
          <p className="desc">{p.description}</p>
          
          {p.specs && (
            <div className="specs">
              <h3>Specifications</h3>
              <ul>
                {Object.entries(p.specs).map(([key, value]) => (
                  <li key={key}><strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}</li>
                ))}
              </ul>
            </div>
          )}
          
          {p.features && p.features.length > 0 && (
            <div className="features">
              <h3>Features</h3>
              <ul>
                {p.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="actions">
            <button className="btn primary">Rent now</button>
            <button className="btn">Add to wishlist</button>
          </div>
        </div>
      </div>
    </div>
  )
}
