import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ products: data || [] })
  } catch (error) {
    console.error('Error fetching products:', {
      message: error?.message || 'Unknown error',
      details: error?.toString(),
      hint: error?.hint || '',
      code: error?.code || ''
    })
    // Return empty array instead of error to prevent page breakage
    return NextResponse.json({ products: [] })
  }
}

export async function POST(request) {
  try {
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
      .insert([{
        name,
        productno,
        description,
        description2: description2 || '',
        productdetails: productdetails || '',
        price: parseFloat(price),
        image
      }])
      .select()

    if (error) throw error

    return NextResponse.json({ product: data[0] }, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
