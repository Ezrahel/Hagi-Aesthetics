import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { productData } from '@/utils/index'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(request, { params }) {
  try {
    const { id } = await params

    // First, try to fetch from Supabase by UUID
    let product = null
    try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

      if (!error && data) {
        product = data
      }
    } catch (dbError) {
      // If database lookup fails, continue to fallback
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Database lookup failed, trying productData fallback')
      }
    }

    // If not found in database, try to find by slug in productData
    if (!product) {
      const productFromData = productData[id]
      if (productFromData) {
        // Create a product object with the slug as id and data from productData
        product = {
          id: id, // Use slug as id for consistency
          slug: id,
          name: productFromData.name,
          productno: productFromData.productno,
          description: productFromData.description,
          description2: productFromData.description2,
          productdetails: productFromData.productdetails,
          price: productFromData.price, // Ensure price from productData is used
          image: productFromData.image,
        }
      }
    }

    // If still not found, try searching Supabase by slug (if products have a slug field)
    if (!product) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('slug', id)
          .single()

        if (!error && data) {
          product = data
        }
      } catch (slugError) {
        // Continue to return 404
      }
    }

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Ensure price is a number and use productData price if available
    if (productData[id] && typeof productData[id].price === 'number') {
      product.price = productData[id].price
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Product not found' },
      { status: 404 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, productno, description, description2, productdetails, price, image } = body

    // Validate required fields
    if (!name || !productno || !description || !price || !image) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('products')
      .update({
        name,
        productno,
        description,
        description2: description2 || '',
        productdetails: productdetails || '',
        price: parseFloat(price),
        image,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()

    if (error) throw error

    return NextResponse.json({ product: data[0] })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
