// api/contacto.js
// Vercel Serverless Function - RaumChance KI GovTech Landing Page

export default async function handler(req, res) {
  // Solo permitir peticiones POST por seguridad
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Método ${req.method} no permitido` });
  }

  try {
    const { nombre, jurisdiccion, email, tramite } = req.body;

    // Validación básica de campos obligatorios
    if (!nombre || !jurisdiccion || !email) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: Nombre, Jurisdicción y Correo Electrónico.' });
    }

    // Registro del Lead en los logs del servidor
    console.log('Lead recibido para Diagnóstico Técnico:', {
      nombre,
      jurisdiccion,
      email,
      tramite: tramite || 'No especificado',
      fecha: new Date().toISOString()
    });

    // Envío automático de mail si están las variables configuradas
    if (process.env.RESEND_API_KEY && process.env.EMAIL_DESTINATARIO) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          // IMPORTANTE: Resend solo te dejará usar "onboarding@resend.dev" 
          // si no tenés un dominio propio verificado en su panel.
          from: 'RaumChance Landing <onboarding@resend.dev>', 
          to: process.env.EMAIL_DESTINATARIO,
          subject: `Diagnóstico RaumChance KI: ${jurisdiccion}`,
          html: `
            <h2>Nuevo Lead de Diagnóstico Técnico</h2>
            <p><strong>Nombre y Cargo:</strong> ${nombre}</p>
            <p><strong>Municipio o Jurisdicción:</strong> ${jurisdiccion}</p>
            <p><strong>Correo Electrónico Oficial:</strong> ${email}</p>
            <p><strong>Trámite Crítico Seleccionado:</strong> ${tramite || 'No especificado'}</p>
            <p><em>Enviado de forma segura a través del servidor de Vercel.</em></p>
          `
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error al enviar mail por Resend API:', errorText);
      } else {
        console.log('Email enviado con éxito a través de Resend.');
      }
    } else {
      console.warn('Falta configurar las variables de entorno para el envío de mails.');
    }

    // Responder con estado exitoso
    return res.status(200).json({
      success: true,
      message: 'Diagnóstico técnico solicitado correctamente.'
    });

  } catch (error) {
    console.error('Error interno en /api/contacto:', error);
    return res.status(500).json({ error: 'Hubo un error interno al procesar el formulario de diagnóstico.' });
  }
}