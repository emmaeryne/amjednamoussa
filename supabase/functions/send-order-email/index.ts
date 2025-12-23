import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Zod schema for input validation
const OrderEmailSchema = z.object({
  orderId: z.string().min(1).max(100),
  customerEmail: z.string().email().max(200),
  customerName: z.string().min(1).max(100),
  customerPhone: z.string().min(8).max(20),
  customerAddress: z.string().min(1).max(500),
  customerCity: z.string().min(1).max(100),
  items: z.array(z.object({
    name: z.string().min(1).max(200),
    price: z.number().positive().max(100000),
    quantity: z.number().int().positive().max(100),
    size: z.string().max(50).optional(),
    color: z.string().max(50).optional()
  })).min(1).max(50),
  subtotal: z.number().nonnegative().max(1000000),
  deliveryFee: z.number().nonnegative().max(1000),
  discountAmount: z.number().nonnegative().max(1000000),
  promoCode: z.string().max(50).nullable().optional(),
  totalAmount: z.number().positive().max(1000000)
});

type OrderEmailRequest = z.infer<typeof OrderEmailSchema>;

// HTML escape function to prevent XSS/HTML injection
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\n/g, ' ')
    .replace(/\r/g, '');
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse and validate input
    const rawData = await req.json();
    const validationResult = OrderEmailSchema.safeParse(rawData);
    
    if (!validationResult.success) {
      console.error("Validation error:", validationResult.error.errors);
      return new Response(
        JSON.stringify({ error: "Invalid input data", details: validationResult.error.errors }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { orderId, customerEmail, customerName, customerPhone, customerAddress, customerCity, items, subtotal, deliveryFee, discountAmount, promoCode, totalAmount } = validationResult.data;
    
    // Verify calculated total matches provided total (prevent price manipulation)
    const calculatedSubtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const calculatedTotal = calculatedSubtotal + deliveryFee - discountAmount;
    if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
      console.error("Total amount mismatch:", { calculatedTotal, totalAmount });
      return new Response(
        JSON.stringify({ error: "Total amount mismatch" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const adminEmail = Deno.env.get("ADMIN_EMAIL") || "emna.awini.work@gmail.com";
    
    // Escape all user-provided content for safe HTML embedding
    const safeCustomerName = escapeHtml(customerName);
    const safeCustomerPhone = escapeHtml(customerPhone);
    const safeCustomerAddress = escapeHtml(customerAddress);
    const safeCustomerCity = escapeHtml(customerCity);
    const safeOrderId = escapeHtml(orderId.slice(0, 8).toUpperCase());
    const safePromoCode = promoCode ? escapeHtml(promoCode) : null;
    
    console.log("Processing order email for:", orderId);
    console.log("Customer:", safeCustomerName);
    console.log("Admin email:", adminEmail);

    // Build items HTML with escaped content
    const itemsHtml = items.map(item => {
      const safeName = escapeHtml(item.name);
      const safeSize = item.size ? escapeHtml(item.size) : '';
      const safeColor = item.color ? escapeHtml(item.color) : '';
      return `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee; font-family: Arial, sans-serif;">
          ${safeName}${safeSize ? ` <span style="color: #888;">(Taille: ${safeSize})</span>` : ''}${safeColor ? ` <span style="color: #888;">(${safeColor})</span>` : ''}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center; font-family: Arial, sans-serif;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-family: Arial, sans-serif;">${(item.price * item.quantity).toFixed(2)} DT</td>
      </tr>
    `;
    }).join('');

    // Build pricing summary with delivery and discount
    const pricingSummaryHtml = `
      <tr>
        <td colspan="2" style="padding: 8px 12px; color: #555;">Sous-total</td>
        <td style="padding: 8px 12px; text-align: right;">${subtotal.toFixed(2)} DT</td>
      </tr>
      <tr>
        <td colspan="2" style="padding: 8px 12px; color: #555;">Livraison</td>
        <td style="padding: 8px 12px; text-align: right;">${deliveryFee.toFixed(2)} DT</td>
      </tr>
      ${discountAmount > 0 ? `
      <tr>
        <td colspan="2" style="padding: 8px 12px; color: #4caf50;">Réduction${safePromoCode ? ` (${safePromoCode})` : ''}</td>
        <td style="padding: 8px 12px; text-align: right; color: #4caf50;">-${discountAmount.toFixed(2)} DT</td>
      </tr>
      ` : ''}
    `;

    // Customer confirmation email HTML
    const customerEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f5efe6; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #F5EFE6 0%, #ffffff 100%); border-bottom: 3px solid #CFA5A5;">
            <h1 style="color: #000; margin: 0; font-size: 32px; font-weight: 600; letter-spacing: 2px;">Namoussa</h1>
            <p style="color: #CFA5A5; margin: 8px 0 0; font-size: 14px; letter-spacing: 3px; text-transform: uppercase;">Prêt-à-porter Femme</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="width: 60px; height: 60px; background: #CFA5A5; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 30px;">✓</span>
              </div>
              <h2 style="color: #000; margin: 0; font-size: 24px;">Merci pour votre commande!</h2>
            </div>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 25px;">
              Bonjour <strong>${safeCustomerName}</strong>,<br><br>
              Votre commande <strong style="color: #CFA5A5;">#${safeOrderId}</strong> a bien été reçue et est en cours de traitement.
            </p>
            
            <!-- Order Summary -->
            <div style="background: #f9f9f9; border-radius: 12px; padding: 25px; margin: 25px 0;">
              <h3 style="margin: 0 0 20px; color: #000; font-size: 18px;">📦 Récapitulatif de la commande</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: #CFA5A5;">
                    <th style="padding: 12px; text-align: left; color: white; font-weight: 600;">Article</th>
                    <th style="padding: 12px; text-align: center; color: white; font-weight: 600;">Qté</th>
                    <th style="padding: 12px; text-align: right; color: white; font-weight: 600;">Prix</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  ${pricingSummaryHtml}
                  <tr style="border-top: 2px solid #CFA5A5;">
                    <td colspan="2" style="padding: 15px 12px; font-weight: bold; font-size: 16px;">Total à payer</td>
                    <td style="padding: 15px 12px; text-align: right; font-weight: bold; color: #CFA5A5; font-size: 20px;">${totalAmount.toFixed(2)} DT</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <!-- Payment Info -->
            <div style="background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%); padding: 20px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #ffc107;">
              <p style="margin: 0; font-weight: 600; color: #000;">💰 Paiement à la livraison</p>
              <p style="margin: 8px 0 0; font-size: 14px; color: #555;">Préparez le montant exact (${totalAmount.toFixed(2)} DT) pour faciliter la livraison.</p>
            </div>
            
            <p style="color: #555; line-height: 1.6;">
              Nous vous contacterons bientôt pour confirmer les détails de livraison.
            </p>
            
            <!-- Contact CTA -->
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #888; font-size: 14px; margin-bottom: 15px;">Des questions sur votre commande?</p>
              <a href="tel:+21655991961" style="display: inline-block; background: #CFA5A5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 30px; font-weight: 600;">
                📞 Appelez-nous: +216 55 991 961
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; padding: 25px; background: #000; color: #999; font-size: 12px;">
            <p style="margin: 0;">© 2024 Namoussa. Tous droits réservés.</p>
            <p style="margin: 8px 0 0;">Prêt-à-porter Femme - Tunisie</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Admin notification email HTML
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f0f0f0; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #000 0%, #333 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🛍️ Nouvelle Commande!</h1>
            <div style="margin-top: 15px; background: #CFA5A5; display: inline-block; padding: 10px 25px; border-radius: 25px;">
              <span style="font-size: 28px; font-weight: bold;">${totalAmount.toFixed(2)} DT</span>
            </div>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px;">
            <div style="background: #f9f9f9; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
              <h3 style="margin: 0 0 15px; color: #000; font-size: 16px;">📋 Commande #${safeOrderId}</h3>
              <p style="margin: 0; color: #888; font-size: 14px;">Reçue le ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              ${safePromoCode ? `<p style="margin: 8px 0 0; color: #4caf50; font-size: 14px;">🏷️ Code promo utilisé: <strong>${safePromoCode}</strong> (-${discountAmount.toFixed(2)} DT)</p>` : ''}
            </div>
            
            <!-- Customer Info -->
            <div style="background: #e3f2fd; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
              <h3 style="margin: 0 0 15px; color: #1565c0; font-size: 16px;">👤 Informations client</h3>
              <table style="width: 100%;">
                <tr>
                  <td style="padding: 5px 0; color: #555; width: 100px;">Nom:</td>
                  <td style="padding: 5px 0; font-weight: 600;">${safeCustomerName}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #555;">Email:</td>
                  <td style="padding: 5px 0;"><a href="mailto:${escapeHtml(customerEmail)}" style="color: #1565c0;">${escapeHtml(customerEmail)}</a></td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #555;">Téléphone:</td>
                  <td style="padding: 5px 0;"><a href="tel:${safeCustomerPhone}" style="color: #1565c0; font-weight: 600;">${safeCustomerPhone}</a></td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #555;">Adresse:</td>
                  <td style="padding: 5px 0;">${safeCustomerAddress}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #555;">Ville:</td>
                  <td style="padding: 5px 0; font-weight: 600;">${safeCustomerCity}</td>
                </tr>
              </table>
            </div>
            
            <!-- Order Items -->
            <div style="margin-bottom: 25px;">
              <h3 style="margin: 0 0 15px; color: #000; font-size: 16px;">📦 Articles commandés</h3>
              <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd; border-radius: 8px;">
                <thead>
                  <tr style="background: #f5f5f5;">
                    <th style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">Article</th>
                    <th style="padding: 12px; text-align: center; border-bottom: 1px solid #ddd;">Qté</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 1px solid #ddd;">Prix</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  ${pricingSummaryHtml}
                  <tr style="background: #CFA5A5; color: white;">
                    <td colspan="2" style="padding: 15px 12px; font-weight: bold;">TOTAL</td>
                    <td style="padding: 15px 12px; text-align: right; font-weight: bold; font-size: 18px;">${totalAmount.toFixed(2)} DT</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <!-- Payment Method -->
            <div style="background: #e8f5e9; padding: 15px 20px; border-radius: 8px; border-left: 4px solid #4caf50;">
              <p style="margin: 0; font-weight: 600; color: #2e7d32;">💰 Paiement à la livraison</p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; padding: 20px; background: #f5f5f5; color: #888; font-size: 12px;">
            <p style="margin: 0;">Namoussa Admin - Gestion des commandes</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send customer confirmation email
    console.log("Sending customer email to:", customerEmail);
    const customerEmailResponse = await resend.emails.send({
      from: "Namoussa <onboarding@resend.dev>",
      to: [customerEmail],
      subject: `✨ Confirmation de commande #${safeOrderId} - Namoussa`,
      html: customerEmailHtml,
    });
    console.log("Customer email sent:", customerEmailResponse);

    // Send admin notification email
    console.log("Sending admin email to:", adminEmail);
    const adminEmailResponse = await resend.emails.send({
      from: "Namoussa <onboarding@resend.dev>",
      to: [adminEmail],
      subject: `🛍️ Nouvelle Commande #${safeOrderId} - ${totalAmount.toFixed(2)} DT`,
      html: adminEmailHtml,
    });
    console.log("Admin email sent:", adminEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Order emails sent successfully",
        customerEmailId: customerEmailResponse.data?.id,
        adminEmailId: adminEmailResponse.data?.id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-order-email function:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
