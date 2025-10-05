import { NextRequest, NextResponse } from 'next/server'
import { generateMagicLoginLink } from '@/services/customer-auth-service'
import { sendMagicLoginEmail } from '@/services/email-notification-service'
import { z } from 'zod'

const magicLoginRequestSchema = z.object({
  email: z.string().email('Geçerli bir e-mail adresi girin')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request data
    const validationResult = magicLoginRequestSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Geçersiz e-mail adresi',
        details: validationResult.error.errors
      }, { status: 400 })
    }

    const { email } = validationResult.data
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    console.log('🔑 Magic login link isteği:', email)

    // Magic link oluştur
    const result = await generateMagicLoginLink(email, baseUrl)

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 })
    }

    // E-mail gönder
    console.log('📧 Magic login link oluşturuldu:', result.loginUrl)
    
    // Magic login e-maili gönder
    const emailSent = await sendMagicLoginEmail(email, result.loginUrl!)
    
    if (!emailSent) {
      console.error('❌ Magic login e-maili gönderilemedi')
      return NextResponse.json({
        success: false,
        error: 'E-mail gönderilemedi. Lütfen tekrar deneyin.'
      }, { status: 500 })
    }
    
    console.log('✅ Magic login e-maili başarıyla gönderildi')

    return NextResponse.json({
      success: true,
      message: 'Giriş linki oluşturuldu ve e-mail gönderildi. E-mail kutunuzu kontrol edin.',
      // Development amaçlı - production'da kaldırılacak
      loginUrl: process.env.NODE_ENV === 'development' ? result.loginUrl : undefined
    })
  } catch (error: any) {
    console.error('Magic login error:', error)
    return NextResponse.json({
      success: false,
      error: 'Sunucu hatası: ' + (error.message || 'Bilinmeyen hata')
    }, { status: 500 })
  }
} 