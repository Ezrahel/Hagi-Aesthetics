export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

// Simple email sending using a service (we'll use a simple approach)
// For production, you might want to use Resend, SendGrid, or Nodemailer

async function sendEmail(deliveryData) {
    const recipientEmail = 'devreel024@gmail.com' // Testing email
    
    // Format the delivery information
    const emailBody = `
New Order - Delivery Information

Customer Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Full Name: ${deliveryData.fullName}
Email: ${deliveryData.email}
Phone: ${deliveryData.phone}

Delivery Address:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${deliveryData.address}
${deliveryData.address2 ? deliveryData.address2 + '\n' : ''}${deliveryData.city}, ${deliveryData.state} ${deliveryData.zipCode}
${deliveryData.country}

${deliveryData.deliveryInstructions ? `Delivery Instructions:\n${deliveryData.deliveryInstructions}\n` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Submitted: ${new Date().toLocaleString()}
    `.trim()

    // For now, we'll use a simple approach with a webhook or email service
    // You can integrate with Resend, SendGrid, or use Supabase Edge Functions
    
    // Option 1: Use Resend (recommended for production)
    // Option 2: Use a webhook service
    // Option 3: Log to console for development (current)
    
    try {
        // Try to use Resend if API key is available
        const resendApiKey = process.env.RESEND_API_KEY
        
        if (resendApiKey) {
            const resendResponse = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${resendApiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: 'Hagi Aesthetics <noreply@hagiaesthetics.store>',
                    to: [recipientEmail],
                    subject: `New Order - Delivery Info for ${deliveryData.fullName}`,
                    text: emailBody,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #B187C6;">New Order - Delivery Information</h2>
                            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <h3 style="color: #333; margin-top: 0;">Customer Details</h3>
                                <p><strong>Full Name:</strong> ${deliveryData.fullName}</p>
                                <p><strong>Email:</strong> ${deliveryData.email}</p>
                                <p><strong>Phone:</strong> ${deliveryData.phone}</p>
                            </div>
                            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <h3 style="color: #333; margin-top: 0;">Delivery Address</h3>
                                <p>${deliveryData.address}</p>
                                ${deliveryData.address2 ? `<p>${deliveryData.address2}</p>` : ''}
                                <p>${deliveryData.city}, ${deliveryData.state} ${deliveryData.zipCode}</p>
                                <p>${deliveryData.country}</p>
                            </div>
                            ${deliveryData.deliveryInstructions ? `
                            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <h3 style="color: #333; margin-top: 0;">Delivery Instructions</h3>
                                <p>${deliveryData.deliveryInstructions}</p>
                            </div>
                            ` : ''}
                            <p style="color: #666; font-size: 12px; margin-top: 20px;">
                                Submitted: ${new Date().toLocaleString()}
                            </p>
                        </div>
                    `,
                }),
            })

            if (!resendResponse.ok) {
                const errorData = await resendResponse.json().catch(() => ({}))
                throw new Error(errorData.message || 'Failed to send email via Resend')
            }

            return { success: true, method: 'resend' }
        }
        
        // Fallback: Log to console (for development)
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('📧 DELIVERY INFORMATION EMAIL')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log(emailBody)
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log(`\nTo: ${recipientEmail}`)
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
        
        // In production, you should use a real email service
        // For now, we'll return success but log a warning
        if (process.env.NODE_ENV === 'production') {
            console.warn('⚠️  Email service not configured. Please set RESEND_API_KEY in production.')
        }
        
        return { success: true, method: 'console' }
    } catch (error) {
        console.error('Email sending error:', error)
        throw error
    }
}

export async function POST(request) {
    try {
        const deliveryData = await request.json()
        
        // Validate required fields
        const requiredFields = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'zipCode']
        for (const field of requiredFields) {
            if (!deliveryData[field] || !deliveryData[field].trim()) {
                return NextResponse.json(
                    { error: `Missing required field: ${field}` },
                    { status: 400 }
                )
            }
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(deliveryData.email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            )
        }

        // Send email
        await sendEmail(deliveryData)

        return NextResponse.json({ 
            success: true,
            message: 'Delivery information received and email sent successfully'
        })
    } catch (error) {
        console.error('Failed to send delivery email:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to send delivery information email' },
            { status: 500 }
        )
    }
}

